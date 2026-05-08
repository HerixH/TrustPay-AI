//! TrustPay AI escrow: lamports vaulted on a program PDA, mutual release or arbiter dispute resolution.
//!
//! Deploy on **devnet** and run `anchor keys sync` so `declare_id!` matches your keypair.
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer as system_transfer, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn");

#[program]
pub mod trustpay_escrow {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        deal_seed: [u8; 8],
        amount_lamports: u64,
        arbiter: Pubkey,
    ) -> Result<()> {
        require!(amount_lamports > 0, EscrowError::ZeroAmount);
        let escrow = &mut ctx.accounts.escrow;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        escrow.arbiter = arbiter;
        escrow.amount = amount_lamports;
        escrow.deal_seed = deal_seed;
        escrow.bump_escrow = ctx.bumps.escrow;
        escrow.bump_vault = ctx.bumps.vault;
        escrow.status = EscrowStatus::Pending;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Pending, EscrowError::BadState);
        require_keys_eq!(ctx.accounts.buyer.key(), escrow.buyer, EscrowError::Unauthorized);

        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        system_transfer(cpi, escrow.amount)?;

        escrow.status = EscrowStatus::Funded;
        Ok(())
    }

    pub fn release_mutual(ctx: Context<ReleaseMutual>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Funded, EscrowError::BadState);
        require_keys_eq!(ctx.accounts.buyer.key(), escrow.buyer, EscrowError::Unauthorized);
        require_keys_eq!(ctx.accounts.seller.key(), escrow.seller, EscrowError::Unauthorized);

        let vault_ai = ctx.accounts.vault.to_account_info();
        require!(
            vault_ai.lamports() >= escrow.amount,
            EscrowError::InsufficientVault
        );

        **vault_ai.try_borrow_mut_lamports()? -= escrow.amount;
        **ctx
            .accounts
            .seller
            .to_account_info()
            .try_borrow_mut_lamports()? += escrow.amount;

        escrow.status = EscrowStatus::Released;
        Ok(())
    }

    pub fn open_dispute(ctx: Context<OpenDispute>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Funded, EscrowError::BadState);
        let k = ctx.accounts.participant.key();
        require!(
            k == escrow.buyer || k == escrow.seller,
            EscrowError::Unauthorized
        );
        escrow.status = EscrowStatus::Disputed;
        Ok(())
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>, pay_seller: bool) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::Disputed, EscrowError::BadState);
        require_keys_eq!(ctx.accounts.arbiter.key(), escrow.arbiter, EscrowError::Unauthorized);

        let vault_ai = ctx.accounts.vault.to_account_info();
        require!(
            vault_ai.lamports() >= escrow.amount,
            EscrowError::InsufficientVault
        );

        let recipient = if pay_seller {
            ctx.accounts.seller.to_account_info()
        } else {
            ctx.accounts.buyer.to_account_info()
        };

        **vault_ai.try_borrow_mut_lamports()? -= escrow.amount;
        **recipient.try_borrow_mut_lamports()? += escrow.amount;

        escrow.status = EscrowStatus::Released;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EscrowStatus {
    Pending,
    Funded,
    Released,
    Disputed,
}

#[account]
pub struct EscrowState {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub arbiter: Pubkey,
    pub amount: u64,
    pub deal_seed: [u8; 8],
    pub bump_escrow: u8,
    pub bump_vault: u8,
    pub status: EscrowStatus,
}

impl EscrowState {
    /// Serialized account data excluding 8-byte Anchor discriminator.
    pub const INIT_SPACE: usize =
        32 + 32 + 32 + 8 + 8 + 1 + 1 + 1 /* EscrowStatus as u8 */;
}

#[derive(Accounts)]
#[instruction(deal_seed: [u8; 8], amount_lamports: u64, arbiter: Pubkey)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: seller pubkey only at init; may fund later from another wallet in full product
    pub seller: UncheckedAccount<'info>,
    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowState::INIT_SPACE,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref(), deal_seed.as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowState>,
    #[account(
        init,
        payer = buyer,
        space = 8,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    /// CHECK: vault PDA holds lamports only
    pub vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.buyer.as_ref(), escrow.seller.as_ref(), escrow.deal_seed.as_ref()],
        bump = escrow.bump_escrow
    )]
    pub escrow: Account<'info, EscrowState>,
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump = escrow.bump_vault
    )]
    /// CHECK: vault
    pub vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseMutual<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.buyer.as_ref(), escrow.seller.as_ref(), escrow.deal_seed.as_ref()],
        bump = escrow.bump_escrow
    )]
    pub escrow: Account<'info, EscrowState>,
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump = escrow.bump_vault
    )]
    /// CHECK: vault
    pub vault: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct OpenDispute<'info> {
    #[account(mut)]
    pub participant: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.buyer.as_ref(), escrow.seller.as_ref(), escrow.deal_seed.as_ref()],
        bump = escrow.bump_escrow
    )]
    pub escrow: Account<'info, EscrowState>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub arbiter: Signer<'info>,
    /// CHECK: buyer receives lamports if pay_seller == false
    #[account(mut, address = escrow.buyer)]
    pub buyer: UncheckedAccount<'info>,
    /// CHECK: seller receives lamports if pay_seller == true
    #[account(mut, address = escrow.seller)]
    pub seller: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.buyer.as_ref(), escrow.seller.as_ref(), escrow.deal_seed.as_ref()],
        bump = escrow.bump_escrow
    )]
    pub escrow: Account<'info, EscrowState>,
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump = escrow.bump_vault
    )]
    /// CHECK: vault
    pub vault: UncheckedAccount<'info>,
}

#[error_code]
pub enum EscrowError {
    #[msg("Amount must be > 0")]
    ZeroAmount,
    #[msg("Invalid escrow status for this instruction")]
    BadState,
    #[msg("Signer not authorized")]
    Unauthorized,
    #[msg("Vault balance too low")]
    InsufficientVault,
}

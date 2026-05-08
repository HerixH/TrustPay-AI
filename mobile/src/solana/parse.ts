/** Escrow account: 8-byte Anchor disc + borsh EscrowState; status is last byte. */

export const EscrowStatus = {
  Pending: 0,
  Funded: 1,
  Released: 2,
  Disputed: 3,
} as const;

export function escrowStatusLabel(raw: number): string {
  switch (raw) {
    case 0:
      return "Pending";
    case 1:
      return "Funded";
    case 2:
      return "Released";
    case 3:
      return "Disputed";
    default:
      return `unknown(${raw})`;
  }
}

export function readEscrowStatus(data: Uint8Array | null): number | null {
  if (!data || data.length < 123) return null;
  return data[122];
}

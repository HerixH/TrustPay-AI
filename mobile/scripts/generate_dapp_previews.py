"""
Generate Solana dApp Store preview images — same portrait size, <3MB PNG each.
Requires: Pillow (already used elsewhere in toolchain).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
OUT_DIR = Path(__file__).resolve().parent.parent / "assets"


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


BG = hex_rgb("#030014")
BG_ELEV = hex_rgb("#06051f")
SURFACE = hex_rgb("#0c0622")
SURFACE_RAISED = hex_rgb("#140b32")
TEXT = hex_rgb("#f8f7ff")
TEXT_MUTED = hex_rgb("#aca6d4")
TEXT_FAINT = hex_rgb("#6e6894")
PURPLE = hex_rgb("#9945FF")
MINT = hex_rgb("#14F195")
LINE = hex_rgb("#3d2f7a")


def try_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    for root in (
        Path(r"C:\Windows\Fonts") / name,
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
        if bold
        else Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ):
        try:
            if root.exists():
                return ImageFont.truetype(str(root), size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def linear_gradient_vertical(
    top: tuple[int, int, int],
    bot: tuple[int, int, int],
    height: int,
    width: int,
) -> Image.Image:
    im = Image.new("RGB", (width, height))
    px = im.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(top[0] * (1 - t) + bot[0] * t)
        g = int(top[1] * (1 - t) + bot[1] * t)
        b = int(top[2] * (1 - t) + bot[2] * t)
        for x in range(width):
            px[x, y] = (r, g, b)
    return im


def overlay_status_bar(draw: ImageDraw.ImageDraw, font: ImageFont.ImageFont) -> None:
    draw.rounded_rectangle((48, 36, W - 48, 104), radius=26, fill=SURFACE)
    draw.text((88, 58), "9:41", fill=TEXT, font=font)
    # fake signal / wifi / battery blobs
    cx = W - 120
    for _ in range(3):
        draw.rounded_rectangle((cx, 62, cx + 18, 78), radius=6, fill=TEXT_FAINT)
        cx -= 34


def pill_button(
    draw: ImageDraw.ImageDraw,
    bbox: tuple[int, int, int, int],
    label: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    outline: tuple[int, int, int] | None = None,
) -> None:
    draw.rounded_rectangle(bbox, radius=28, fill=fill, outline=outline, width=2 if outline else 0)
    tw, th = draw.textbbox((0, 0), label, font=font)[2:]
    x = bbox[0] + (bbox[2] - bbox[0] - tw) // 2
    y = bbox[1] + (bbox[3] - bbox[1] - th) // 2
    draw.text((x, y), label, fill=TEXT, font=font)


def card(
    draw: ImageDraw.ImageDraw,
    bbox: tuple[int, int, int, int],
) -> None:
    draw.rounded_rectangle(bbox, radius=26, fill=SURFACE, outline=LINE, width=1)


def screen1(draw: ImageDraw.ImageDraw, title_f: ImageFont.ImageFont, body_f: ImageFont.ImageFont, small_f: ImageFont.ImageFont) -> None:
    overlay_status_bar(draw, small_f)
    y = 180
    draw.text((72, y), "TrustPay AI", fill=TEXT, font=title_f)
    y += 110
    draw.text((72, y), "Smart escrow · Safer P2P", fill=TEXT_MUTED, font=body_f)
    y += 72
    draw.text((72, y), "on Solana", fill=PURPLE, font=body_f)

    y = 540
    pill_button(draw, (72, y, W - 72, y + 96), "New escrow deal", body_f, PURPLE)
    y += 124
    pill_button(draw, (72, y, W - 72, y + 96), "Wallets & keys", body_f, SURFACE_RAISED, LINE)
    y += 160
    card(draw, (72, y, W - 72, y + 200))
    draw.text((112, y + 36), "Active deals", fill=TEXT, font=body_f)
    draw.text((112, y + 100), "Pull to refresh — devnet RPC", fill=TEXT_FAINT, font=small_f)


def screen2(draw: ImageDraw.ImageDraw, title_f: ImageFont.ImageFont, body_f: ImageFont.ImageFont, small_f: ImageFont.ImageFont) -> None:
    overlay_status_bar(draw, small_f)
    draw.text((72, 160), "Deals", fill=TEXT, font=title_f)
    draw.text((72, 278), "Your escrow workspaces", fill=TEXT_MUTED, font=small_f)

    y = 380
    for i, status in enumerate(("Funded · Awaiting delivery", "Open · Invite counterparty", "Released · Mutual close")):
        card(draw, (72, y, W - 72, y + 188))
        draw.rounded_rectangle((96, y + 32, 108, y + 156), radius=6, fill=MINT if i == 0 else PURPLE)
        draw.text((132, y + 40), f"Desk setup #{301 + i}", fill=TEXT, font=body_f)
        draw.text((132, y + 100), status, fill=TEXT_FAINT if i else MINT, font=small_f)
        draw.text((W - 200, y + 72), "•••", fill=TEXT_FAINT, font=body_f)
        y += 220


def screen3(draw: ImageDraw.ImageDraw, title_f: ImageFont.ImageFont, body_f: ImageFont.ImageFont, small_f: ImageFont.ImageFont) -> None:
    overlay_status_bar(draw, small_f)
    draw.text((72, 160), "Deal chat", fill=TEXT, font=title_f)
    draw.text((72, 278), "AI-assisted risk cues", fill=TEXT_MUTED, font=small_f)

    y = 400
    # incoming bubble
    card(draw, (72, y, W - 200, y + 120))
    draw.text((112, y + 44), "\"Can you wire the full amount first?\"", fill=TEXT, font=small_f)

    y += 200
    # risk banner
    draw.rounded_rectangle((72, y, W - 72, y + 100), radius=24, outline=hex_rgb("#fbbf24"), width=2)
    draw.text((112, y + 36), "Signal: unusually urgent payment language", fill=hex_rgb("#fbbf24"), font=small_f)

    y += 160
    # reply bubble right-aligned style (mint bar)
    draw.rounded_rectangle((220, y, W - 72, y + 130), radius=26, fill=SURFACE_RAISED, outline=MINT)
    draw.text((260, y + 48), "Escrow protects both sides.", fill=TEXT, font=body_f)


def screen4(draw: ImageDraw.ImageDraw, title_f: ImageFont.ImageFont, body_f: ImageFont.ImageFont, small_f: ImageFont.ImageFont) -> None:
    overlay_status_bar(draw, small_f)
    draw.text((72, 160), "Wallet", fill=TEXT, font=title_f)
    draw.text((72, 278), "Sign with your Solana identity", fill=TEXT_MUTED, font=small_f)

    y = 420
    card(draw, (72, y, W - 72, y + 340))
    draw.text((112, y + 48), "Connected", fill=MINT, font=body_f)
    draw.text((112, y + 120), "7x…Kp3m • devnet", fill=TEXT_FAINT, font=small_f)
    draw.text((112, y + 200), "Program: trustpay_escrow", fill=TEXT_MUTED, font=small_f)

    y += 400
    pill_button(draw, (72, y, W - 72, y + 98), "Copy public key", body_f, SURFACE_RAISED, LINE)
    y += 136
    draw.text((72, y), "Initialize · Deposit · Release · Dispute", fill=TEXT_FAINT, font=small_f)


def build_canvas() -> Image.Image:
    return linear_gradient_vertical(BG, BG_ELEV, H, W)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    title_f = try_font(72, bold=True)
    body_f = try_font(40)
    small_f = try_font(30)

    painters = (screen1, screen2, screen3, screen4)
    for i, paint in enumerate(painters, start=1):
        base = build_canvas()
        draw = ImageDraw.Draw(base)
        paint(draw, title_f, body_f, small_f)
        path = OUT_DIR / f"dapp-preview-{i}.png"
        base.save(path, format="PNG", optimize=True)
        kb = path.stat().st_size // 1024
        print(f"Wrote {path} ({W}x{H}) ~{kb} KB")


if __name__ == "__main__":
    main()

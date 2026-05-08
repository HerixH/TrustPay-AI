import { readEscrowStatus, escrowStatusLabel } from "../parse";

describe("parse", () => {
  it("reads status byte at fixed escrow layout offset", () => {
    const data = new Uint8Array(130);
    data[122] = 3;
    expect(readEscrowStatus(data)).toBe(3);
    expect(escrowStatusLabel(3)).toBe("Disputed");
  });

  it("returns null for short data", () => {
    expect(readEscrowStatus(new Uint8Array(50))).toBeNull();
  });

  it("labels known statuses", () => {
    expect(escrowStatusLabel(0)).toBe("Pending");
    expect(escrowStatusLabel(1)).toBe("Funded");
    expect(escrowStatusLabel(2)).toBe("Released");
    expect(escrowStatusLabel(99)).toBe("unknown(99)");
  });
});

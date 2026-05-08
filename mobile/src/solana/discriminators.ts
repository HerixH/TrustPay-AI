/** Anchor SHA256("global:<name>")[0..8] — must match `programs/trustpay_escrow`. */
export const IX = {
  initialize: Uint8Array.from([175, 175, 109, 31, 13, 152, 155, 237]),
  deposit: Uint8Array.from([242, 35, 198, 137, 82, 225, 242, 182]),
  releaseMutual: Uint8Array.from([187, 93, 90, 232, 63, 61, 5, 134]),
  openDispute: Uint8Array.from([137, 25, 99, 119, 23, 223, 161, 42]),
  resolveDispute: Uint8Array.from([231, 6, 202, 6, 96, 103, 12, 230]),
} as const;

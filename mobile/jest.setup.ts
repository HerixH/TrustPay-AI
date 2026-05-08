import { Buffer } from "buffer";

// @solana/web3.js in Node/Jest expects Buffer
(global as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;

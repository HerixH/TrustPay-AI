import "react-native-get-random-values";
import { Buffer } from "buffer";

// @solana/web3.js expects Buffer in React Native
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Buffer = Buffer;

import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);

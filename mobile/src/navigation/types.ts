import type { NavigatorScreenParams } from "@react-navigation/native";

/** Stack inside the Home tab — keeps bottom tabs visible on deals / wallets. */
export type HomeStackParamList = {
  Landing: undefined;
  Deals: undefined;
  Wallet: undefined;
  DealCreate: undefined;
  DealDetail: { dealId: string };
};

/** Root is bottom tabs; Home hosts `HomeStackParamList`. */
export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Escrow: undefined;
  Live: undefined;
};

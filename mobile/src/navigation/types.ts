/** Bottom tabs inside `MainTabs`. */
export type RootTabParamList = {
  Landing: undefined;
  Escrow: undefined;
  Live: undefined;
};

/** Root stack: marketing tabs + deal / wallet flows from the backend app. */
export type RootStackParamList = {
  MainTabs: undefined;
  Deals: undefined;
  Wallet: undefined;
  DealCreate: undefined;
  DealDetail: { dealId: string };
};

export const TAB_ITEMS = {
  CREATE_OPTIONS: "create-options",
  MANAGE_LIQUIDITY: "manage-liquidity",
  OPTIONS_HISTORY: "options-history",
  FAUCET: "faucet",
} as const;

export type TabItem = (typeof TAB_ITEMS)[keyof typeof TAB_ITEMS];

export interface FormCreateOption {
  optionType: string;
  strikePrice: string;
  duration: number;
  size: number;
  market: string;
}

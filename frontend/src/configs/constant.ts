import { TAB_ITEMS, type FormCreateOption, type TabItem } from "@/types";
import { DropletsIcon, HistoryIcon, SquareMenuIcon } from "lucide-react";

export const LIST_TABS: Array<{
  key: TabItem;
  label: string;
  icon: React.FC;
  path: string;
}> = [
  {
    key: TAB_ITEMS.CREATE_OPTIONS,
    label: "Create Options",
    icon: SquareMenuIcon,
    path: "/",
  },
  {
    key: TAB_ITEMS.MANAGE_LIQUIDITY,
    label: "Manage Liquidity",
    icon: DropletsIcon,
    path: "/manage-liquidity",
  },
  {
    key: TAB_ITEMS.OPTIONS_HISTORY,
    label: "History",
    icon: HistoryIcon,
    path: "/options-history",
  },
];

export const DURATION_OPTIONS = [
  { value: 1, label: "1 Day" },
  { value: 3, label: "3 Days" },
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
];

export const NEXOAR_CONTRACT_ADDRESS =
  "STWHP9XFF0H1KGMNAE06BYZ59BJRWANFQ5V9QYT6";

export const NEXOAR_CONTRACT_NAME = {
  NEXOAR_PRICING: "nexoar-pricing-v1-6-0",
  NEXOAR_USDA: "mock-usda-v1-6-0",
  NEXOAR_CORE: "nexoar-v1-6-0",
  NEXOAR_LIQUIDITY: "liquidity-manager-v1-6-0",
} as const;

export const PRECISION = 1_000_000;

export const DEFAULT_FORM_VALUES: FormCreateOption = {
  market: "BTC/USD",
  strikePrice: "",
  duration: 1,
  optionType: "call",
  size: 1,
};

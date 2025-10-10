import { TAB_ITEMS, type TabItem } from "@/types";
import { Clock3Icon, DropletsIcon, SquareMenuIcon } from "lucide-react";

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
    icon: Clock3Icon,
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
  NEXOAR_PRICING: "nexoar-pricing-v2-beta",
} as const;

export const PRECISION = 1_000_000;

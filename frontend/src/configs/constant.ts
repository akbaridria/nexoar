import { CirclePlusIcon } from "@/components/animate-ui/icons/circle-plus";
import { Clock4Icon } from "@/components/animate-ui/icons/clock-4";
import { SlidersHorizontalIcon } from "@/components/animate-ui/icons/sliders-horizontal";
import { TAB_ITEMS, type TabItem } from "@/types";

export const LIST_TABS: Array<{ key: TabItem; label: string; icon: React.FC }> =
  [
    {
      key: TAB_ITEMS.CREATE_OPTIONS,
      label: "Create Options",
      icon: CirclePlusIcon,
    },
    {
      key: TAB_ITEMS.MANAGE_LIQUIDITY,
      label: "Manage Liquidity",
      icon: SlidersHorizontalIcon,
    },
    {
      key: TAB_ITEMS.FAUCET,
      label: "Faucet",
      icon: CirclePlusIcon,
    },
    {
      key: TAB_ITEMS.OPTIONS_HISTORY,
      label: "History",
      icon: Clock4Icon,
    },
  ];

export const DURATION_OPTIONS = [
  { value: 1, label: "1 Day" },
  { value: 3, label: "3 Days" },
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
];

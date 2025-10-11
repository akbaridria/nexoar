import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PRECISION } from "@/configs/constant";
import { QUERY_KEYS } from "@/configs/query-keys";
import useGetBalance from "@/hooks/use-get-balance";
import { formatCompactNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const USDABalance = () => {
  const { getBalance } = useGetBalance();
  const { data: balance } = useQuery({
    queryKey: [QUERY_KEYS.USDA_BALANCE],
    queryFn: getBalance,
  });

  const formattedBalance = useMemo(() => {
    if (balance) return formatCompactNumber(balance / BigInt(PRECISION));
    return "0";
  }, [balance]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="w-4 h-4 aspect-square bg-primary rounded-full flex items-center justify-center text-xs text-background">
            $
          </div>
          <div className="text-sm">{formattedBalance}</div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Your mock USDA Balance</p>
      </TooltipContent>
    </Tooltip>
  );
};
export default USDABalance;

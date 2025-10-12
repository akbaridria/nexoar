import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QUERY_KEYS } from "@/configs/query-keys";
import useLiquidity from "@/hooks/use-liquidity";
import { formatCompactNumber } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlertIcon, Minus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface RemoveLiquidityProps {
  balance: number;
}
const RemoveLiquidity: React.FC<RemoveLiquidityProps> = ({ balance }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const { removeLiquidity } = useLiquidity();
  const { mutate, isPending } = useMutation({
    mutationFn: (amount: number) => removeLiquidity(amount),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.USER_LIQUIDITY, QUERY_KEYS.PLATFORM_LIQUIDITY],
        });
        toast.success("Successfully removed liquidity");
        setAmount("");
      }, 500);
    },
    onError: () => {
      toast.error("Failed to remove liquidity");
    },
  });

  const handleRemoveLiquidity = useCallback(() => {
    mutate(Number(amount));
  }, [amount, mutate]);

  return (
    <div className="space-y-4">
      <Alert>
        <CircleAlertIcon />
        <AlertTitle>Withdrawal Info</AlertTitle>
        <AlertDescription>
          If the total available liquidity is lower than the amount you want to
          withdraw, you must wait until the option is exercised to release
          liquidity.
        </AlertDescription>
      </Alert>
      <div className="space-y-2">
        <Label htmlFor="remove-amount">Amount</Label>
        <Input
          id="remove-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs">
          Available: {formatCompactNumber(balance)} mUSDA
        </p>
      </div>
      <Button
        variant="default"
        size="lg"
        className="w-full"
        disabled={isPending}
        onClick={handleRemoveLiquidity}
      >
        <Minus className="w-4 h-4" />
        Remove Liquidity
      </Button>
    </div>
  );
};

export default RemoveLiquidity;

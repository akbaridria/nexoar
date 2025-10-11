import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QUERY_KEYS } from "@/configs/query-keys";
import useLiquidity from "@/hooks/use-liquidity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const AddLiquidity = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const { addLiquidity } = useLiquidity();
  const { mutate } = useMutation({
    mutationFn: (amount: number) => addLiquidity(amount),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.USER_LIQUIDITY],
        });
        toast.success("Successfully added liquidity");
        setAmount("");
      }, 500);
    },
    onError: () => {
      toast.error("Failed to add liquidity");
    },
  });

  const handleAddLiquidity = useCallback(() => {
    mutate(Number(amount));
  }, [amount, mutate]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="add-amount">Amount</Label>
        <Input
          id="add-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs">Enter the amount of mUSDA to add</p>
      </div>
      <Button
        variant="default"
        className="w-full"
        size="lg"
        onClick={handleAddLiquidity}
        disabled={!amount || Number(amount) <= 0}
      >
        <Plus />
        Add Liquidity
      </Button>
    </div>
  );
};

export default AddLiquidity;

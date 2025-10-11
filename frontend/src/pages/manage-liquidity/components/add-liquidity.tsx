import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

const AddLiquidity = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="add-amount">Amount</Label>
        <Input id="add-amount" type="number" placeholder="0.00" />
        <p className="text-xs">
          Enter the amount of mUSDA to add
        </p>
      </div>
      <Button variant="default" className="w-full" size="lg">
        <Plus />
        Add Liquidity
      </Button>
    </div>
  );
};

export default AddLiquidity;

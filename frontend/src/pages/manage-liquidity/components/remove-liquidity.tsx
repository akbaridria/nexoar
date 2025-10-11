import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus } from "lucide-react";

const RemoveLiquidity = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="remove-amount">Amount</Label>
        <Input id="remove-amount" type="number" placeholder="0.00" />
        <p className="text-xs">Available: 100 mUSDA</p>
      </div>
      <Button variant="default" size="lg" className="w-full">
        <Minus className="w-4 h-4" />
        Remove Liquidity
      </Button>
    </div>
  );
};

export default RemoveLiquidity;

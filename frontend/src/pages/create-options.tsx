import { useCallback, useEffect, useMemo, useState } from "react";
import { type FormCreateOption } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown } from "lucide-react";
import useApp from "@/hooks/use-app";
import { DURATION_OPTIONS } from "@/configs/constant";
import { useDebounceValue } from "usehooks-ts";
import useReadAppState from "@/hooks/use-read-app-state";

const CreateOptions = () => {
  const { btcPrice: currentBTCPrice } = useApp();
  const { calculatePremium } = useReadAppState();

  const [formData, setFormData] = useState<FormCreateOption>({
    market: "BTC/USD",
    strikePrice: "",
    duration: 1,
    optionType: "call",
    size: 1,
  });

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (
        value === "" ||
        (parseInt(value) >= 1 && Number.isInteger(Number(value)))
      ) {
        setFormData({ ...formData, size: value === "" ? 1 : parseInt(value) });
      }
    },
    [formData]
  );

  const handleFormSubmit = useCallback(() => {
    console.log("Form submitted:", formData);
  }, [formData]);

  const isInTheMoney = useMemo(() => {
    return (
      formData.strikePrice &&
      currentBTCPrice !== undefined &&
      (formData.optionType === "call"
        ? currentBTCPrice > parseFloat(formData.strikePrice)
        : currentBTCPrice < parseFloat(formData.strikePrice))
    );
  }, [formData, currentBTCPrice]);

  const [debouncedStrikePrice] = useDebounceValue(formData.strikePrice, 400);
  const [debouncedDuration] = useDebounceValue(formData.duration, 400);
  const [debouncedIsCall] = useDebounceValue(
    formData.optionType === "call",
    400
  );

  useEffect(() => {
    if (debouncedStrikePrice) {
      calculatePremium({
        spotPrice: currentBTCPrice || 0,
        strikePrice: Number(debouncedStrikePrice),
        duration: debouncedDuration,
        iscall: debouncedIsCall,
      });
    }
  }, [
    debouncedStrikePrice,
    debouncedDuration,
    debouncedIsCall,
    currentBTCPrice,
    calculatePremium,
  ]);

  return (
    <Card className="m-8">
      <CardHeader>
        <CardTitle className="text-xl">Create Options</CardTitle>
        <CardDescription>
          Configure your options trade for BTC/USD market
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        <Alert className="bg-input/20">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                Current BTC Price:
              </span>
              <div className="text-2xl font-bold">
                ${currentBTCPrice?.toLocaleString()}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid gap-2">
          <Label htmlFor="market">Market</Label>
          <Input
            id="market"
            value={formData.market}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="grid gap-2">
          <Label>Option Type</Label>
          <div className="grid grid-cols-2 gap-4">
            {["call", "put"].map((type) => (
              <div
                key={type}
                onClick={() => setFormData({ ...formData, optionType: type })}
                className={`cursor-pointer rounded-lg border p-4 transition-all ${
                  formData.optionType === type ? "bg-input/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-3 w-3 rounded-full border-2 flex items-center justify-center`}
                  >
                    {formData.optionType === type && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {type === "call" ? (
                        <TrendingUp className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-secondary" />
                      )}
                      <span className="font-semibold text-sm">
                        {type === "call" ? "Call Option" : "Put Option"}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {type === "call"
                        ? "Profit when price goes up."
                        : "Profit when price goes down."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="strikePrice">Strike Price (USD)</Label>
          <Input
            id="strikePrice"
            type="number"
            step="0.01"
            placeholder="Enter strike price"
            value={formData.strikePrice}
            onChange={(e) =>
              setFormData({ ...formData, strikePrice: e.target.value })
            }
          />
          {formData.strikePrice && (
            <span
              className={`flex items-center gap-1 text-xs ${
                isInTheMoney
                  ? "text-primary font-semibold"
                  : "text-secondary font-semibold"
              }`}
            >
              {isInTheMoney ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  In the money
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  Out of the money
                </>
              )}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Duration</Label>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={
                  formData.duration === option.value ? "default" : "outline"
                }
                onClick={() =>
                  setFormData({ ...formData, duration: option.value })
                }
                className="w-full"
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="size">Size (Minimum: 1)</Label>
          <Input
            id="size"
            type="number"
            min="1"
            step="1"
            placeholder="Enter size"
            value={formData.size}
            onChange={handleSizeChange}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleFormSubmit}
          className="w-full"
        >
          Create Option
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateOptions;

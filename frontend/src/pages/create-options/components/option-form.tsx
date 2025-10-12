import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, PlusIcon, MinusIcon } from "lucide-react";
import useApp from "@/hooks/use-app";
import { DEFAULT_FORM_VALUES, DURATION_OPTIONS } from "@/configs/constant";
import { useDebounceValue } from "usehooks-ts";
import useReadAppState from "@/hooks/use-read-app-state";
import { handleFetchLatestVaa } from "@/lib/utils";
import useCreateOptions from "@/hooks/use-create-options";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/configs/query-keys";

const DEFAULT_COUNTDOWN = 60;

const CurrentBtcPrice = () => {
  const { btcPrice, setBtcPrice } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(DEFAULT_COUNTDOWN);
  const [, setLastFetch] = useState<number>(0);

  const fetchPrice = useCallback(async () => {
    setIsLoading(true);
    try {
      const { btcPrice } = await handleFetchLatestVaa();
      setBtcPrice?.(btcPrice ? Number(btcPrice) : undefined);
      setLastFetch(Date.now());
      setCountdown(DEFAULT_COUNTDOWN);
    } catch (error) {
      console.error("Failed to fetch BTC price:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setBtcPrice]);

  useEffect(() => {
    fetchPrice();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchPrice();
          return DEFAULT_COUNTDOWN;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchPrice]);

  const progressPercentage =
    ((DEFAULT_COUNTDOWN - countdown) / DEFAULT_COUNTDOWN) * 100;
  const circumference = 2 * Math.PI * 8;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  const formattedBtcPrice = useMemo(() => {
    if (btcPrice) return btcPrice / 1e8;
    return undefined;
  }, [btcPrice]);

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Current BTC Price</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {formattedBtcPrice?.toLocaleString() || "Loading..."}
        </span>
        <div className="relative w-6 h-6">
          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted-foreground/20"
            />

            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-linear ${
                isLoading ? "text-orange-500" : "text-green-500"
              }`}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-mono text-muted-foreground">
              {isLoading ? "..." : countdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OptionForm = () => {
  const { invalidateQueries } = useQueryClient();
  const { createOption } = useCreateOptions();
  const { btcPrice: currentBTCPrice, formData, setFormData } = useApp();
  const { mutate, isPending } = useMutation({
    mutationFn: (variables: {
      strikePrice: number;
      days: number;
      isCall: boolean;
      size: number;
    }) => createOption(variables),
    onSuccess: () => {
      toast.success("Option created successfully");
      setFormData(DEFAULT_FORM_VALUES);
      invalidateQueries({ queryKey: [QUERY_KEYS.PLATFORM_LIQUIDITY] });
    },
    onError: () => {
      toast.error("Failed to create option");
    },
  });

  const [premium, setPremium] = useState<number | undefined>(undefined);
  const { calculatePremium } = useReadAppState();

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
    [formData, setFormData]
  );

  const handleFormSubmit = useCallback(() => {
    mutate({
      strikePrice: Number(formData.strikePrice),
      days: formData.duration,
      isCall: formData.optionType === "call",
      size: formData.size,
    });
  }, [
    formData.duration,
    formData.optionType,
    formData.size,
    formData.strikePrice,
    mutate,
  ]);

  const isInTheMoney = useMemo(() => {
    const cBtcPrice = currentBTCPrice ? currentBTCPrice / 1e8 : undefined;
    return (
      formData.strikePrice &&
      cBtcPrice !== undefined &&
      (formData.optionType === "call"
        ? cBtcPrice > parseFloat(formData.strikePrice)
        : cBtcPrice < parseFloat(formData.strikePrice))
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
        spotPrice: currentBTCPrice ? currentBTCPrice / 1e8 : 0,
        strikePrice: Number(debouncedStrikePrice),
        duration: debouncedDuration,
        iscall: debouncedIsCall,
      }).then((res) => {
        setPremium(res?.value ? Number(res.value) / 1e6 : undefined);
      });
    }
  }, [
    debouncedStrikePrice,
    debouncedDuration,
    debouncedIsCall,
    currentBTCPrice,
    calculatePremium,
    setFormData,
  ]);

  return (
    <Card className="w-full md:max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create Options</CardTitle>
        <CardDescription>
          Configure your options trade for BTC/USD market
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        <div className="bg-input/50 p-4 rounded-lg">
          <CurrentBtcPrice />
        </div>

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

        <div className="flex items-end gap-2 w-full">
          <Button
            size="icon"
            variant="ghost"
            disabled={formData.size <= 1}
            onClick={() =>
              setFormData({ ...formData, size: formData.size - 1 })
            }
          >
            <MinusIcon />
          </Button>
          <div className="grid gap-2 flex-1">
            <Label htmlFor="size">Size (Minimum: 1)</Label>
            <Input
              id="size"
              type="number"
              min="1"
              step="1"
              placeholder="Enter size"
              className="pointer-events-none"
              value={formData.size}
              onChange={handleSizeChange}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setFormData({ ...formData, size: formData.size + 1 })
            }
          >
            <PlusIcon />
          </Button>
        </div>
        <div className="bg-input/50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Premium</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {premium !== undefined
                  ? (premium * formData.size).toLocaleString()
                  : "N/A"}
              </span>
              <span className="text-xs text-muted-foreground">USDA</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleFormSubmit}
          className="w-full"
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create Option"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OptionForm;

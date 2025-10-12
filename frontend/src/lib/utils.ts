import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HermesClient } from "@pythnetwork/hermes-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(
  value: number | bigint,
  maximumFractionDigits = 3
): string {
  const num = typeof value === "bigint" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits,
  }).format(num);
}

export async function handleFetchLatestVaa() {
  const connection = new HermesClient("https://hermes.pyth.network", {});

  const priceIds = [
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ];

  const priceUpdates = await connection.getLatestPriceUpdates(priceIds);
  const latestVaaHex = `0x${priceUpdates.binary.data[0]}`;
  const btcPrice = priceUpdates?.parsed?.[0]?.price?.price;

  return {
    latestVaaHex,
    btcPrice,
  };
}

export function calculatePremium(
  spot: number,
  strike: number,
  durationDays: number,
  isCall: boolean
) {
  const VOLATILITY = 0.8;
  const DAYS_PER_YEAR = 365;
  const TIME_VALUE_COEFF = 0.496;
  const MAX_PCT_DISTANCE = 1.0;

  const intrinsic = isCall
    ? Math.max(spot - strike, 0)
    : Math.max(strike - spot, 0);

  if (durationDays <= 0) {
    return intrinsic;
  }

  const T = durationDays / DAYS_PER_YEAR;
  const sqrtT = Math.sqrt(T);

  const atmTimeValue = strike * VOLATILITY * sqrtT * TIME_VALUE_COEFF;

  const pctDistance =
    strike > 0 ? Math.abs(spot - strike) / strike : MAX_PCT_DISTANCE;

  const decay = Math.min(1.0, pctDistance / MAX_PCT_DISTANCE);

  const timeValue = atmTimeValue * (1.0 - decay);

  return intrinsic + Math.max(0, timeValue);
}

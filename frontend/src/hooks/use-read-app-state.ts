import { useCallback } from "react";
import { Cl, fetchCallReadOnlyFunction } from "@stacks/transactions";
import {
  NEXOAR_CONTRACT_ADDRESS,
  NEXOAR_CONTRACT_NAME,
  PRECISION,
} from "@/configs/constant";
import { getLocalStorage } from "@stacks/connect";

const useReadAppState = () => {
  const calculatePremium = useCallback(
    async ({
      spotPrice,
      strikePrice,
      duration,
      iscall,
    }: {
      spotPrice: number;
      strikePrice: number;
      duration: number;
      iscall: boolean;
    }) => {
      try {
        const localStorageData = getLocalStorage();

        const res = await fetchCallReadOnlyFunction({
          contractAddress: NEXOAR_CONTRACT_ADDRESS,
          contractName: NEXOAR_CONTRACT_NAME.NEXOAR_PRICING,
          functionName: "calculate-premium",
          functionArgs: [
            Cl.uint(spotPrice * PRECISION),
            Cl.uint(strikePrice * PRECISION),
            Cl.uint(duration),
            Cl.bool(iscall),
          ],
          senderAddress: localStorageData?.addresses?.stx?.[0]?.address || "",
          network: "testnet",
        });
        return res;
      } catch (error) {
        console.log("Error calculating premium:", error);
      }
    },
    []
  );

  return {
    calculatePremium,
  };
};

export default useReadAppState;

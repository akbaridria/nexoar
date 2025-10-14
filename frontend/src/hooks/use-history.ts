import {
  NEXOAR_CONTRACT_ADDRESS,
  NEXOAR_CONTRACT_NAME,
} from "@/configs/constant";
import { getLocalStorage } from "@stacks/connect";
import { Cl, fetchCallReadOnlyFunction } from "@stacks/transactions";
import { useCallback } from "react";
import { toast } from "sonner";

interface UserHistory {
  walletAddress: string;
  optionId: number;
}

const useHistory = () => {
  const senderAddress = getLocalStorage()?.addresses?.stx?.[0]?.address;
  const getDetailOption = useCallback(
    async (optId: number) => {
      const res = (await fetchCallReadOnlyFunction({
        contractAddress: NEXOAR_CONTRACT_ADDRESS,
        contractName: NEXOAR_CONTRACT_NAME.NEXOAR_CORE,
        functionName: "get-detail-options-by-id",
        functionArgs: [Cl.uint(optId)],
        senderAddress: senderAddress || "",
        network: "testnet",
      })) as { type: string; value: { type: string; value: {
        "exercised-price": { type: string; value: number };
        "is-exercised": { type: string; };
        "locked-liquidity": { type: string; value: number };
        owner: { type: string; value: string };
        premium: { type: string; value: number };
        size: { type: string; value: number };
        strike: { type: string; value: number };
        "is-call": { type: string; };
        expiry: { type: string; value: number };
        profit: { type: string; value: number };
      }}};
      return res;
    },
    [senderAddress]
  );
  const getHistoryByUser = useCallback(async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_NEXOAR_BASE_API_URL
        }/user-history/${senderAddress}`
      );
      if (!response.ok) throw new Error("Failed to fetch history");
      const data: UserHistory[] = await response.json();
      return data;
    } catch {
      toast.error("Failed to fetch option history");
    }
  }, [senderAddress]);

  return {
    getHistoryByUser,
    getDetailOption,
  };
};

export default useHistory;

import {
  NEXOAR_CONTRACT_ADDRESS,
  NEXOAR_CONTRACT_NAME,
  PRECISION,
} from "@/configs/constant";
import { handleFetchLatestVaa } from "@/lib/utils";
import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { useCallback } from "react";
import { toast } from "sonner";

const useCreateOptions = () => {
  const createOption = useCallback(
    async ({
      strikePrice,
      days,
      isCall,
      size,
    }: {
      strikePrice: number;
      days: number;
      isCall: boolean;
      size: number;
    }) => {
      try {
        const { latestVaaHex } = await handleFetchLatestVaa();
        const res = await request("stx_callContract", {
          contract: `${NEXOAR_CONTRACT_ADDRESS}.${NEXOAR_CONTRACT_NAME.NEXOAR_CORE}`,
          functionArgs: [
            Cl.bufferFromHex(latestVaaHex),
            Cl.uint(strikePrice * PRECISION),
            Cl.uint(days),
            Cl.bool(isCall),
            Cl.uint(size * 100),
          ],
          network: "testnet",
          functionName: "create-option",
          postConditionMode: "allow",
        });
        return res;
      } catch {
        toast.error("Failed to get latest VAA, please try again.");
      }
    },
    []
  );
  return {
    createOption,
  };
};

export default useCreateOptions;

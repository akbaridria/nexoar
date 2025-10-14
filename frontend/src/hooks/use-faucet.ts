import {
  NEXOAR_CONTRACT_ADDRESS,
  NEXOAR_CONTRACT_NAME,
  PRECISION,
} from "@/configs/constant";
import { getLocalStorage, request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { useCallback } from "react";

const useFaucet = () => {
  const senderAddress = getLocalStorage()?.addresses?.stx?.[0]?.address || "";
  const faucet = useCallback(async () => {
    const res = await request("stx_callContract", {
      contract: `${NEXOAR_CONTRACT_ADDRESS}.${NEXOAR_CONTRACT_NAME.NEXOAR_USDA}`,
      functionArgs: [Cl.uint(10_000_000 * PRECISION), Cl.address(senderAddress)],
      network: "testnet",
      functionName: "mint",
      postConditionMode: "deny",
    });
    return res;
  }, [senderAddress]);
  return {
    faucet,
  };
};

export default useFaucet;

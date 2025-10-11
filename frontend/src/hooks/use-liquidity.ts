import {
  NEXOAR_CONTRACT_ADDRESS,
  NEXOAR_CONTRACT_NAME,
} from "@/configs/constant";
import { getLocalStorage } from "@stacks/connect";
import { Cl, fetchCallReadOnlyFunction } from "@stacks/transactions";
import { useCallback } from "react";

const useLiquidity = () => {
  const senderAddress = getLocalStorage()?.addresses?.stx?.[0]?.address || "";

  const getProviderInfo = useCallback(async () => {
    const res = (await fetchCallReadOnlyFunction({
      contractAddress: NEXOAR_CONTRACT_ADDRESS,
      contractName: NEXOAR_CONTRACT_NAME.NEXOAR_LIQUIDITY,
      functionName: "get-provider-balance",
      functionArgs: [Cl.address(senderAddress)],
      senderAddress: senderAddress,
      network: "testnet",
    })) as { type: string; value: { type: string; value: bigint } };
    return res?.value?.value;
  }, [senderAddress]);

  const addLiquidity = useCallback(() => {}, []);
  return {
    addLiquidity,
    getProviderInfo,
  };
};

export default useLiquidity;

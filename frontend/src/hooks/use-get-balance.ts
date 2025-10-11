import {
  NEXOAR_CONTRACT_ADDRESS,
  NEXOAR_CONTRACT_NAME,
} from "@/configs/constant";
import { getLocalStorage } from "@stacks/connect";
import { Cl, fetchCallReadOnlyFunction } from "@stacks/transactions";
import { useCallback } from "react";

const useGetBalance = () => {
  const userAddress = getLocalStorage()?.addresses?.stx?.[0]?.address || "";

  const getBalance = useCallback(async () => {
    if (!userAddress) return 0;
    const res = await fetchCallReadOnlyFunction({
      contractAddress: NEXOAR_CONTRACT_ADDRESS,
      contractName: NEXOAR_CONTRACT_NAME.NEXOAR_USDA,
      functionName: "get-balance",
      functionArgs: [Cl.address(userAddress)],
      senderAddress: userAddress,
      network: "testnet",
    }) as { type: string; value: { type: string; value: bigint } };
    return res?.value?.value;
  }, [userAddress]);

  return {
    getBalance,
  };
};

export default useGetBalance;

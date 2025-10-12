import {
  NEXOAR_CONTRACT_ADDRESS,
  NEXOAR_CONTRACT_NAME,
  PRECISION,
} from "@/configs/constant";
import { getLocalStorage, request } from "@stacks/connect";
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

  const getTotalLiquidity = useCallback(async () => {
    const res = (await fetchCallReadOnlyFunction({
      contractAddress: NEXOAR_CONTRACT_ADDRESS,
      contractName: NEXOAR_CONTRACT_NAME.NEXOAR_LIQUIDITY,
      functionName: "get-total-liquidity",
      functionArgs: [],
      senderAddress: senderAddress,
      network: "testnet",
    })) as { type: string; value: { type: string; value: bigint } };
    return res?.value?.value;
  }, [senderAddress]);

  const getAvailableLiquidity = useCallback(async () => {
    const res = (await fetchCallReadOnlyFunction({
      contractAddress: NEXOAR_CONTRACT_ADDRESS,
      contractName: NEXOAR_CONTRACT_NAME.NEXOAR_LIQUIDITY,
      functionName: "get-available-liquidity",
      functionArgs: [],
      senderAddress: senderAddress,
      network: "testnet",
    })) as { type: string; value: { type: string; value: bigint } };
    return res?.value?.value;
  }, [senderAddress]);

  const addLiquidity = useCallback((amount: number) => {
    const res = request("stx_callContract", {
      contract: `${NEXOAR_CONTRACT_ADDRESS}.${NEXOAR_CONTRACT_NAME.NEXOAR_CORE}`,
      functionName: "add-liquidity",
      functionArgs: [Cl.uint(amount * PRECISION)],
      network: "testnet",
      postConditionMode: "allow",
    });
    return res;
  }, []);

  const removeLiquidity = useCallback((amount: number) => {
    const res = request("stx_callContract", {
      contract: `${NEXOAR_CONTRACT_ADDRESS}.${NEXOAR_CONTRACT_NAME.NEXOAR_CORE}`,
      functionName: "remove-liquidity",
      functionArgs: [Cl.uint(amount * PRECISION)],
      network: "testnet",
      postConditionMode: "allow",
    });
    return res;
  }, []);

  return {
    addLiquidity,
    removeLiquidity,
    getProviderInfo,
    getTotalLiquidity,
    getAvailableLiquidity,
  };
};

export default useLiquidity;

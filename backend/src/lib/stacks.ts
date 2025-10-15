import "dotenv/config";

import type {
  StacksPayload,
  StacksTransactionContractCallKind,
  StacksTransactionSmartContractEvent,
} from "@hirosystems/chainhook-client";
import { NEXOAR_CORE_CONTRACT, NEXOAR_CORE_CONTRACT_ADDRESS, NEXOAR_CORE_CONTRACT_NAME } from "./constant.js";
import { broadcastTransaction, Cl, makeContractCall } from "@stacks/transactions";
import { generateWallet } from "@stacks/wallet-sdk";
import env from "./env.js";
import { handleFetchLatestVaa } from "./hermes.js";
import { logger } from "./logger.js";

const serializeStacksPayload = (payload: StacksPayload) => {
  let { apply, chainhook, rollback } = payload;

  const results: {
    optionId: number;
    isCall: boolean;
    expiry: number;
    owner: string;
  }[] = [];

  if (apply.length > 0) {
    let { timestamp, transactions, metadata: applyMetadata } = apply[0];

    for (let transaction of transactions) {
      let { transaction_identifier, metadata } = transaction;
      let { success, sender, kind, receipt } = metadata;

      let { data: kindData } = kind as StacksTransactionContractCallKind;
      let { args, contract_identifier, method } = kindData;

      let { events } = receipt;

      logger.info(events);

      let filteredEvents = events.find((event: any) => {
        return (
          event.type === "SmartContractEvent" &&
          event?.data?.contract_identifier === NEXOAR_CORE_CONTRACT &&
          event?.data?.value?.event === "option-created"
        );
      });

      logger.info(filteredEvents);

      const {
        "option-id": optionId,
        "is-call": isCall,
        expiry,
        owner,
      } = filteredEvents.data.value as {
        "is-call": boolean;
        event: "option-created";
        owner: string;
        expiry: number;
        "locked-liquidity": number;
        "option-id": number;
        premium: number;
        size: number;
        "spot-price": number;
        strike: number;
      };
      results.push({ optionId, isCall, expiry, owner });
    }
  }

  return results;
};

const exerciseOption = async (optionId: number) => {
  const mnemonic = env.MNEMONIC;
  const password = env.PASSWORD_WALLET;
  const walletKeys = await generateWallet({ secretKey: mnemonic, password: password });
  const senderKey = walletKeys.accounts[0].stxPrivateKey;
  const { latestVaaHex } = await handleFetchLatestVaa();

  const transaction = await makeContractCall({
    contractAddress: NEXOAR_CORE_CONTRACT_ADDRESS,
    contractName: NEXOAR_CORE_CONTRACT_NAME,
    functionName: "exercise-option",
    functionArgs: [Cl.uint(optionId), Cl.bufferFromHex(latestVaaHex)],
    senderKey: senderKey,
    network: "testnet",
    postConditionMode: "allow",
  });

  await broadcastTransaction({ transaction });

  return transaction;
};

export { serializeStacksPayload, exerciseOption };

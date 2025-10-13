import { HermesClient } from "@pythnetwork/hermes-client";
import { HERMES_API_URL } from "./constant.js";

async function handleFetchLatestVaa() {
  const connection = new HermesClient(HERMES_API_URL, {});

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

export { handleFetchLatestVaa };
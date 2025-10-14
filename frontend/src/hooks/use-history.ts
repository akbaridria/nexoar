import { getLocalStorage } from "@stacks/connect";
import { useCallback } from "react";
import { toast } from "sonner";

interface UserHistory {
  wallet_addres: string;
  option_id: number;
}

const useHistory = () => {
  const senderAddress = getLocalStorage()?.addresses?.stx?.[0]?.address;
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
  };
};

export default useHistory;

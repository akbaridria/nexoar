import { AppContext } from "@/contexts/app-context";
import { useEffect, useState, type ReactNode } from "react";
import { isConnected as isWalletConnected } from "@stacks/connect";
import type { FormCreateOption } from "@/types";
import { DEFAULT_FORM_VALUES } from "@/configs/constant";

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [btcPrice, setBtcPrice] = useState<number | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [formData, setFormData] =
    useState<FormCreateOption>(DEFAULT_FORM_VALUES);

  useEffect(() => {
    if (isWalletConnected()) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        btcPrice,
        isConnected,
        formData,
        setFormData,
        setIsConnected,
        setBtcPrice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

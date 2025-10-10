import { AppContext } from "@/contexts/app-context";
import { useEffect, useState, type ReactNode } from "react";
import { isConnected as isWalletConnected } from "@stacks/connect";

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [btcPrice, setBtcPrice] = useState<number | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const fetchBTCPrice = () => {
    const mockPrice = 100000 + Math.random() * 2000 - 1000;
    setBtcPrice(parseFloat(mockPrice.toFixed(2)));
  };

  useEffect(() => {
    if (isWalletConnected()) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchBTCPrice();

    const interval = setInterval(fetchBTCPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        btcPrice,
        isConnected,
        setIsConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

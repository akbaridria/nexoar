import { createContext } from "react";

type AppContextState = {
  btcPrice?: number;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppContext = createContext<AppContextState | undefined>(undefined);

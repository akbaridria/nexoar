import { createContext } from "react";

type AppContextState = {
  btcPrice?: number;
};

export const AppContext = createContext<AppContextState | undefined>(undefined);

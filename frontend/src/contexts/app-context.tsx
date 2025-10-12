import type { FormCreateOption } from "@/types";
import { createContext } from "react";

type AppContextState = {
  btcPrice?: number;
  setBtcPrice: React.Dispatch<React.SetStateAction<number | undefined>>;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  formData: FormCreateOption;
  setFormData: React.Dispatch<React.SetStateAction<FormCreateOption>>;
};

export const AppContext = createContext<AppContextState | undefined>(undefined);

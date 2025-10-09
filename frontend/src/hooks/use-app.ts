import { AppContext } from "@/contexts/app-context";
import { useContext } from "react";

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default useApp;
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useApp from "@/hooks/use-app";
import { disconnect } from "@stacks/connect";
import { UnplugIcon } from "lucide-react";
import { useCallback } from "react";

const DisconnectWallet = () => {
  const { setIsConnected } = useApp();
  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsConnected(false);
  }, [setIsConnected]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleDisconnect}>
          <UnplugIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Disconnect Wallet</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DisconnectWallet;

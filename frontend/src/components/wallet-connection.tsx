import { useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { connect, isConnected } from "@stacks/connect";
import useApp from "@/hooks/use-app";

const WalletConnection = () => {
  const { setIsConnected } = useApp();

  const connectWallet = useCallback(async () => {
    try {
      await connect({ network: "testnet", forceWalletSelect: true });
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, [setIsConnected]);

  if (isConnected()) return null;

  return (
    <div className="absolute z-[10] top-0 left-0 w-full h-full bg-background/50 pointer-events-auto transition-opacity backdrop-blur-sm">
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              <p className="text-sm">
                Please connect your wallet before interacting with{" "}
                <span className="font-semibold">Nexoar</span>
              </p>
            </CardDescription>
            <Button className="w-full" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletConnection;

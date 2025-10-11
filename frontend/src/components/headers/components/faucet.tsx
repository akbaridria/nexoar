import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { QUERY_KEYS } from "@/configs/query-keys";
import useFaucet from "@/hooks/use-faucet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DropletIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const Faucet = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { faucet } = useFaucet();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: faucet,
    onSuccess: () => {
      toast("Successfully requested 10,000 mock USDA tokens");
      setTimeout(() => {
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USDA_BALANCE] });
      }, 400);
    },
    onError: () => {
      toast.error("Failed to request mock USDA tokens");
    },
  });
  const handleFaucet = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <DropletIcon />
          <div>Faucet</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Faucet Mock USDA</DialogTitle>
          <DialogDescription>
            Request test USDA tokens for development and testing.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 border rounded-xl bg-input/20 flex items-center justify-between">
          <div>Amount</div>
          <div>10.000</div>
        </div>
        <DialogFooter>
          <Button
            variant="default"
            className="w-full"
            onClick={handleFaucet}
            disabled={isLoading}
          >
            {isLoading && <Spinner />}
            {isLoading ? "Requesting..." : "Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Faucet;

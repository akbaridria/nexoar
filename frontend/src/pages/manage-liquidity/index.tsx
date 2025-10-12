import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AddLiquidity from "./components/add-liquidity";
import RemoveLiquidity from "./components/remove-liquidity";
import useLiquidity from "@/hooks/use-liquidity";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/configs/query-keys";
import { useMemo } from "react";
import { formatCompactNumber } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { PRECISION } from "@/configs/constant";
import { DropletIcon, LockIcon, RefreshCw, UnlockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ManageLiquidity = () => {
  const { getProviderInfo, getTotalLiquidity, getAvailableLiquidity } =
    useLiquidity();
  const { data: rawTotalLiquidity, isLoading: isLoadingTotalLiquidity } =
    useQuery({
      queryKey: [QUERY_KEYS.PLATFORM_LIQUIDITY],
      queryFn: getTotalLiquidity,
    });
  const {
    data: rawAvailableLiquidity,
    isLoading: isLoadingAvailableLiquidity,
  } = useQuery({
    queryKey: [QUERY_KEYS.PLATFORM_LIQUIDITY, "available"],
    queryFn: getAvailableLiquidity,
  });
  const {
    data,
    isLoading,
    isRefetching,
    refetch: handleRefresh,
  } = useQuery({
    queryKey: [QUERY_KEYS.USER_LIQUIDITY],
    queryFn: getProviderInfo,
  });

  const formattedBalance = useMemo(() => {
    if (data) return formatCompactNumber(Number(data) / PRECISION);
    return "0";
  }, [data]);
  const formattedTotalLiquidity = useMemo(() => {
    if (rawTotalLiquidity)
      return formatCompactNumber(Number(rawTotalLiquidity) / PRECISION);
    return "0";
  }, [rawTotalLiquidity]);
  const formattedAvailableLiquidity = useMemo(() => {
    if (rawAvailableLiquidity)
      return formatCompactNumber(Number(rawAvailableLiquidity) / PRECISION);
    return "0";
  }, [rawAvailableLiquidity]);
  const formattedTotalLockedLiquidity = useMemo(() => {
    if (rawTotalLiquidity && rawAvailableLiquidity)
      return formatCompactNumber(
        (Number(rawTotalLiquidity) - Number(rawAvailableLiquidity)) / PRECISION
      );
    return "0";
  }, [rawTotalLiquidity, rawAvailableLiquidity]);
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 h-full md:p-4 mt-0 md:mt-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Total Liquidity</CardTitle>
            <CardAction>
              <DropletIcon className="h-6 w-6 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingTotalLiquidity ? <Spinner /> : formattedTotalLiquidity}
              <sub className="text-xs ml-1">mUSDA</sub>
            </div>
            <p className="text-xs text-muted-foreground">Total Liquidity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Available Liquidity</CardTitle>
            <CardAction>
              <UnlockIcon className="h-6 w-6 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAvailableLiquidity ? (
                <Spinner />
              ) : (
                formattedAvailableLiquidity
              )}
              <sub className="text-xs ml-1">mUSDA</sub>
            </div>
            <p className="text-xs text-muted-foreground">
              Total Available Liquidity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Locked Liquidity</CardTitle>
            <CardAction>
              <LockIcon className="h-6 w-6 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAvailableLiquidity || isLoadingTotalLiquidity ? (
                <Spinner />
              ) : (
                formattedTotalLockedLiquidity
              )}
              <sub className="text-xs ml-1">mUSDA</sub>
            </div>
            <p className="text-xs text-muted-foreground">
              Total Locked Liquidity
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="p-4 bg-card rounded-lg space-y-4 w-full max-w-2xl">
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-semibold">
            Manage Liquidity
          </CardTitle>
          <CardDescription>
            View and manage your liquidity in the vault
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          <div className="rounded-lg border p-4 flex flex-col items-start bg-input/50 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => handleRefresh()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoading || isRefetching ? "animate-spin" : ""
                }`}
              />
            </Button>

            {isLoading || isRefetching ? (
              <Spinner className="w-8 h-8" />
            ) : (
              <div className="text-2xl font-bold">
                {formattedBalance}
                <sub className="text-xs ml-1">mUSDA</sub>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Your total liquidity
            </p>
          </div>
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="pt-4">
              <AddLiquidity />
            </TabsContent>

            <TabsContent value="remove" className="pt-4">
              <RemoveLiquidity balance={data ? Number(data) : 0} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageLiquidity;

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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

const ManageLiquidity = () => {
  const { getProviderInfo } = useLiquidity();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_LIQUIDITY],
    queryFn: getProviderInfo,
  });

  const formattedBalance = useMemo(() => {
    if (data) return formatCompactNumber(Number(data) / PRECISION);
    return "0";
  }, [data]);
  return (
    <div className="flex items-center justify-center p-4 h-full md:p-4 mt-4">
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
          <div className="rounded-lg border p-4 flex flex-col items-start bg-input/50">
            {isLoading ? (
              <Spinner />
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

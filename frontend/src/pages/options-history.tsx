import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useHistory from "@/hooks/use-history";
import { QUERY_KEYS } from "@/configs/query-keys";

type OptionHistory = {
  optionId: number;
  owner: string;
  strike: number;
  expiry: number;
  size: number;
  isCall: boolean;
  premium: number;
  lockedLiquidity: number;
  isExercised: boolean;
  profit: number;
  exercisePrice: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

const OptionsHistory = () => {
  const { getHistoryByUser } = useHistory();
  const { data: historyData } = useQuery({
    queryKey: [QUERY_KEYS.USER_HISTORY],
    queryFn: getHistoryByUser,
  });
  console.log(historyData);
  const [data, setData] = useState<OptionHistory[]>([]);

  return (
    <div className="p-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Options Positions</CardTitle>
          <CardDescription>
            A complete history of your options trades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Locked Liquidity</TableHead>
                <TableHead>Exercised</TableHead>
                <TableHead>Exercise Price</TableHead>
                <TableHead>Profit / Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((opt) => (
                <TableRow key={opt.optionId} className="h-14">
                  <TableCell>{opt.optionId}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {opt.owner}
                  </TableCell>
                  <TableCell>
                    <Badge variant={opt.isCall ? "default" : "secondary"}>
                      {opt.isCall ? "CALL" : "PUT"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(opt.strike)}</TableCell>
                  <TableCell>
                    {format(opt.expiry * 1000, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{opt.size}</TableCell>
                  <TableCell>{formatCurrency(opt.premium)}</TableCell>
                  <TableCell>{formatCurrency(opt.lockedLiquidity)}</TableCell>
                  <TableCell>
                    {opt.isExercised ? (
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                        Yes
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-200 text-gray-600">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(opt.exercisePrice)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {opt.profit >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`font-medium ${
                          opt.profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(opt.profit)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptionsHistory;

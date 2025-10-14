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
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertCircleIcon,
  FileQuestion,
  LoaderIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useHistory from "@/hooks/use-history";
import { QUERY_KEYS } from "@/configs/query-keys";
import { PRECISION } from "@/configs/constant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const RowTable: React.FC<{ optId: number }> = ({ optId }) => {
  const { getDetailOption } = useHistory();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_HISTORY, optId],
    queryFn: () => getDetailOption(optId),
    select: (data) => data?.value?.value,
  });

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={11}>Loading...</TableCell>
      </TableRow>
    );
  }

  if (!data) {
    return (
      <TableRow>
        <TableCell colSpan={11}>No data found</TableCell>
      </TableRow>
    );
  }

  const opt: OptionHistory = {
    optionId: optId,
    owner: data?.owner?.value || "",
    strike: data?.strike?.value ? Number(data.strike.value) / PRECISION : 0,
    expiry: data?.expiry?.value ? Number(data.expiry.value) : 0,
    size: data?.size?.value ? Number(data.size.value) / 100 : 0,
    isCall: data?.["is-call"]?.type === "true" || false,
    premium: data?.premium?.value ? Number(data.premium.value) / PRECISION : 0,
    lockedLiquidity: data?.["locked-liquidity"]?.value
      ? Number(data["locked-liquidity"].value) / PRECISION
      : 0,
    isExercised: data?.["is-exercised"]?.type === "true" || false,
    exercisePrice: data?.["exercised-price"]?.value
      ? Number(data["exercised-price"].value) / PRECISION
      : 0,
    profit: data?.profit?.value ? Number(data.profit.value) / PRECISION : 0,
  };

  return (
    <TableRow key={opt.optionId} className="h-14">
      <TableCell>{opt.optionId}</TableCell>
      <TableCell className="max-w-[200px] truncate">{opt.owner}</TableCell>
      <TableCell>
        <Badge variant={opt.isCall ? "default" : "secondary"}>
          {opt.isCall ? "CALL" : "PUT"}
        </Badge>
      </TableCell>
      <TableCell>{formatCurrency(opt.strike)}</TableCell>
      <TableCell>{format(opt.expiry * 1000, "MMM d, yyyy")}</TableCell>
      <TableCell>{opt.size}</TableCell>
      <TableCell>{formatCurrency(opt.premium)} </TableCell>
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
      <TableCell>${formatCurrency(opt.exercisePrice)}</TableCell>
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
  );
};

const OptionsHistory = () => {
  const { getHistoryByUser } = useHistory();
  const { data: historyData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_HISTORY],
    queryFn: getHistoryByUser,
  });

  const ExerciseInfoAlert = () => (
    <Alert className="mb-6" variant="default">
      <AlertCircleIcon />
      <AlertTitle>Automatic Profit Distribution</AlertTitle>
      <AlertDescription>
        When an option is exercised, any profit will be automatically sent to
        your wallet. You do not need to claim it manually.
      </AlertDescription>
    </Alert>
  );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <LoaderIcon className="animate-spin h-8 w-8" />
        <span className="ml-4 text-gray-500">Loading options history...</span>
      </div>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileQuestion className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-foreground">
          No Options History
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          You haven't traded any options yet. Your trades will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ExerciseInfoAlert />
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
              {historyData.map((opt) => (
                <RowTable key={opt.optionId} optId={opt.optionId} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptionsHistory;

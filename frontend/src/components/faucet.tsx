import { TAB_ITEMS } from "@/types";
import { TabsContent } from "./animate-ui/components/radix/tabs";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const Faucet = () => {
  return (
    <TabsContent
      value={TAB_ITEMS.FAUCET}
      className="flex flex-col gap-6"
    >
      <CardHeader>
        <CardTitle>Faucet</CardTitle>
        <CardDescription>description</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>content</div>
      </CardContent>
      <CardFooter>
        <div>footer</div>
      </CardFooter>
    </TabsContent>
  );
};

export default Faucet;

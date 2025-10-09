import { LIST_TABS } from "@/configs/constant";
import {
  Tabs,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "./animate-ui/components/radix/tabs";
import { Card } from "./ui/card";
import { TAB_ITEMS } from "@/types";

import CreateOptions from "./create-options";
import Faucet from "./faucet";
import ManageLiquidity from "./manage-liquidity";
import OptionsHistory from "./options-history";

const MainContent = () => {
  return (
    <Tabs defaultValue={TAB_ITEMS.CREATE_OPTIONS}>
      <TabsList className="overflow-x-auto no-scrollbar mx-auto">
        {LIST_TABS.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} className="px-3 py-2">
            {<tab.icon />}
            <span className="hidden md:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <Card className="shadow-none py-0 mt-4">
        <TabsContents className="py-6">
          <CreateOptions />
          <OptionsHistory />
          <Faucet />
          <ManageLiquidity />
        </TabsContents>
      </Card>
    </Tabs>
  );
};

export default MainContent;

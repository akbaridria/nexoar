import { LIST_TABS } from "@/configs/constant";
import { useLocation, useNavigate } from "react-router";
import { Button } from "../ui/button";
import Faucet from "./components/faucet";
import { Separator } from "../ui/separator";
import USDABalance from "./components/usda-balance";
import DisconnectWallet from "./components/disconnect-wallet";
import GithubNexoar from "./components/github-nexoar";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between sticky top-0 bg-background px-4 py-6">
      <div className="flex items-center gap-4">
        <img src="/nexoar.svg" alt="Nexoar Logo" className="w-6 h-6" />
        <div className="flex items-center gap-2">
          {LIST_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={location.pathname === tab.path ? "outline" : "ghost"}
              onClick={() => navigate(tab.path)}
            >
              {<tab.icon />}
              <span className="hidden md:inline">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Faucet />
        <Separator orientation="vertical" className="h-5!" />
        <USDABalance />
        <Separator orientation="vertical" className="h-5!" />
        <GithubNexoar />
        <Separator orientation="vertical" className="h-5!" />
        <DisconnectWallet />
      </div>
    </div>
  );
};

export default Header;

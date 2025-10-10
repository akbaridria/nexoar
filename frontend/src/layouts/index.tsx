import Header from "@/components/header";
import WalletConnection from "@/components/wallet-connection";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <main className="container mx-auto">
      <Header />
      <WalletConnection />
      <div className="flex gap-6 flex-col md:flex-row flex-wrap justify-center">
        <div className="flex-none w-full max-w-[600px]">
          <Outlet />
        </div>
        <div className="flex-1 min-w-[600px]">
          <div>this is visualization</div>
        </div>
      </div>
    </main>
  );
};

export default Layout;

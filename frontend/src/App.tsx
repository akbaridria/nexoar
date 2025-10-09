import MainContent from "./components/main-content";
import AppProvider from "./providers/app-provider";
import { ThemeProvider } from "./providers/theme-provider";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppProvider>
        <div className="flex gap-6 flex-col md:flex-row p-6 md:p-16 flex-wrap justify-center">
          <div className="flex-none w-full max-w-[600px]">
            <MainContent />
          </div>
          <div className="flex-1 min-w-[600px]">
            <div>this is visualization</div>
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;

import { RouterProvider } from "react-router";
import { ThemeProvider } from "./providers/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AppProvider from "./providers/app-provider";
import router from "./routes";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AppProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

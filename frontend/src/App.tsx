import { RouterProvider } from "react-router";
import AppProvider from "./providers/app-provider";
import { ThemeProvider } from "./providers/theme-provider";
import router from "./routes";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;

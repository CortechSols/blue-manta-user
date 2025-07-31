import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/react-query";
import { ErrorBoundary } from "./components/common";

createRoot(document.getElementById("root")!).render(
  // Temporarily disabled StrictMode to prevent double rendering issues
  // <StrictMode>
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
  // </StrictMode>
);

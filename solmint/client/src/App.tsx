/**
 * SolMint App.tsx
 * Design: Solana Gradient Glassmorphism — Premium Web3 SaaS
 * Routes: Home, Launch (wizard), My Tokens
 * Router: HashRouter for GitHub Pages SPA support
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HashRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NetworkProvider } from "./contexts/NetworkContext";
import { WalletContextProvider } from "./contexts/WalletContext";
import { TokenFormProvider } from "./contexts/TokenFormContext";
import Home from "./pages/Home";
import Launch from "./pages/Launch";
import MyTokens from "./pages/MyTokens";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/launch" element={<Launch />} />
      <Route path="/my-tokens" element={<MyTokens />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <NetworkProvider>
          <WalletContextProvider>
            <TokenFormProvider>
              <TooltipProvider>
                <Toaster
                  theme="dark"
                  toastOptions={{
                    style: {
                      background: "rgba(15,15,26,0.95)",
                      border: "1px solid rgba(153,69,255,0.3)",
                      color: "white",
                      fontFamily: "'Space Grotesk', sans-serif",
                    },
                  }}
                />
                <HashRouter>
                  <Router />
                </HashRouter>
              </TooltipProvider>
            </TokenFormProvider>
          </WalletContextProvider>
        </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

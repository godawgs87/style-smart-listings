
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import SafeErrorBoundary from "@/components/SafeErrorBoundary";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import ListingsManager from "./pages/ListingsManager";
import SimpleInventoryPage from "./pages/SimpleInventoryPage";
import QATestPage from "./pages/QATestPage";
import UserSettings from "./pages/UserSettings";
import NotFound from "./pages/NotFound";

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SafeErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/inventory" element={<SimpleInventoryPage />} />
                <Route path="/manage-listings" element={
                  <ListingsManager 
                    onBack={() => window.history.back()} 
                  />
                } />
                <Route path="/qa-tests" element={<QATestPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeErrorBoundary>
  );
};

export default App;

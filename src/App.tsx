import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import InventoryManager from "./pages/InventoryManager";
import ListingsManager from "./pages/ListingsManager";
import SimpleInventoryPage from "./pages/SimpleInventoryPage";
import QATestPage from "./pages/QATestPage";
import UserSettings from "./pages/UserSettings";
import NotFound from "./pages/NotFound";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

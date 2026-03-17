import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import PropertyPortfolio from "./pages/PropertyPortfolio";
import TenantDatabase from "./pages/TenantDatabase";
import Reports from "./pages/Reports";
import Backup from "./pages/Backup";
import UtilitiesDashboard from "./pages/UtilitiesDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<PropertyPortfolio />} />
              <Route path="/tenants" element={<TenantDatabase />} />
              <Route path="/utilities" element={<UtilitiesDashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

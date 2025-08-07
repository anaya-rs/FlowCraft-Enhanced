import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateModel from "./pages/CreateModel";
import LearnMore from "./pages/LearnMore";
import NotFound from "./pages/NotFound";
import Models from "@/pages/Models";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import DocumentView from "@/pages/DocumentView";

const queryClient = new QueryClient();

const App = () => (
  <div className="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-model" element={<CreateModel />} />
            <Route path="/models" element={<Models />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/view/:documentId" element={<DocumentView />} />
            <Route path="/settings" element={<Settings />} />
            {/* CATCH-ALL ROUTE MUST BE LAST */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;

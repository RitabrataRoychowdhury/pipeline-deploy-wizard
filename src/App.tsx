import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Pipelines from "./pages/Pipelines";
import Repositories from "./pages/Repositories";
import Settings from "./pages/Settings";
import PipelineBuilder from "./pages/PipelineBuilder";
import PipelineExecution from "./pages/PipelineExecution";
import NotFound from "./pages/NotFound";
import AnimationDemo from "./components/AnimationDemo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
                  <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <PageTransition><Dashboard /></PageTransition>
                    </ProtectedRoute>
                  } />
                  <Route path="/pipelines" element={
                    <ProtectedRoute>
                      <PageTransition><Pipelines /></PageTransition>
                    </ProtectedRoute>
                  } />
                  <Route path="/pipelines/builder" element={
                    <ProtectedRoute>
                      <PageTransition><PipelineBuilder /></PageTransition>
                    </ProtectedRoute>
                  } />
                  <Route path="/pipelines/:id/execution" element={
                    <ProtectedRoute>
                      <PageTransition><PipelineExecution /></PageTransition>
                    </ProtectedRoute>
                  } />
                  <Route path="/repositories" element={
                    <ProtectedRoute>
                      <PageTransition><Repositories /></PageTransition>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <PageTransition><Settings /></PageTransition>
                    </ProtectedRoute>
                  } />
                  <Route path="/animations" element={
                    <ProtectedRoute>
                      <PageTransition><div className="min-h-screen bg-background"><AnimationDemo /></div></PageTransition>
                    </ProtectedRoute>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

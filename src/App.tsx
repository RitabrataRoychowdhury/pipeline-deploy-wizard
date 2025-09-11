import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { initializeBrowserCompatibility } from "@/lib/browser-compatibility";
import { initializeAccessibility } from "@/lib/accessibility";
import Index from "./pages/Index";
import Landing from "./pages/landing page/Landing";
// Demo-mode pages (JSON-backed, no network)
import DemoDashboard from "./pages/demo/Dashboard";
import DemoPipelines from "./pages/demo/Pipelines";
import DemoPipelineBuilder from "./pages/demo/PipelineBuilder";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Pipelines from "./pages/Pipelines";
import Repositories from "./pages/Repositories";
import Settings from "./pages/Settings";
import PipelineBuilder from "./pages/PipelineBuilder";
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
  useEffect(() => {
    // Initialize browser compatibility and accessibility features
    const initializeApp = async () => {
      try {
        // Initialize browser compatibility
        await initializeBrowserCompatibility();
        
        // Initialize accessibility features
        initializeAccessibility();
        
        // Set up global error handling
        window.addEventListener('unhandledrejection', (event) => {
          console.error('Unhandled promise rejection:', event.reason);
          // You could send this to an error reporting service
        });

        window.addEventListener('error', (event) => {
          console.error('Global error:', event.error);
          // You could send this to an error reporting service
        });
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

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
                  {/* Root shows the actual app (dashboard). Landing moved to /lander */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/lander" element={<PageTransition><Landing /></PageTransition>} />
                  {/* Demo mode: all URLs under /demo, uses local JSON only */}
                  <Route path="/demo" element={<PageTransition><DemoDashboard /></PageTransition>} />
                  <Route path="/demo/dashboard" element={<PageTransition><DemoDashboard /></PageTransition>} />
                  <Route path="/demo/pipelines" element={<PageTransition><DemoPipelines /></PageTransition>} />
                  <Route path="/demo/pipelines/builder" element={<PageTransition><DemoPipelineBuilder /></PageTransition>} />
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

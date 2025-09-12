import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ErrorHandler } from "@/lib/error-handling";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  usePageTitle("Page Not Found - RustCI");

  useEffect(() => {
    // Log 404 error for analytics
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.handleError(new Error(`404 - Page not found: ${location.pathname}`), {
      component: 'NotFound',
      action: 'pageAccess',
      timestamp: new Date(),
      metadata: {
        pathname: location.pathname,
        search: location.search,
        referrer: document.referrer
      }
    });
  }, [location.pathname, location.search]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-4xl font-bold">404</CardTitle>
          <CardDescription className="text-xl">
            Page Not Found
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              The page you're looking for doesn't exist or has been moved.
              <br />
              <span className="font-mono text-sm text-muted-foreground mt-1 block">
                Path: {location.pathname}
              </span>
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Don't worry, let's get you back on track.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleGoHome} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>

              <Button 
                variant="outline" 
                onClick={handleGoToDashboard}
                className="flex items-center gap-2"
              >
                Dashboard
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;

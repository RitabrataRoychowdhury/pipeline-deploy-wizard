import React from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  success?: boolean;
  error?: boolean;
  successText?: string;
  errorText?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    className, 
    loading = false, 
    loadingText, 
    icon: Icon, 
    children, 
    disabled, 
    success = false,
    error = false,
    successText,
    errorText,
    onSuccess,
    onError,
    onClick,
    ...props 
  }, ref) => {
    const [internalSuccess, setInternalSuccess] = React.useState(false);
    const [internalError, setInternalError] = React.useState(false);

    const isSuccess = success || internalSuccess;
    const isError = error || internalError;
    const isLoading = loading && !isSuccess && !isError;

    React.useEffect(() => {
      if (isSuccess) {
        onSuccess?.();
        const timer = setTimeout(() => setInternalSuccess(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [isSuccess, onSuccess]);

    React.useEffect(() => {
      if (isError) {
        onError?.();
        const timer = setTimeout(() => setInternalError(false), 3000);
        return () => clearTimeout(timer);
      }
    }, [isError, onError]);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        try {
          setInternalError(false);
          setInternalSuccess(false);
          
          const result = onClick(event);
          
          // Handle async operations
          if (result instanceof Promise) {
            try {
              await result;
              setInternalSuccess(true);
            } catch (error) {
              setInternalError(true);
              console.error('Button action failed:', error);
            }
          } else {
            setInternalSuccess(true);
          }
        } catch (error) {
          setInternalError(true);
          console.error('Button action failed:', error);
        }
      }
    };

    const getButtonContent = () => {
      if (isLoading) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || "Loading..."}
          </>
        );
      }
      
      if (isSuccess) {
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {successText || "Success!"}
          </>
        );
      }
      
      if (isError) {
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            {errorText || "Error"}
          </>
        );
      }
      
      return (
        <>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </>
      );
    };

    return (
      <Button
        className={cn(
          "relative transition-all duration-200",
          isLoading && "cursor-not-allowed",
          isSuccess && "bg-green-600 hover:bg-green-700 text-white",
          isError && "bg-red-600 hover:bg-red-700 text-white",
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {getButtonContent()}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;
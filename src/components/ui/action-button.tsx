import React from "react";
import { Loader2, CheckCircle, AlertCircle, Download, Save, Copy, Trash2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ActionType = 'save' | 'export' | 'delete' | 'copy' | 'download' | 'custom';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  action: ActionType;
  loading?: boolean;
  onAction?: () => Promise<void> | void;
  confirmAction?: boolean;
  confirmMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  icon?: React.ComponentType<{ className?: string }>;
  data?: any; // For export/download actions
}

const actionConfig = {
  save: {
    icon: Save,
    defaultSuccessMessage: "Saved successfully",
    defaultErrorMessage: "Failed to save",
    defaultLoadingMessage: "Saving...",
    variant: "default" as const
  },
  export: {
    icon: Download,
    defaultSuccessMessage: "Exported successfully",
    defaultErrorMessage: "Failed to export",
    defaultLoadingMessage: "Exporting...",
    variant: "outline" as const
  },
  delete: {
    icon: Trash2,
    defaultSuccessMessage: "Deleted successfully",
    defaultErrorMessage: "Failed to delete",
    defaultLoadingMessage: "Deleting...",
    variant: "destructive" as const,
    requiresConfirmation: true,
    defaultConfirmMessage: "Are you sure you want to delete this item?"
  },
  copy: {
    icon: Copy,
    defaultSuccessMessage: "Copied to clipboard",
    defaultErrorMessage: "Failed to copy",
    defaultLoadingMessage: "Copying...",
    variant: "outline" as const
  },
  download: {
    icon: Download,
    defaultSuccessMessage: "Downloaded successfully",
    defaultErrorMessage: "Failed to download",
    defaultLoadingMessage: "Downloading...",
    variant: "outline" as const
  },
  custom: {
    icon: undefined,
    defaultSuccessMessage: "Action completed",
    defaultErrorMessage: "Action failed",
    defaultLoadingMessage: "Processing...",
    variant: "default" as const
  }
};

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    action,
    loading = false,
    onAction,
    confirmAction,
    confirmMessage,
    successMessage,
    errorMessage,
    loadingMessage,
    icon,
    data,
    children,
    className,
    variant,
    disabled,
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [isError, setIsError] = React.useState(false);

    const config = actionConfig[action];
    const ActionIcon = icon || config.icon;
    const buttonVariant = variant || config.variant;

    const shouldConfirm = confirmAction ?? config.requiresConfirmation;
    const confirmMsg = confirmMessage || config.defaultConfirmMessage;

    React.useEffect(() => {
      if (isSuccess) {
        const timer = setTimeout(() => setIsSuccess(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [isSuccess]);

    React.useEffect(() => {
      if (isError) {
        const timer = setTimeout(() => setIsError(false), 3000);
        return () => clearTimeout(timer);
      }
    }, [isError]);

    const handleExportAction = async () => {
      if (!data) {
        throw new Error("No data provided for export");
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (typeof data === 'string') {
        content = data;
        filename = 'export.txt';
        mimeType = 'text/plain';
      } else if (action === 'export' && data.yaml) {
        content = data.yaml;
        filename = `${data.name || 'pipeline'}.yaml`;
        mimeType = 'text/yaml';
      } else {
        content = JSON.stringify(data, null, 2);
        filename = 'export.json';
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleCopyAction = async () => {
      if (!data) {
        throw new Error("No data provided for copy");
      }

      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(content);
    };

    const executeAction = async () => {
      try {
        setIsError(false);
        setIsSuccess(false);
        setIsLoading(true);

        // Handle built-in actions
        switch (action) {
          case 'export':
          case 'download':
            await handleExportAction();
            break;
          case 'copy':
            await handleCopyAction();
            break;
          default:
            if (onAction) {
              const result = onAction();
              if (result instanceof Promise) {
                await result;
              }
            }
            break;
        }

        setIsSuccess(true);
        toast.success(successMessage || config.defaultSuccessMessage);
      } catch (error) {
        setIsError(true);
        const errorMsg = errorMessage || config.defaultErrorMessage;
        toast.error(errorMsg);
        console.error(`${action} action failed:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleClick = async () => {
      if (shouldConfirm) {
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }

      await executeAction();
    };

    const getButtonContent = () => {
      const currentLoading = loading || isLoading;
      
      if (currentLoading) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingMessage || config.defaultLoadingMessage}
          </>
        );
      }
      
      if (isSuccess) {
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Success!
          </>
        );
      }
      
      if (isError) {
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Error
          </>
        );
      }
      
      return (
        <>
          {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
          {children}
        </>
      );
    };

    return (
      <Button
        className={cn(
          "transition-all duration-200",
          isLoading && "cursor-not-allowed",
          isSuccess && "bg-green-600 hover:bg-green-700 text-white",
          isError && "bg-red-600 hover:bg-red-700 text-white",
          className
        )}
        variant={isSuccess || isError ? "default" : buttonVariant}
        disabled={disabled || isLoading || loading}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {getButtonContent()}
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
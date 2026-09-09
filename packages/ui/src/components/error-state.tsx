import { AlertCircle } from "lucide-react";
import { Button } from "../primitives/button.js";
import { cn } from "../primitives/utils.js";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h4 className="mt-3 text-sm font-semibold text-red-900 dark:text-red-200">
        {title}
      </h4>
      <p className="mt-1 text-xs text-red-700 max-w-sm dark:text-red-300">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-red-300 text-red-800 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/40"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

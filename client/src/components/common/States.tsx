import { cn } from "@/utils/format";
import type { LucideIcon } from "lucide-react";
import { Inbox, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-md bg-paper-dim", className)} />
);

export const CardSkeleton = () => (
  <div className="rounded-xl border border-line p-4">
    <Skeleton className="mb-3 h-3 w-24" />
    <Skeleton className="h-7 w-32" />
  </div>
);

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-14 text-center">
    <Icon size={28} className="mb-3 text-muted" />
    <p className="font-display text-lg">{title}</p>
    {description && <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-brick/30 bg-brick-soft px-4 py-3 text-sm text-brick">
    <AlertCircle size={16} className="shrink-0" />
    <span>{message}</span>
  </div>
);

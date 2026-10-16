import { useToastStore } from "@/store/toastStore";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/utils/format";

const iconFor = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export const Toaster = () => {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => {
        const Icon = iconFor[t.variant];
        return (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-sm bg-white",
              t.variant === "success" && "border-emerald/30 text-emerald",
              t.variant === "error" && "border-brick/30 text-brick",
              t.variant === "info" && "border-line text-ink"
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { notificationService } from "@/services/insightsService";
import type { AppNotification } from "@/types";
import { cn } from "@/utils/format";
import { formatShortDate } from "@/utils/format";
import { getErrorMessage } from "@/services/api";
import { useToastStore } from "@/store/toastStore";

export const NotificationsPanel = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const push = useToastStore((s) => s.push);

  const load = () => {
    notificationService
      .list()
      .then((res) => {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  const remove = async (id: string) => {
    try {
      await notificationService.remove(id);
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full border border-line text-muted hover:bg-paper-dim"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brick text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-line bg-paper shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="font-display text-base">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-emerald hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</p>
          ) : (
            <div>
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "flex gap-2 border-b border-line px-4 py-3 last:border-0",
                    !n.isRead && "bg-emerald-soft/40"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                    <p className="mt-1 text-[11px] text-muted">{formatShortDate(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)} className="text-muted hover:text-emerald">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => remove(n._id)} className="text-muted hover:text-brick">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

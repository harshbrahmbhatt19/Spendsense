import { useState } from "react";
import { cn } from "@/utils/format";
import { getErrorMessage } from "@/services/api";
import { userService } from "@/services/authService";
import { useToastStore } from "@/store/toastStore";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { CategoriesTab } from "@/components/settings/CategoriesTab";
import { RecurringTab } from "@/components/settings/RecurringTab";
import { RemindersTab } from "@/components/settings/RemindersTab";
import { ReportsTab } from "@/components/settings/ReportsTab";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "categories", label: "Categories" },
  { key: "recurring", label: "Recurring" },
  { key: "reminders", label: "Reminders" },
  { key: "reports", label: "Reports" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export const SettingsPage = () => {
  const [tab, setTab] = useState<TabKey>("profile");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);
  const push = useToastStore((s) => s.push);

  const resetData = async () => {
    setResetting(true);
    try {
      await userService.resetData();
      push("All personal data was reset", "success");
      setShowResetDialog(false);
      window.location.reload();
    } catch (err) {
      push(getErrorMessage(err), "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl">Settings</h1>
        <p className="text-sm text-muted">Manage your profile, categories, and recurring items.</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-line p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm whitespace-nowrap",
              tab === t.key ? "bg-emerald text-white" : "text-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "recurring" && <RecurringTab />}
      {tab === "reminders" && <RemindersTab />}
      {tab === "reports" && <ReportsTab />}

      <section className="rounded-xl border border-brick/30 p-4">
        <h2 className="font-display text-lg text-brick">Danger zone</h2>
        <p className="mt-1 text-sm text-muted">
          Permanently delete your transactions, accounts, budgets, goals, categories, and other personal data.
        </p>
        <button
          onClick={() => setShowResetDialog(true)}
          className="mt-4 rounded-lg border border-brick px-4 py-2 text-sm text-brick hover:bg-brick-soft disabled:opacity-60"
          disabled={resetting}
        >
          Reset all data
        </button>
      </section>

      <ConfirmDialog
        open={showResetDialog}
        title="Reset all data?"
        description="This permanently deletes all of your financial data and AI history. Your profile and password will remain."
        confirmLabel={resetting ? "Resetting..." : "Reset all data"}
        onConfirm={resetData}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};

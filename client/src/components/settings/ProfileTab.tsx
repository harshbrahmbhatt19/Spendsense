import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { userService } from "@/services/authService";
import { getErrorMessage } from "@/services/api";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

export const ProfileTab = () => {
  const { user, setAuth, token } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "INR");
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(user?.monthlyIncomeGoal?.toString() || "0");
  const [savingsTarget, setSavingsTarget] = useState(user?.savingsTarget?.toString() || "0");
  const [saving, setSaving] = useState(false);
  const push = useToastStore((s) => s.push);

  const save = async () => {
    setSaving(true);
    try {
      const res = await userService.update({
        name,
        currency,
        monthlyIncomeGoal: Number(monthlyIncomeGoal) || 0,
        savingsTarget: Number(savingsTarget) || 0,
      });
      setAuth(res.data.data.user, token!);
      push("Profile updated", "success");
    } catch (err) {
      push(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-4 rounded-xl border border-line p-4">
        <div>
          <label className="mb-1 block text-sm text-muted">ID</label>
          <input
            value={user?.userId || ""}
            disabled
            className="w-full rounded-lg border border-line bg-paper-dim px-3 py-2 text-sm text-muted"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-muted">Monthly income goal</label>
            <input
              type="number"
              value={monthlyIncomeGoal}
              onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm tabular outline-none focus:border-emerald"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Savings target</label>
            <input
              type="number"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm tabular outline-none focus:border-emerald"
            />
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <ChangePasswordCard />
    </div>
  );
};

const ChangePasswordCard = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const push = useToastStore((s) => s.push);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      push("New password must be at least 6 characters", "error");
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      push("Password changed", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      push(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-line p-4">
      <h3 className="font-display text-lg">Security</h3>
      <div>
        <label className="mb-1 block text-sm text-muted">Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-paper-dim disabled:opacity-60"
      >
        {saving ? "Updating..." : "Change password"}
      </button>
    </form>
  );
};

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BarChart3,
  Sparkles,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  LogOut,
  Search,
  Moon,
  Sun,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/utils/format";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { authService } from "@/services/authService";
import { NotificationsPanel } from "@/components/common/NotificationsPanel";
import { SearchPalette } from "@/components/common/SearchPalette";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/app/accounts", label: "Accounts", icon: Wallet },
  { to: "/app/budgets", label: "Budgets & Goals", icon: Target },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = NAV_ITEMS.slice(0, 5);
const MOBILE_MORE = NAV_ITEMS.slice(5);

export const AppLayout = () => {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useUIStore();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showAddTx, setShowAddTx] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-paper transition-all duration-200 md:flex",
            sidebarCollapsed ? "w-[72px]" : "w-60"
          )}
        >
          <div className="flex items-center gap-2 px-4 py-5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald text-white font-display text-base">
              S
            </div>
            {!sidebarCollapsed && <span className="font-display text-lg">SpendSense</span>}
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-emerald-soft text-emerald font-medium"
                      : "text-ink/70 hover:bg-paper-dim"
                  )
                }
              >
                <item.icon size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-1 border-t border-line px-3 py-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-paper-dim"
            >
              <LogOut size={18} />
              {!sidebarCollapsed && <span>Log out</span>}
            </button>
            <button
              onClick={toggleSidebar}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-paper-dim"
            >
              {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-h-screen flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="md:hidden font-display text-lg">SpendSense</div>
            <div className="hidden md:block text-sm text-muted">
              Welcome back, {user?.name?.split(" ")[0] || user?.userId}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                className="hidden items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-paper-dim md:flex"
              >
                <Search size={14} />
                <span>Search</span>
                <kbd className="rounded border border-line bg-paper-dim px-1.5 py-0.5 text-[10px]">⌘K</kbd>
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="flex size-9 items-center justify-center rounded-full border border-line text-muted hover:bg-paper-dim md:hidden"
              >
                <Search size={16} />
              </button>
              <button
                onClick={toggleTheme}
                className="hidden size-9 items-center justify-center rounded-full border border-line text-muted hover:bg-paper-dim md:flex"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <NotificationsPanel />
              <button
                onClick={() => setShowAddTx(true)}
                className="hidden items-center gap-1.5 rounded-lg bg-emerald px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 md:flex"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add transaction</span>
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile overflow navigation */}
      {showMobileMore && (
        <div className="fixed bottom-[4.25rem] right-3 z-40 w-52 rounded-xl border border-line bg-paper p-2 shadow-xl md:hidden">
          {MOBILE_MORE.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setShowMobileMore(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm",
                  isActive ? "bg-emerald-soft text-emerald font-medium" : "text-ink/70"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-ink/70"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-ink/70"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-line bg-paper/95 px-1 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[11px]",
                isActive ? "text-emerald" : "text-muted"
              )
            }
          >
            <item.icon size={20} />
            {item.label.split(" ")[0]}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setShowMobileMore((visible) => !visible)}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[11px]",
            showMobileMore ? "text-emerald" : "text-muted"
          )}
          aria-label="More navigation options"
          aria-expanded={showMobileMore}
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>

      {/* Mobile floating action button */}
      <button
        onClick={() => setShowAddTx(true)}
        className="fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-emerald text-white shadow-lg md:hidden"
        aria-label="Add transaction"
      >
        <Plus size={22} />
      </button>

      {showAddTx && <AddTransactionModal onClose={() => setShowAddTx(false)} />}
      <SearchPalette open={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
};

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { AccountsPage } from "@/pages/AccountsPage";
import { BudgetsGoalsPage } from "@/pages/BudgetsGoalsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { AIAssistantPage } from "@/pages/AIAssistantPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { Toaster } from "@/components/common/Toaster";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/transactions" element={<TransactionsPage />} />
            <Route path="/app/accounts" element={<AccountsPage />} />
            <Route path="/app/budgets" element={<BudgetsGoalsPage />} />
            <Route path="/app/analytics" element={<AnalyticsPage />} />
            <Route path="/app/assistant" element={<AIAssistantPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

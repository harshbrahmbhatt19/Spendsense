import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const ProtectedRoute = () => {
  const { token, hydrated } = useAuthStore();
  if (!hydrated) {
    return <div className="min-h-screen bg-paper" />;
  }
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

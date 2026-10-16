import { Outlet, Link } from "react-router-dom";

export const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-paper px-4">
    <div className="w-full max-w-sm">
      <Link to="/" className="mb-8 flex items-center justify-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald text-white font-display text-base">
          S
        </div>
        <span className="font-display text-xl">SpendSense</span>
      </Link>
      <Outlet />
    </div>
  </div>
);

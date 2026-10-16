import { api } from "@/services/api";
import type { User } from "@/types";

export const authService = {
  register: (data: { name: string; userId: string; password: string }) =>
    api.post<{ success: boolean; data: { user: User; token: string } }>("/auth/register", data),

  login: (data: { userId: string; password: string }) =>
    api.post<{ success: boolean; data: { user: User; token: string } }>("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  me: () => api.get<{ success: boolean; data: { user: User } }>("/auth/me"),
};

export const userService = {
  update: (data: Partial<User>) =>
    api.patch<{ success: boolean; data: { user: User } }>("/users/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/users/change-password", data),
  resetData: () => api.delete("/users/me/data"),
};

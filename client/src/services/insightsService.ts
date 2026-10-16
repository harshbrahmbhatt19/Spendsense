import { api } from "@/services/api";
import type { AIMessage, AppNotification, DashboardData, Insight } from "@/types";

export const analyticsService = {
  dashboard: () => api.get<{ data: DashboardData }>("/analytics/dashboard"),
  overview: (params: Record<string, any> = {}) =>
    api.get<{ data: any }>("/analytics/overview", { params }),
  heatmap: (year?: number) =>
    api.get<{ data: { date: string; total: number }[] }>("/analytics/heatmap", {
      params: year ? { year } : {},
    }),
};

export const insightsService = {
  list: () => api.get<{ data: Insight[] }>("/insights"),
};

export const predictionService = {
  get: () => api.get<{ data: any }>("/predictions"),
};

export const healthScoreService = {
  get: () => api.get<{ data: any }>("/financial-health"),
};

export const aiService = {
  ask: (message: string) =>
    api.post<{ data: { reply: string; conversationId: string } }>("/ai/ask", { message }),
  history: () => api.get<{ data: AIMessage[] }>("/ai/history"),
  reset: () => api.delete("/ai/history"),
};

export const notificationService = {
  list: () => api.get<{ data: AppNotification[]; unreadCount: number }>("/notifications"),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/read-all"),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};

export const searchService = {
  search: (q: string) => api.get<{ data: any }>("/search", { params: { q } }),
};

import api from './client';
import { Notification } from '../types';

export const notificationsApi = {
  list: (page = 1) =>
    api.get<{ data: Notification[]; unread_count: number }>('/notifications', {
      params: { page, per_page: 50 },
    }),

  markRead: (notifId: string) =>
    api.patch(`/notifications/${notifId}/read`),

  markAllRead: () => api.post('/notifications/read-all'),

  registerPushToken: (token: string, platform: 'ios' | 'android') =>
    api.post('/notifications/push-token', { token, platform }),
};

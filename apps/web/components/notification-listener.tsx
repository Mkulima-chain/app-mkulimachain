'use client';

import { useNotifications } from '@/hooks/use-notifications';

export const NotificationListener = () => {
  useNotifications();
  return null;
};

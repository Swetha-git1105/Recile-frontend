import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getNotifications,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/api";

import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

// How often the unread number is checked while the app is open
const POLL_MS = 30000;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Whole list + unread number
  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getNotifications();

      setItems(Array.isArray(data?.items) ? data.items : []);
      setUnreadCount(Number(data?.unreadCount) || 0);
    } catch {
      // The bell keeps its last number; it is checked again soon.
    } finally {
      setLoading(false);
    }
  }, []);

  // Only the unread number (cheap)
  const refreshCount = useCallback(async () => {
    try {
      setUnreadCount(await getNotificationCount());
    } catch {
      // ignored
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return undefined;
    }

    refresh();

    const timer = window.setInterval(refreshCount, POLL_MS);

    function handleVisible() {
      if (document.visibilityState === "visible") refreshCount();
    }

    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [user, refresh, refreshCount]);

  const markRead = useCallback(async (id) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, seen: true } : item))
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await markNotificationRead(id);
    } catch {
      refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setItems((current) => current.map((item) => ({ ...item, seen: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  const value = useMemo(
    () => ({ items, unreadCount, loading, refresh, markRead, markAllRead }),
    [items, unreadCount, loading, refresh, markRead, markAllRead]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
}

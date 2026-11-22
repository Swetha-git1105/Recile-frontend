import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import "../styles/LearnPage.css";
import "../styles/NotificationsPage.css";

// "5 min ago", "2 h ago", or the date for older ones
function timeAgo(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} h ago`;

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

// Where a notification leads
function actionFor(item) {
  if (item.type === "RESOURCE_REQUEST" || item.type === "RESOURCE_WANTED") {
    return { to: "/upload", label: "Upload it" };
  }

  if (item.type === "ANSWER") {
    return { to: "/solve", label: "View answers" };
  }

  if (item.type === "QUESTION") {
    return { to: "/solve", label: "Solve it" };
  }

  return null;
}

export default function NotificationsPage() {
  const { items, unreadCount, loading, refresh, markRead, markAllRead } =
    useNotifications();

  return (
    <main className="learn-page notifications-page">
      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">LATEST ACTIVITY</span>
          <h1>Notifications</h1>
          <p>
            {unreadCount > 0
              ? `You have ${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}.`
              : "You are all caught up."}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="notifications-markall"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        )}
      </section>

      <section className="learn-explorer notifications-card">
        {loading && !items.length && (
          <p className="learn-status-text">Loading notifications...</p>
        )}

        {!loading && !items.length && (
          <div className="learn-empty">
            <span>No notifications yet</span>
            <p>
              When someone requests a resource or answers your question, it
              shows up here.
            </p>

            <button
              type="button"
              className="notifications-refresh"
              onClick={refresh}
            >
              Refresh
            </button>
          </div>
        )}

        {items.length > 0 && (
          <ul className="notifications-list">
            {items.map((item) => {
              const action = actionFor(item);

              return (
                <li
                  key={item.id}
                  className={item.seen ? "" : "unread"}
                  onClick={() => !item.seen && markRead(item.id)}
                >
                  <span className="notifications-dot" aria-hidden="true" />

                  <div className="notifications-text">
                    <p>{item.message}</p>

                    <small>
                      {timeAgo(item.createdAt)}
                      {!item.seen && " · New"}
                    </small>
                  </div>

                  {action && (
                    <Link
                      className="notifications-action"
                      to={action.to}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!item.seen) markRead(item.id);
                      }}
                    >
                      {action.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
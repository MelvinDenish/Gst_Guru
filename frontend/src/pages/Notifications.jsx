import { useState, useEffect } from "react";
import { notificationsAPI } from "../api";
import Toast from "../components/Toast";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const load = async () => {
        try {
            const { data } = await notificationsAPI.list();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch { setToast({ message: "Failed to load notifications", type: "error" }); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const markRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);
            load();
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            load();
            setToast({ message: "All marked as read", type: "success" });
        } catch { }
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page notifications-page">
            <div className="page-header">
                <h1>🔔 Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h1>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary" onClick={markAllRead}>Mark All Read</button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">🔔</span>
                    <h3>No notifications</h3>
                    <p>Subscribe to rate alerts on your products to get notified of changes</p>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`notification-item glass-card ${!n.read_at ? "unread" : ""}`}
                            onClick={() => !n.read_at && markRead(n.id)}
                        >
                            <span className="notif-icon">
                                {n.type === "rate_change" ? "📊" : "⏰"}
                            </span>
                            <div className="notif-content">
                                <p className="notif-message">{n.message}</p>
                                <span className="notif-time">{new Date(n.created_at).toLocaleString("en-IN")}</span>
                            </div>
                            {!n.read_at && <span className="unread-dot"></span>}
                        </div>
                    ))}
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}

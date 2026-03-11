import { useState, useEffect } from "react";
import { filingsAPI } from "../api";
import Toast from "../components/Toast";

export default function TaxCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [viewMonths, setViewMonths] = useState(3);
    const [filter, setFilter] = useState("all"); // all, upcoming, overdue, done

    const loadCalendar = async () => {
        setLoading(true);
        try {
            const { data } = await filingsAPI.calendar({ months: viewMonths });
            setEvents(data.events || []);
        } catch {
            setToast({ message: "Failed to load calendar", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCalendar(); }, [viewMonths]);

    const filteredEvents = events.filter(e => {
        if (filter === "all") return true;
        if (filter === "upcoming") return e.urgency === "normal" || e.urgency === "warning" || e.urgency === "urgent";
        if (filter === "overdue") return e.urgency === "overdue";
        if (filter === "done") return e.urgency === "done";
        return true;
    });

    // Group events by month
    const groupedByMonth = {};
    filteredEvents.forEach(e => {
        const d = new Date(e.due_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        if (!groupedByMonth[key]) groupedByMonth[key] = { label, events: [] };
        groupedByMonth[key].events.push(e);
    });

    const getUrgencyBadge = (urgency) => {
        const map = {
            urgent: <span className="status-badge overdue">🔴 Urgent</span>,
            warning: <span className="status-badge partial">⚠️ Soon</span>,
            normal: <span className="status-badge unpaid">📅 Upcoming</span>,
            overdue: <span className="status-badge overdue">❌ Overdue</span>,
            done: <span className="status-badge paid">✅ Filed</span>,
        };
        return map[urgency] || <span className="status-badge">{urgency}</span>;
    };

    const getDaysLeft = (dateStr) => {
        const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `${Math.abs(diff)} days overdue`;
        if (diff === 0) return "Today!";
        if (diff === 1) return "Tomorrow";
        return `${diff} days left`;
    };

    const stats = {
        total: events.length,
        urgent: events.filter(e => e.urgency === "urgent").length,
        overdue: events.filter(e => e.urgency === "overdue").length,
        done: events.filter(e => e.urgency === "done").length,
        upcoming: events.filter(e => e.urgency === "normal" || e.urgency === "warning").length,
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page tax-calendar-page">
            <div className="page-header">
                <h1>📅 <span className="gradient-text">Tax Calendar</span></h1>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <select className="input" value={viewMonths} onChange={e => setViewMonths(parseInt(e.target.value))}
                        style={{ width: "140px" }}>
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="dashboard-stats">
                <div className="stat-card glass-card">
                    <span className="stat-icon">📋</span>
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Events</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">🔴</span>
                    <span className="stat-value">{stats.urgent}</span>
                    <span className="stat-label">Urgent (&lt;3 days)</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">❌</span>
                    <span className="stat-value">{stats.overdue}</span>
                    <span className="stat-label">Overdue</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">✅</span>
                    <span className="stat-value">{stats.done}</span>
                    <span className="stat-label">Filed</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {["all", "upcoming", "overdue", "done"].map(f => (
                    <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}>
                        {f === "all" ? `All (${stats.total})` :
                         f === "upcoming" ? `Upcoming (${stats.upcoming})` :
                         f === "overdue" ? `Overdue (${stats.overdue})` :
                         `Filed (${stats.done})`}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            {Object.keys(groupedByMonth).length === 0 ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">📅</span>
                    <h3>No events found</h3>
                    <p>Adjust the time range or add filing records to see deadlines</p>
                </div>
            ) : (
                <div className="calendar-timeline">
                    {Object.entries(groupedByMonth).map(([key, group]) => (
                        <div key={key} className="calendar-month-group">
                            <h3 className="calendar-month-header">
                                <span className="month-label">{group.label}</span>
                                <span className="month-count">{group.events.length} event{group.events.length !== 1 ? "s" : ""}</span>
                            </h3>
                            <div className="calendar-events">
                                {group.events.map(event => (
                                    <div key={event.id} className={`calendar-event glass-card urgency-${event.urgency}`}>
                                        <div className="event-date-col">
                                            <span className="event-day">{new Date(event.due_date).getDate()}</span>
                                            <span className="event-month">
                                                {new Date(event.due_date).toLocaleDateString("en-IN", { month: "short" })}
                                            </span>
                                        </div>
                                        <div className="event-details">
                                            <div className="event-header-row">
                                                <span className="code-badge">{event.return_type}</span>
                                                {getUrgencyBadge(event.urgency)}
                                                {event.type === "auto" && <span className="auto-badge">Auto</span>}
                                            </div>
                                            <p className="event-desc">{event.description}</p>
                                            <span className="event-period">{event.period}</span>
                                        </div>
                                        <div className="event-countdown">
                                            <span className={`countdown ${event.urgency}`}>{getDaysLeft(event.due_date)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}

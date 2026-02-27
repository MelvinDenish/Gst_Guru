import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast toast-${type} ${visible ? "toast-enter" : "toast-exit"}`}>
            <span className="toast-icon">
                {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
            </span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>×</button>
        </div>
    );
}

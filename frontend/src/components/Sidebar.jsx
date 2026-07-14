import { Home, PlaySquare, Clock } from "lucide-react";

export default function Sidebar({ isCollapsed }) {
    const navItems = [
        { icon: <Home size={24} />, label: "Home", active: true },
        { icon: <PlaySquare size={24} />, label: "Subscriptions" },
        { icon: <Clock size={24} />, label: "You" },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {navItems.map((item, index) => (
                <a
                    key={index}
                    href="#"
                    className={`sidebar-item ${item.active ? "active" : ""}`}
                >
                    {item.icon}
                    <span className="sidebar-item-text">{item.label}</span>
                </a>
            ))}
        </aside>
    );
}

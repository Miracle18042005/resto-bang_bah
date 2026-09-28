import { useState } from "react";
import "./css/adminlayout.css";

function AdminLayout({ children, activePage, onNavigate }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const savedAdminUser = 
        localStorage.getItem("adminUser");

    let adminUser = null;

    try {
        adminUser = savedAdminUser
            ? JSON.parse(savedAdminUser)
            : null;
    } catch {
        adminUser = null;
    }

    const handleNavigate = (page) => {
        onNavigate(page);
        setSidebarOpen(false);
    };

    return (
        <div className="admin-layout">

            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`admin-sidebar ${
                    sidebarOpen ? "open" : ""
                }`}
            >
                <div className="admin-logo">
                    <span>Bang Bah</span>
                    <small>Admin Dashboard</small>
                </div>

                {adminUser && (
                    <div className="admin-user-info">
                        <strong>
                            {adminUser.name || "Admin"}
                        </strong>

                        <small>
                            Administrator
                        </small>
                    </div>
                )}

                <nav className="admin-nav">

                    <button
                        className={`admin-nav-item ${
                            activePage === "dashboard"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigate("dashboard")
                        }
                    >
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activePage === "orders"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigate("orders")
                        }
                    >
                        📦
                        <span>Pesanan</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activePage === "payments"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigate("payments")
                        }
                    >
                        💳
                        <span>Pembayaran</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activePage === "menu"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigate("menu")
                        }
                    >
                        🍗
                        <span>Menu</span>
                    </button>

                </nav>

                <div className="admin-sidebar-bottom">
                    <button
                        className="admin-nav-item logout"
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            localStorage.removeItem("adminUser");
                            window.location.href = "/admin";
                        }}
                    >
                        🚪
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="admin-main">

                <header className="admin-header">
                    <button
                        className="admin-menu-button"
                        onClick={() =>
                            setSidebarOpen(!sidebarOpen)
                        }
                    >
                        ☰
                    </button>

                    <div>
                        <h1>
                            {activePage === "dashboard" &&
                                "Dashboard"}

                            {activePage === "orders" &&
                                "Pesanan"}

                            {activePage === "payments" &&
                                "Pembayaran"}

                            {activePage === "menu" &&
                                "Menu"}
                        </h1>

                        <p>
                            Resto Bang Bah
                            {adminUser?.name &&
                                ` • ${adminUser.name}`}
                        </p>
                    </div>
                </header>

                <main className="admin-content">
                    {children}
                </main>

            </div>
        </div>
    );
}

export default AdminLayout;

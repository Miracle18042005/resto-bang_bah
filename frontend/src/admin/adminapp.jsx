import { useEffect, useState } from "react";
import "./css/admindashboard.css";
import AdminLayout from "./adminlayout";
import AdminOrders from "./adminorders";
import AdminPayments from "./adminpayments";
import AdminLogin from "./auth/AdminLogin";
import AdminMenu from "./adminmenu";

function AdminApp() {
    const [activePage, setActivePage] = useState("dashboard");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [newOrderCount, setNewOrderCount] = useState(0);
    const [lastOrderCount, setLastOrderCount] = useState(null);

    const [newPaymentCount, setNewPaymentCount] = useState(0);
    const [lastPaymentSubmittedCount, setLastPaymentSubmittedCount] = 
        useState(null);

    const token = localStorage.getItem("adminToken");
    const savedUser = localStorage.getItem("adminUser");

    let user = null;

    try {
        user = savedUser
            ? JSON.parse(savedUser)
            : null;
    } catch {
        user = null;
    }

    if (!token || !user || user.role !== "admin") {
        return <AdminLogin />;
    }

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                "http://localhost:5000/api/admin/orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal mengambil pesanan"
                );
            }

            const newOrders = result.data || [];

            const paymentSubmittedCount = newOrders.filter(
                (order) => order.status === "payment_submitted"
            ).length;

            if (
                lastPaymentSubmittedCount !== null &&
                paymentSubmittedCount > lastPaymentSubmittedCount
            ) {
                setNewPaymentCount(
                    (current) =>
                        current +
                    (paymentSubmittedCount - lastPaymentSubmittedCount)
                );
            }

            setLastPaymentSubmittedCount(paymentSubmittedCount);

            if (
                lastOrderCount !== null &&
                newOrders.length > lastOrderCount
            ) {
                setNewOrderCount(
                    (current) =>
                        current +
                        (newOrders.length - lastOrderCount)
                );
            }

            setOrders(newOrders);
            setLastOrderCount(newOrders.length);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(
            fetchOrders,
            5000
        );

        return () => clearInterval(interval);
    }, []);

    const totalOrders = orders.length;

    const waitingPayment = orders.filter(
        (order) =>
            order.status === "waiting_payment" ||
            order.status === "payment_submitted"
    ).length;

    const processingOrders = orders.filter(
        (order) =>
            order.status === "processing" ||
            order.status === "ready_for_pickup" ||
            order.status === "ready_for_delivery" ||
            order.status === "out_for_delivery"
    ).length;

    const completedOrders = orders.filter(
        (order) =>
            order.status === "completed"
    ).length;

    const statusLabels = {
        waiting_payment: "Menunggu Pembayaran",
        payment_submitted: "Menunggu Verifikasi",
        payment_rejected: "Pembayaran Ditolak",
        payment_verified:
            "Pembayaran Terverifikasi",
        processing: "Diproses",
        ready_for_pickup: "Siap Diambil",
        ready_for_delivery: "Siap Dikirim",
        out_for_delivery: "Dalam Perjalanan",
        completed: "Selesai",
        cancelled: "Dibatalkan",
    };

    const handleNavigate = (page) => {
        setActivePage(page);

        if (page === "orders") {
            setNewOrderCount(0);
        }
    };

    const renderDashboard = () => (
        <div className="admin-dashboard">

            <div className="dashboard-title">
                <h2>Dashboard</h2>
                <p>
                    Ringkasan aktivitas Resto Bang Bah
                </p>
            </div>

            {newOrderCount > 0 && (
                <div className="new-order-notification">
                    <div>
                        <strong>
                            🔔 Pesanan baru masuk!
                        </strong>

                        <span>
                            Ada {newOrderCount} pesanan baru
                            yang perlu diperiksa.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigate("orders")
                        }
                    >
                        Lihat Pesanan
                    </button>
                </div>
            )}

            {newPaymentCount > 0 && (
                <div className="new-payment-notification">
                    <div>
                        <strong>
                            Pembayaran Masuk!
                        </strong>

                        <span>
                            Ada {newPaymentCount} pembayaran yang perlu diverifikasi.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setActivePage("payments");
                            setNewPaymentCount(0);
                        }}
                    >
                        Lihat Pembayaran
                    </button>
                </div>
            )}

            {loading && (
                <p>
                    Memuat data dashboard...
                </p>
            )}

            {error && (
                <p className="admin-error">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    <div className="stats-grid">

                        <div className="stat-card">
                            <span>
                                Total Pesanan
                            </span>

                            <strong>
                                {totalOrders}
                            </strong>

                            <small>
                                Semua pesanan
                            </small>
                        </div>

                        <div className="stat-card">
                            <span>
                                Menunggu Pembayaran
                            </span>

                            <strong>
                                {waitingPayment}
                            </strong>

                            <small>
                                Perlu perhatian
                            </small>
                        </div>

                        <div className="stat-card">
                            <span>
                                Sedang Berjalan
                            </span>

                            <strong>
                                {processingOrders}
                            </strong>

                            <small>
                                Pesanan aktif
                            </small>
                        </div>

                        <div className="stat-card">
                            <span>
                                Pesanan Selesai
                            </span>

                            <strong>
                                {completedOrders}
                            </strong>

                            <small>
                                Total selesai
                            </small>
                        </div>

                    </div>

                    <div className="dashboard-section">

                        <div className="section-title">
                            <h3>
                                Status Pesanan
                            </h3>

                            <span>
                                {orders.length} pesanan
                            </span>
                        </div>

                        <div className="status-list">

                            {Object.entries(
                                statusLabels
                            ).map(
                                ([
                                    status,
                                    label,
                                ]) => {
                                    const count =
                                        orders.filter(
                                            (order) =>
                                                order.status ===
                                                status
                                        ).length;

                                    const percentage =
                                        totalOrders > 0
                                            ? (count /
                                                  totalOrders) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            className="status-row"
                                            key={status}
                                        >
                                            <div className="status-info">

                                                <span>
                                                    {label}
                                                </span>

                                                <strong>
                                                    {count}
                                                </strong>

                                            </div>

                                            <div className="status-bar">

                                                <div
                                                    className="status-bar-fill"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />

                                            </div>
                                        </div>
                                    );
                                }
                            )}

                        </div>
                    </div>

                    <div className="dashboard-section">

                        <div className="section-title">

                            <h3>
                                Pesanan Terbaru
                            </h3>

                            <span>
                                {Math.min(
                                    orders.length,
                                    5
                                )}{" "}
                                terbaru
                            </span>

                        </div>

                        {orders.length === 0 ? (
                            <p className="empty-dashboard">
                                Belum ada pesanan.
                            </p>
                        ) : (
                            <div className="recent-orders">

                                {orders
                                    .slice(0, 5)
                                    .map(
                                        (order) => (
                                            <div
                                                className="recent-order"
                                                key={
                                                    order._id
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            order
                                                                .customer
                                                                ?.name
                                                        }
                                                    </span>

                                                </div>

                                                <div>

                                                    <strong>
                                                        Rp{" "}
                                                        {order.total?.toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {
                                                            statusLabels[
                                                                order.status
                                                            ] ||
                                                            order.status
                                                        }
                                                    </span>

                                                </div>

                                            </div>
                                        )
                                    )}

                            </div>
                        )}

                    </div>
                </>
            )}

        </div>
    );

    return (
        <AdminLayout
            activePage={activePage}
            onNavigate={handleNavigate}
        >
            {activePage === "dashboard" && (
                renderDashboard()
            )}

            {activePage === "orders" && (
                <AdminOrders />
            )}

            {activePage === "payments" && (
                <AdminPayments />
            )}

            {activePage === "menu" && (
                <AdminMenu />
            )}
        </AdminLayout>
    );
}

export default AdminApp;
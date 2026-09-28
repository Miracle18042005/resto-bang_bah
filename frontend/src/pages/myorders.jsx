import { useEffect, useState } from "react";
import "../css/myorders.css";

function MyOrders({ onBack, onPayment, onOrderDetail }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filter, setFilter] = useState("all");
    const [notification, setNotification] = useState("");

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setOrders([]);
                setError("Silakan login terlebih dahulu.");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/orders/my-orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Gagal mengambil orders:", data);

                setOrders([]);
                setError(
                    data.message || "Gagal mengambil data pesanan."
                );

                return;
            }

            /*
             * Backend bisa mengembalikan:
             *
             * [...]
             *
             * atau:
             *
             * { orders: [...] }
             *
             * atau:
             *
             * { data: [...] }
             *
             * Kita normalisasi semuanya menjadi array.
             */
            let ordersData = [];

            if (Array.isArray(data)) {
                ordersData = data;
            } else if (Array.isArray(data.orders)) {
                ordersData = data.orders;
            } else if (Array.isArray(data.data)) {
                ordersData = data.data;
            }

            setOrders(ordersData);
            setError("");
        } catch (err) {
            console.error("Fetch orders error:", err);

            setOrders([]);
            setError("Tidak dapat terhubung ke server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(() => {
            fetchOrders();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusText = (status) => {
        const statusMap = {
            waiting_payment: "Menunggu Pembayaran",
            payment_submitted: "Menunggu Verifikasi",
            payment_verified: "Pembayaran Terverifikasi",
            payment_rejected: "Pembayaran Ditolak",
            processing: "Sedang Diproses",
            ready_for_pickup: "Siap Diambil",
            ready_for_delivery: "Siap Dikirim",
            out_for_delivery: "Dalam Perjalanan",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };

        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "completed":
                return "completed";

            case "cancelled":
            case "payment_rejected":
                return "cancelled";

            case "processing":
            case "ready_for_pickup":
            case "ready_for_delivery":
            case "out_for_delivery":
            case "payment_verified":
                return "processing";

            default:
                return "waiting";
        }
    };

    const getOrderTypeText = (type) => {
        return type === "delivery"
            ? "Delivery"
            : "Ambil Sendiri";
    };

    const formatPrice = (price) => {
        return `Rp ${Number(price || 0).toLocaleString(
            "id-ID"
        )}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    /*
     * Pengaman tambahan:
     * filteredOrders SELALU bekerja dengan array.
     */
    const safeOrders = Array.isArray(orders) ? orders : [];

    const filteredOrders = safeOrders.filter((order) => {
        if (filter === "all") {
            return true;
        }

        if (filter === "waiting") {
            return [
                "waiting_payment",
                "payment_submitted",
                "payment_rejected",
            ].includes(order.status);
        }

        if (filter === "processing") {
            return [
                "payment_verified",
                "processing",
                "ready_for_pickup",
                "ready_for_delivery",
                "out_for_delivery",
            ].includes(order.status);
        }

        if (filter === "completed") {
            return order.status === "completed";
        }

        if (filter === "cancelled") {
            return order.status === "cancelled";
        }

        return true;
    });

    const handlePayment = (order) => {
        if (onPayment) {
            onPayment(order);
        }
    };

    const handleOrderDetail = (order) => {
        if (onOrderDetail && order?._id) {
            onOrderDetail(order._id);
        }
    };

    const handleCancel = async (orderId) => {
        const confirmed = window.confirm(
            "Yakin ingin membatalkan pesanan ini?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}/cancel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Gagal membatalkan pesanan."
                );
            }

            setNotification(
                "Pesanan berhasil dibatalkan."
            );

            await fetchOrders();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="orders-loading">
                    <div className="orders-spinner"></div>

                    <p>Memuat pesanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="my-orders-container">
                {/* HEADER */}

                <div className="my-orders-header">
                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ← Kembali
                    </button>

                    <div>
                        <span>PESANAN SAYA</span>

                        <h1>Riwayat Pesanan</h1>
                    </div>
                </div>

                {/* NOTIFICATION */}

                {notification && (
                    <div className="status-notification">
                        <span>✓</span>

                        <p>{notification}</p>

                        <button
                            onClick={() =>
                                setNotification("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* ERROR */}

                {error && (
                    <div className="orders-error">
                        {error}
                    </div>
                )}

                {/* FILTER */}

                <div className="order-filters">
                    <button
                        className={
                            filter === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("all")
                        }
                    >
                        Semua
                    </button>

                    <button
                        className={
                            filter === "waiting"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("waiting")
                        }
                    >
                        Menunggu
                    </button>

                    <button
                        className={
                            filter === "processing"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("processing")
                        }
                    >
                        Diproses
                    </button>

                    <button
                        className={
                            filter === "completed"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("completed")
                        }
                    >
                        Selesai
                    </button>

                    <button
                        className={
                            filter === "cancelled"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("cancelled")
                        }
                    >
                        Dibatalkan
                    </button>
                </div>

                {/* EMPTY */}

                {filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-orders-icon">
                            🍽️
                        </div>

                        <h2>Belum Ada Pesanan</h2>

                        <p>
                            Pesanan kamu akan muncul
                            di sini.
                        </p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div
                                className="order-card"
                                key={order._id}
                            >
                                {/* TOP */}

                                <div className="order-card-top">
                                    <div>
                                        <span className="order-number-label">
                                            Nomor Pesanan
                                        </span>

                                        <h2>
                                            {
                                                order.orderNumber
                                            }
                                        </h2>

                                        <p>
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </p>
                                    </div>

                                    <span
                                        className={`order-status ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusText(
                                            order.status
                                        )}
                                    </span>
                                </div>

                                {/* INFO */}

                                <div className="order-card-info">
                                    <div>
                                        <span>
                                            Jenis
                                        </span>

                                        <strong>
                                            {getOrderTypeText(
                                                order.orderType
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatPrice(
                                                order.totalAmount ??
                                                    order.total
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                {/* ITEMS */}

                                <div className="order-card-items">
                                    {Array.isArray(
                                        order.items
                                    ) &&
                                        order.items
                                            .slice(0, 3)
                                            .map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            item._id ||
                                                            item.menuId ||
                                                            index
                                                        }
                                                    >
                                                        <span>
                                                            {
                                                                item.quantity
                                                            }{" "}
                                                            x{" "}
                                                            {
                                                                item.name
                                                            }
                                                        </span>

                                                        <strong>
                                                            {formatPrice(
                                                                Number(
                                                                    item.subtotal ??
                                                                        Number(
                                                                            item.price ||
                                                                                0
                                                                        ) *
                                                                            Number(
                                                                                item.quantity ||
                                                                                    0
                                                                            )
                                                                )
                                                            )}
                                                        </strong>
                                                    </div>
                                                )
                                            )}

                                    {Array.isArray(
                                        order.items
                                    ) &&
                                        order.items.length >
                                            3 && (
                                            <p>
                                                +
                                                {order.items
                                                    .length -
                                                    3}{" "}
                                                item lainnya
                                            </p>
                                        )}
                                </div>

                                {/* TRACKING MINI */}

                                {order.status !==
                                    "cancelled" && (
                                    <div className="mini-tracking">
                                        <div
                                            className={
                                                [
                                                    "waiting_payment",
                                                    "payment_submitted",
                                                    "payment_rejected",
                                                ].includes(
                                                    order.status
                                                )
                                                    ? "active"
                                                    : "done"
                                            }
                                        >
                                            <span>1</span>

                                            <small>
                                                Pesan
                                            </small>
                                        </div>

                                        <div
                                            className={
                                                [
                                                    "payment_verified",
                                                    "processing",
                                                    "ready_for_pickup",
                                                    "ready_for_delivery",
                                                    "out_for_delivery",
                                                    "completed",
                                                ].includes(
                                                    order.status
                                                )
                                                    ? "done"
                                                    : ""
                                            }
                                        >
                                            <span>2</span>

                                            <small>
                                                Proses
                                            </small>
                                        </div>

                                        <div
                                            className={
                                                [
                                                    "ready_for_pickup",
                                                    "ready_for_delivery",
                                                    "out_for_delivery",
                                                    "completed",
                                                ].includes(
                                                    order.status
                                                )
                                                    ? "done"
                                                    : ""
                                            }
                                        >
                                            <span>3</span>

                                            <small>
                                                Kirim
                                            </small>
                                        </div>

                                        <div
                                            className={
                                                order.status ===
                                                "completed"
                                                    ? "done"
                                                    : ""
                                            }
                                        >
                                            <span>✓</span>

                                            <small>
                                                Selesai
                                            </small>
                                        </div>
                                    </div>
                                )}

                                {/* ACTIONS */}

                                <div className="order-card-actions">
                                    <button
                                        className="detail-button"
                                        onClick={() =>
                                            handleOrderDetail(
                                                order
                                            )
                                        }
                                    >
                                        Lihat Detail
                                    </button>

                                    {[
                                        "waiting_payment",
                                        "payment_rejected",
                                    ].includes(
                                        order.status
                                    ) && (
                                        <button
                                            className="payment-button"
                                            onClick={() =>
                                                handlePayment(
                                                    order
                                                )
                                            }
                                        >
                                            Bayar Sekarang
                                        </button>
                                    )}

                                    {[
                                        "waiting_payment",
                                        "payment_submitted",
                                        "payment_rejected",
                                    ].includes(
                                        order.status
                                    ) && (
                                        <button
                                            className="cancel-button"
                                            onClick={() =>
                                                handleCancel(
                                                    order._id
                                                )
                                            }
                                        >
                                            Batalkan
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyOrders;
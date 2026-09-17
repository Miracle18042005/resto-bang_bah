import { useEffect, useState } from "react";

function MyOrders({ onBack, onPayment }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Silakan login terlebih dahulu.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/orders/my-orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal mengambil pesanan."
                );
            }

            setOrders(result.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
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

    const getOrderTypeText = (type) => {
        return type === "delivery"
            ? "🛵 Delivery"
            : "🥡 Takeaway";
    };

    const getPaymentText = (method) => {
        return method === "bank_transfer"
            ? "🏦 Bank Transfer"
            : "💵 Cash";
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ← Kembali
                </button>

                <div className="checkout-header">
                    <span>RIWAYAT PESANAN</span>
                    <h1>Pesanan Saya</h1>
                    <p>
                        Lihat status dan detail pesanan kamu.
                    </p>
                </div>

                {loading && (
                    <div className="checkout-card">
                        <p>Memuat pesanan...</p>
                    </div>
                )}

                {error && (
                    <div className="checkout-card">
                        <div className="auth-error">
                            {error}
                        </div>
                    </div>
                )}

                {!loading &&
                    !error &&
                    orders.length === 0 && (
                        <div className="checkout-card">
                            <h2>Belum Ada Pesanan</h2>
                            <p>
                                Kamu belum memiliki pesanan.
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    orders.length > 0 && (
                        <div className="cart-list">
                            {orders.map((order) => (
                                <div
                                    className="checkout-card"
                                    key={order._id}
                                >
                                    <div className="summary-total">
                                        <div>
                                            <span>
                                                Nomor Pesanan
                                            </span>

                                            <strong>
                                                {order.orderNumber}
                                            </strong>
                                        </div>

                                        <strong>
                                            {getStatusText(
                                                order.status
                                            )}
                                        </strong>
                                    </div>

                                    <div className="summary-items">
                                        {order.items.map(
                                            (item, index) => (
                                                <div
                                                    className="summary-item"
                                                    key={`${order._id}-${index}`}
                                                >
                                                    <div>
                                                        <strong>
                                                            {item.name}
                                                        </strong>

                                                        <span>
                                                            {item.quantity}{" "}
                                                            × Rp{" "}
                                                            {item.price.toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </span>
                                                    </div>

                                                    <strong>
                                                        Rp{" "}
                                                        {item.subtotal.toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </strong>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="summary-total">
                                        <div>
                                            <span>
                                                Jenis Pesanan
                                            </span>

                                            <strong>
                                                {getOrderTypeText(
                                                    order.orderType
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Pembayaran
                                            </span>

                                            <strong>
                                                {getPaymentText(
                                                    order.paymentMethod
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    {order.orderType ===
                                        "delivery" && (
                                        <div className="form-group">
                                            <label>
                                                Alamat Delivery
                                            </label>

                                            <p>
                                                {
                                                    order.deliveryAddress
                                                }
                                            </p>
                                        </div>
                                    )}

                                    <div className="summary-total">
                                        <span>Total</span>

                                        <strong>
                                            Rp{" "}
                                            {order.total.toLocaleString(
                                                "id-ID"
                                            )}
                                        </strong>
                                    </div>

                                    {order.status === "waiting_payment" &&
                                    order.paymentMethod === "bank_transfer" && (
                                        <button
                                        className="checkout-submit"
                                        onClick={() => onPayment(order)}
                                        >
                                            Upload Bukti Transfer
                                        </button>
                                    )}

                                    {order.status === "payment_rejected" && 
                                    order.paymentMethod === "bank_transfer" && (
                                        <button
                                        className="checkout-submit"
                                        onClick={() => onPayment(order)}
                                        >
                                            Upload Ulang Bukti Pembayaran
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}

export default MyOrders;
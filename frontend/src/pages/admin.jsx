import { useEffect, useState } from "react";

function Admin({ onLogout }) {
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingPayment, setProcessingPayment] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const fetchOrders = async () => {
        const token = getToken();

        if (!token) {
            setError("Session admin tidak ditemukan.");
            setLoading(false);
            return;
        }

        try {
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
                    result.message || "Gagal mengambil pesanan."
                );
            }

            setOrders(result.data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchPendingPayments = async () => {
        const token = getToken();

        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/admin/payments/pending",
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
                        "Gagal mengambil pembayaran pending."
                );
            }

            setPayments(result.data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchData = async () => {
        setLoading(true);

        await Promise.all([
            fetchOrders(),
            fetchPendingPayments(),
        ]);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        const interval = setInterval(() => {
            fetchData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleVerifyPayment = async (paymentId) => {
        const token = getToken();

        if (!token) {
            setError("Session admin tidak ditemukan.");
            return;
        }

        setProcessingPayment(paymentId);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/payments/${paymentId}/verify`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal memverifikasi pembayaran."
                );
            }

            await fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingPayment(null);
        }
    };

    const handleRejectPayment = async (paymentId) => {
        const token = getToken();

        if (!token) {
            setError("Session admin tidak ditemukan.");
            return;
        }

        if (!rejectReason.trim()) {
            setError("Alasan penolakan wajib diisi.");
            return;
        }

        setProcessingPayment(paymentId);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/payments/${paymentId}/reject`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reason: rejectReason.trim(),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal menolak pembayaran."
                );
            }

            setRejectReason("");

            await fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingPayment(null);
        }
    };

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

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                <div className="checkout-header">
                    <span>ADMIN</span>

                    <h1>Dashboard Pesanan</h1>

                    <p>
                        Kelola pesanan pelanggan dari sini.
                    </p>
                </div>

                {error && (
                    <div className="checkout-card">
                        <div className="auth-error">
                            {error}
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="checkout-card">
                        <p>Memuat data...</p>
                    </div>
                )}

                {/* =========================
                    PEMBAYARAN MENUNGGU VERIFIKASI
                ========================= */}

                {!loading && payments.length > 0 && (
                    <section>
                        <div className="checkout-header">
                            <span>PEMBAYARAN</span>

                            <h2>
                                Menunggu Verifikasi
                            </h2>

                            <p>
                                {payments.length} pembayaran
                                menunggu pemeriksaan.
                            </p>
                        </div>

                        <div className="cart-list">
                            {payments.map((payment) => {
                                const order = payment.orderId;

                                return (
                                    <div
                                        className="checkout-card"
                                        key={payment._id}
                                    >
                                        <div className="summary-total">
                                            <div>
                                                <span>
                                                    Nomor Pesanan
                                                </span>

                                                <strong>
                                                    {order?.orderNumber ||
                                                        "-"}
                                                </strong>
                                            </div>

                                            <strong>
                                                Menunggu Verifikasi
                                            </strong>
                                        </div>

                                        <div className="summary-total">
                                            <div>
                                                <span>
                                                    Customer
                                                </span>

                                                <strong>
                                                    {order?.customer
                                                        ?.name || "-"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Total
                                                </span>

                                                <strong>
                                                    Rp{" "}
                                                    {payment.amount?.toLocaleString(
                                                        "id-ID"
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="summary-total">
                                            <div>
                                                <span>
                                                    Metode Pembayaran
                                                </span>

                                                <strong>
                                                    🏦 Bank Transfer
                                                </strong>
                                            </div>
                                        </div>

                                        {payment.proofImage && (
                                            <div className="form-group">
                                                <label>
                                                    Bukti Pembayaran
                                                </label>

                                                <p>
                                                    File:{" "}
                                                    <strong>
                                                        {
                                                            payment.proofImage
                                                        }
                                                    </strong>
                                                </p>
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label>
                                                Alasan Penolakan
                                            </label>

                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) =>
                                                    setRejectReason(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Contoh: Nominal transfer tidak sesuai."
                                                maxLength={500}
                                            />
                                        </div>

                                        <div className="summary-total">
                                            <button
                                                className="checkout-submit"
                                                disabled={
                                                    processingPayment ===
                                                    payment._id
                                                }
                                                onClick={() =>
                                                    handleVerifyPayment(
                                                        payment._id
                                                    )
                                                }
                                            >
                                                {processingPayment ===
                                                payment._id
                                                    ? "Memproses..."
                                                    : "✓ Verifikasi"}
                                            </button>

                                            <button
                                                className="back-button"
                                                disabled={
                                                    processingPayment ===
                                                    payment._id
                                                }
                                                onClick={() =>
                                                    handleRejectPayment(
                                                        payment._id
                                                    )
                                                }
                                            >
                                                ✕ Tolak
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* =========================
                    SEMUA PESANAN
                ========================= */}

                <section>
                    <div className="checkout-header">
                        <span>ORDER</span>

                        <h2>Semua Pesanan</h2>
                    </div>

                    {!loading &&
                        orders.length === 0 && (
                            <div className="checkout-card">
                                <h2>Belum Ada Pesanan</h2>

                                <p>
                                    Belum ada pesanan masuk.
                                </p>
                            </div>
                        )}

                    {!loading &&
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
                                                    {
                                                        order.orderNumber
                                                    }
                                                </strong>
                                            </div>

                                            <strong>
                                                {getStatusText(
                                                    order.status
                                                )}
                                            </strong>
                                        </div>

                                        <div className="summary-items">
                                            {order.items?.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        className="summary-item"
                                                        key={`${order._id}-${index}`}
                                                    >
                                                        <div>
                                                            <strong>
                                                                {
                                                                    item.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    item.quantity
                                                                }{" "}
                                                                × Rp{" "}
                                                                {item.price?.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </span>
                                                        </div>

                                                        <strong>
                                                            Rp{" "}
                                                            {item.subtotal?.toLocaleString(
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
                                                    Customer
                                                </span>

                                                <strong>
                                                    {order
                                                        .customer
                                                        ?.name ||
                                                        "-"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Jenis Pesanan
                                                </span>

                                                <strong>
                                                    {order.orderType ===
                                                    "delivery"
                                                        ? "🛵 Delivery"
                                                        : "🥡 Takeaway"}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="summary-total">
                                            <div>
                                                <span>
                                                    Pembayaran
                                                </span>

                                                <strong>
                                                    {order.paymentMethod ===
                                                    "bank_transfer"
                                                        ? "🏦 Bank Transfer"
                                                        : "💵 Cash"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Total
                                                </span>

                                                <strong>
                                                    Rp{" "}
                                                    {order.total?.toLocaleString(
                                                        "id-ID"
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </section>

                <button
                    className="back-button"
                    onClick={onLogout}
                >
                    Logout Admin
                </button>

            </div>
        </div>
    );
}

export default Admin;

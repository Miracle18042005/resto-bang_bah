import { useEffect, useState } from "react";
import "./css/adminpayments.css";

function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [rejectReasons, setRejectReasons] = useState({});

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem("adminToken");

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
                        "Gagal mengambil pembayaran"
                );
            }

            setPayments(result.data || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();

        const interval = setInterval(
            fetchPayments,
            5000
        );

        return () => clearInterval(interval);
    }, []);

    const verifyPayment = async (paymentId) => {
        try {
            setProcessingId(paymentId);

            const token = localStorage.getItem("adminToken");

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
                        "Gagal memverifikasi pembayaran"
                );
            }

            await fetchPayments();

            alert(
                result.message ||
                    "Pembayaran berhasil diverifikasi"
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const rejectPayment = async (paymentId) => {
        const reason =
            rejectReasons[paymentId]?.trim();

        if (!reason || reason.length < 3) {
            alert(
                "Masukkan alasan penolakan minimal 3 karakter."
            );
            return;
        }

        try {
            setProcessingId(paymentId);

            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `http://localhost:5000/api/admin/payments/${paymentId}/reject`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reason,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal menolak pembayaran"
                );
            }

            await fetchPayments();

            setRejectReasons((current) => {
                const updated = { ...current };
                delete updated[paymentId];
                return updated;
            });

            alert(
                result.message ||
                    "Pembayaran ditolak"
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const getProofImageUrl = (proofImage) => {
        if (!proofImage) {
            return "";
        }

        return `http://localhost:5000/uploads/payments/${proofImage}`;
    };

    return (
        <div className="admin-payments">

            <div className="dashboard-title">
                <h2>Pembayaran</h2>

                <p>
                    Verifikasi pembayaran pelanggan
                </p>
            </div>

            {loading && (
                <p>Memuat pembayaran...</p>
            )}

            {error && (
                <p className="admin-error">
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                payments.length === 0 && (
                    <div className="dashboard-section">
                        <div className="empty-payment">
                            <div className="empty-payment-icon">
                                ✓
                            </div>

                            <h3>
                                Tidak ada pembayaran
                                menunggu
                            </h3>

                            <p>
                                Semua pembayaran sudah
                                diproses.
                            </p>
                        </div>
                    </div>
                )}

            <div className="payment-admin-list">

                {payments.map((payment) => {
                    const order = payment.orderId;

                    const proofUrl =
                        getProofImageUrl(
                            payment.proofImage
                        );

                    return (
                        <div
                            className="payment-admin-card"
                            key={payment._id}
                        >

                            <div className="payment-admin-header">

                                <div>
                                    <strong>
                                        {
                                            order?.orderNumber
                                        }
                                    </strong>

                                    <span>
                                        {payment.createdAt
                                            ? new Date(
                                                  payment.createdAt
                                              ).toLocaleString(
                                                  "id-ID"
                                              )
                                            : "-"}
                                    </span>
                                </div>

                                <span className="payment-pending-badge">
                                    Menunggu Verifikasi
                                </span>

                            </div>

                            <div className="payment-admin-info">

                                <div>
                                    <span>
                                        Customer
                                    </span>

                                    <strong>
                                        {
                                            order
                                                ?.customer
                                                ?.name
                                        }
                                    </strong>

                                    <small>
                                        {
                                            order
                                                ?.customer
                                                ?.phone
                                        }
                                    </small>
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

                                <div>
                                    <span>
                                        Metode
                                    </span>

                                    <strong>
                                        Bank Transfer
                                    </strong>
                                </div>

                            </div>

                            {proofUrl && (
                                <div className="payment-proof-box">

                                    <span>
                                        Bukti Pembayaran
                                    </span>

                                    <a
                                        href={proofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img
                                            src={proofUrl}
                                            alt="Bukti pembayaran"
                                            className="payment-proof-image"
                                        />
                                    </a>

                                    <small>
                                        Klik gambar untuk
                                        melihat ukuran penuh
                                    </small>

                                </div>
                            )}

                            <textarea
                                className="reject-reason-input"
                                placeholder="Alasan jika pembayaran ditolak..."
                                value={
                                    rejectReasons[
                                        payment._id
                                    ] || ""
                                }
                                onChange={(e) =>
                                    setRejectReasons(
                                        (current) => ({
                                            ...current,
                                            [payment._id]:
                                                e.target
                                                    .value,
                                        })
                                    )
                                }
                            />

                            <div className="payment-admin-actions">

                                <button
                                    className="payment-verify-button"
                                    disabled={
                                        processingId ===
                                        payment._id
                                    }
                                    onClick={() =>
                                        verifyPayment(
                                            payment._id
                                        )
                                    }
                                >
                                    {processingId ===
                                    payment._id
                                        ? "Memproses..."
                                        : "✓ Verifikasi"}
                                </button>

                                <button
                                    className="payment-reject-button"
                                    disabled={
                                        processingId ===
                                        payment._id
                                    }
                                    onClick={() =>
                                        rejectPayment(
                                            payment._id
                                        )
                                    }
                                >
                                    {processingId ===
                                    payment._id
                                        ? "Memproses..."
                                        : "✕ Tolak"}
                                </button>

                            </div>

                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default AdminPayments;
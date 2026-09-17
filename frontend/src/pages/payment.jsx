import { useState } from "react";

function Payment({ order, onBack, onPaymentSubmitted }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!file) {
            setError("Silakan pilih bukti transfer terlebih dahulu.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Session login tidak ditemukan.");
            return;
        }

        const formData = new FormData();

        formData.append("orderId", order._id);
        formData.append("method", "bank_transfer");
        formData.append("proofImage", file);

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/payments",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal mengirim bukti pembayaran"
                );
            }

            onPaymentSubmitted(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <button
                    className="back-button"
                    onClick={onBack}
                    disabled={loading}
                >
                    ← Kembali
                </button>

                <div className="checkout-header">
                    <span>PEMBAYARAN</span>

                    <h1>Upload Bukti Transfer</h1>

                    <p>
                        Upload bukti pembayaran untuk pesanan{" "}
                        <strong>{order.orderNumber}</strong>
                    </p>
                </div>

                <div className="checkout-grid">
                    <section className="checkout-card">
                        <h2>Detail Pembayaran</h2>

                        <div className="summary-item">
                            <div>
                                <strong>Total Pesanan</strong>
                            </div>

                            <strong>
                                Rp{" "}
                                {order.total.toLocaleString(
                                    "id-ID"
                                )}
                            </strong>
                        </div>

                        <div className="form-group">
                            <label>
                                Bukti Transfer
                            </label>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) =>
                                    setFile(
                                        e.target.files[0] || null
                                    )
                                }
                            />

                            <small>
                                JPG, PNG, atau WebP. Maksimal 5 MB.
                            </small>
                        </div>

                        {file && (
                            <p>
                                File dipilih:{" "}
                                <strong>{file.name}</strong>
                            </p>
                        )}

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="checkout-submit"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading
                                ? "Mengirim..."
                                : "Kirim Bukti Transfer"}
                        </button>
                    </section>

                    <aside className="checkout-card order-summary">
                        <h2>Pesanan</h2>

                        <div className="summary-items">
                            {order.items.map((item) => (
                                <div
                                    className="summary-item"
                                    key={item.menuId}
                                >
                                    <div>
                                        <strong>
                                            {item.name}
                                        </strong>

                                        <span>
                                            {item.quantity} × Rp{" "}
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
                            ))}
                        </div>

                        <div className="summary-total">
                            <span>Total</span>

                            <strong>
                                Rp{" "}
                                {order.total.toLocaleString(
                                    "id-ID"
                                )}
                            </strong>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default Payment;
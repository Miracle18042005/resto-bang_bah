import { useState } from "react";
import "../css/payment.css";

function Payment({ order, onBack, onPaymentSubmitted }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendPaymentToWhatsApp = () => {
        const phoneNumber = "085123607185";

        const itemsText = order.items
            .map(
                (item, index) =>
                    `${index + 1}. ${item.name} x${item.quantity} = Rp ${Number(
                        item.subtotal ?? item.price * item.quantity
                    ).toLocaleString("id-ID")}`
            )
            .join("\n");

            const OrderTypeText = 
                order.orderType === "delivery"
                    ? "Delivery"
                    : "Takeaway";

            const message = `Halo Bang Bah 
            Saya sudah melakukan pembayaran untuk pesanan.
            
            Nomor Pesanan: ${order.orderNumber}
            
            Pesanan:
            ${itemsText}
            
            Total: Rp ${Number(order.total || 0).toLocaleString("id-ID")}
            
            Tipe: ${OrderTypeText}
            Pembayaran: Bank Transfer
            
            Bukti Pembayaran sudah saya upload melalui website.
            
            mmohon dicek dan diproses ya. Terima Kasihh`;

            const whatsappUrl = `https://wa.me/${phoneNumber}${text=$(encodeURIComponent(
                message
            )
        )}`;

        window.open(whatsappUrl, "_blank")
    }

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
            sendPaymentToWhatsApp();
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
                            <div className="payment-info">
                                <h3>Transfer Pembayaran</h3>

                                <p>
                                    Silahkan transfer sesuai dengan total pesanan ke rekening berikut :
                                </p>

                                <div className="payment-bank">
                                    <span>Bank</span>
                                    <strong>BCA</strong>
                                </div>

                                <div className="payment-bank">
                                    <span>Nomor Rekening</span>
                                    <strong>1234567890</strong>
                                </div>

                                <div className="">
                                    <span>Atas nama</span>
                                    <strong>BangBah</strong>
                                </div>

                                <div className="payment-total-box">
                                    <span>Total yang harus dibayar</span>
                                    <strong>
                                        Rp {order.total.toLocaleString("id-ID")}
                                    </strong>
                                </div>

                                <div className="payment-qris">
                                    <h3>Atau bayar dengan Qris</h3>

                                    <p>
                                        Scan QRIS dibawah menggunakan aplikasi pembayaran kamu.
                                    </p>

                                    <img 
                                        src="/qris-bangbah.png"
                                        alt="Qris Bang Bah"
                                        className="qris-image" 
                                    />

                                    <small>
                                        Setelah pembayaran berhasil, upload bukti pembayaran di bawah.
                                    </small>

                                </div>
                            </div>

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
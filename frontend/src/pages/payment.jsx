import { useState } from "react";
import "../css/payment.css";

function Payment({ order, onBack, onPaymentSubmitted }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendPaymentToWhatsApp = () => {
        const phoneNumber = "6285123607185";

        const itemsText = order.items
            .map(
                (item, index) =>
                    `${index + 1}. ${item.name} x${item.quantity} = Rp ${Number(
                        item.subtotal ?? item.price * item.quantity
                    ).toLocaleString("id-ID")}`
            )
            .join("\n");

        const orderTypeText =
            order.orderType === "delivery"
                ? "Delivery"
                : "Takeaway";

        const message = `Halo Bang Bah 👋

Saya sudah melakukan pembayaran untuk pesanan.

Nomor Pesanan: ${order.orderNumber}

Pesanan:
${itemsText}

Total: Rp ${Number(order.total || 0).toLocaleString(
            "id-ID"
        )}

Tipe: ${orderTypeText}
Pembayaran: Bank Transfer

Bukti pembayaran sudah saya upload melalui website.

Mohon dicek dan diproses ya. Terima kasih 🙏`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
            message
        )}`;

        window.open(whatsappUrl, "_blank");
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0] || null;

        setError("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            setError(
                "Ukuran file terlalu besar. Maksimal 5 MB."
            );
            e.target.value = "";
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!file) {
            setError(
                "Silakan pilih bukti transfer terlebih dahulu."
            );
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError(
                "Session login tidak ditemukan."
            );
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
                    result.message ||
                        "Gagal mengirim bukti pembayaran"
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
        <div className="payment-page">
            <div className="payment-container">

                {/* BACK */}
                <button
                    className="payment-back-button"
                    onClick={onBack}
                    disabled={loading}
                >
                    <span>←</span>
                    Kembali
                </button>

                {/* HEADER */}
                <header className="payment-header">
                    <span className="payment-eyebrow">
                        PEMBAYARAN
                    </span>

                    <h1>
                        Selesaikan
                        <br />
                        Pembayaran Kamu.
                    </h1>

                    <p>
                        Upload bukti pembayaran untuk pesanan{" "}
                        <strong>
                            {order.orderNumber}
                        </strong>
                    </p>
                </header>

                {/* PAYMENT STATUS */}
                <div className="payment-status">
                    <div className="payment-status-icon">
                        ✓
                    </div>

                    <div>
                        <strong>
                            Pesanan berhasil dibuat
                        </strong>

                        <span>
                            Silakan lakukan pembayaran sesuai
                            nominal berikut.
                        </span>
                    </div>
                </div>

                <div className="payment-grid">

                    {/* LEFT */}
                    <section className="payment-main">

                        {/* PAYMENT INFORMATION */}
                        <div className="payment-card">

                            <div className="payment-section-heading">
                                <div className="payment-section-number">
                                    01
                                </div>

                                <div>
                                    <h2>
                                        Detail Pembayaran
                                    </h2>

                                    <p>
                                        Transfer sesuai nominal
                                        pesanan kamu.
                                    </p>
                                </div>
                            </div>

                            {/* TOTAL */}
                            <div className="payment-total-box">
                                <div>
                                    <span>
                                        TOTAL YANG HARUS DIBAYAR
                                    </span>

                                    <strong>
                                        Rp{" "}
                                        {Number(
                                            order.total || 0
                                        ).toLocaleString(
                                            "id-ID"
                                        )}
                                    </strong>
                                </div>

                                <div className="payment-total-tag">
                                    Bank Transfer
                                </div>
                            </div>

                            {/* BANK */}
                            <div className="bank-section">

                                <div className="bank-section-title">
                                    <span>
                                        🏦
                                    </span>

                                    <div>
                                        <strong>
                                            Transfer Bank
                                        </strong>

                                        <small>
                                            Gunakan rekening berikut
                                        </small>
                                    </div>
                                </div>

                                <div className="bank-detail">
                                    <span>
                                        Bank
                                    </span>

                                    <strong>
                                        BCA
                                    </strong>
                                </div>

                                <div className="bank-detail">
                                    <span>
                                        Nomor Rekening
                                    </span>

                                    <strong className="account-number">
                                        1234567890
                                    </strong>
                                </div>

                                <div className="bank-detail">
                                    <span>
                                        Atas Nama
                                    </span>

                                    <strong>
                                        Bang Bah
                                    </strong>
                                </div>

                            </div>

                            {/* QRIS */}
                            <div className="qris-section">

                                <div className="qris-heading">
                                    <span>
                                        ATAU BAYAR DENGAN
                                    </span>

                                    <h3>
                                        QRIS
                                    </h3>

                                    <p>
                                        Scan kode QR berikut
                                        menggunakan aplikasi
                                        pembayaran kamu.
                                    </p>
                                </div>

                                <div className="qris-wrapper">
                                    <img
                                        src="/qris-bangbah.png"
                                        alt="QRIS Bang Bah"
                                        className="qris-image"
                                    />
                                </div>

                                <small className="qris-note">
                                    Pastikan nominal pembayaran
                                    sesuai dengan total pesanan.
                                </small>

                            </div>
                        </div>

                        {/* UPLOAD */}
                        <div className="payment-card">

                            <div className="payment-section-heading">
                                <div className="payment-section-number">
                                    02
                                </div>

                                <div>
                                    <h2>
                                        Upload Bukti Pembayaran
                                    </h2>

                                    <p>
                                        Kirim screenshot atau foto
                                        bukti pembayaran kamu.
                                    </p>
                                </div>
                            </div>

                            <label
                                className={
                                    file
                                        ? "upload-box has-file"
                                        : "upload-box"
                                }
                            >
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />

                                {file ? (
                                    <>
                                        <div className="upload-success-icon">
                                            ✓
                                        </div>

                                        <strong>
                                            Bukti pembayaran
                                            dipilih
                                        </strong>

                                        <span>
                                            {file.name}
                                        </span>

                                        <small>
                                            Klik untuk mengganti
                                            file
                                        </small>
                                    </>
                                ) : (
                                    <>
                                        <div className="upload-icon">
                                            ↑
                                        </div>

                                        <strong>
                                            Pilih bukti pembayaran
                                        </strong>

                                        <span>
                                            Klik di sini untuk
                                            memilih foto
                                        </span>

                                        <small>
                                            JPG, PNG, WebP ·
                                            Maksimal 5 MB
                                        </small>
                                    </>
                                )}
                            </label>

                            {file && (
                                <div className="selected-file">
                                    <span>
                                        File siap dikirim
                                    </span>

                                    <strong>
                                        {file.name}
                                    </strong>
                                </div>
                            )}

                            {error && (
                                <div className="payment-error">
                                    <span>!</span>

                                    <p>
                                        {error}
                                    </p>
                                </div>
                            )}

                            <button
                                className="payment-submit"
                                onClick={handleSubmit}
                                disabled={
                                    loading || !file
                                }
                            >
                                <span>
                                    {loading
                                        ? "Mengirim Bukti..."
                                        : "Kirim Bukti Pembayaran"}
                                </span>

                                {!loading && (
                                    <span className="payment-submit-arrow">
                                        →
                                    </span>
                                )}
                            </button>

                            <p className="payment-submit-note">
                                Setelah dikirim, bukti pembayaran
                                akan diperiksa oleh admin.
                            </p>

                        </div>
                    </section>

                    {/* RIGHT */}
                    <aside className="payment-card payment-summary">

                        <div className="summary-header">
                            <div>
                                <span>
                                    PESANAN KAMU
                                </span>

                                <h2>
                                    Ringkasan
                                </h2>
                            </div>

                            <div className="summary-order-number">
                                {order.orderNumber}
                            </div>
                        </div>

                        <div className="summary-items">

                            {order.items.map((item) => (
                                <div
                                    className="summary-item"
                                    key={
                                        item.menuId ||
                                        item._id
                                    }
                                >
                                    <div className="summary-item-info">
                                        <strong>
                                            {item.name}
                                        </strong>

                                        <span>
                                            {item.quantity} × Rp{" "}
                                            {Number(
                                                item.price
                                            ).toLocaleString(
                                                "id-ID"
                                            )}
                                        </span>
                                    </div>

                                    <strong>
                                        Rp{" "}
                                        {Number(
                                            item.subtotal ??
                                                item.price *
                                                    item.quantity
                                        ).toLocaleString(
                                            "id-ID"
                                        )}
                                    </strong>
                                </div>
                            ))}

                        </div>

                        <div className="summary-divider" />

                        <div className="summary-total">
                            <span>
                                Total Pesanan
                            </span>

                            <strong>
                                Rp{" "}
                                {Number(
                                    order.total || 0
                                ).toLocaleString(
                                    "id-ID"
                                )}
                            </strong>
                        </div>

                        <div className="summary-order-type">
                            <span>
                                Tipe Pesanan
                            </span>

                            <strong>
                                {order.orderType ===
                                "delivery"
                                    ? "🛵 Delivery"
                                    : "🥡 Takeaway"}
                            </strong>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
}

export default Payment;
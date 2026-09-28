import { useState } from "react";
import { createOrder } from "../services/api";
import "../css/checkout.css";

function Checkout({ cart, totalPrice, onBack, onOrderCreated }) {
    const [orderType, setOrderType] = useState("takeaway");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [deliveryAddress, setDeliveryAddress] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleOrderTypeChange = (type) => {
        setOrderType(type);

        if (type === "delivery") {
            setPaymentMethod("bank_transfer");
        } else {
            setPaymentMethod("cash");
        }
    };

    const handleSubmit = async () => {
        setError("");

        if (cart.length === 0) {
            setError("Keranjang masih kosong.");
            return;
        }

        if (
            orderType === "delivery" &&
            deliveryAddress.trim().length < 10
        ) {
            setError("Alamat delivery minimal 10 karakter.");
            return;
        }

        setLoading(true);

        try {
            const items = cart.map((item) => ({
                menuId: item._id,
                quantity: item.quantity,
            }));

            const result = await createOrder({
                items,
                orderType,
                paymentMethod,
                deliveryAddress:
                    orderType === "delivery"
                        ? deliveryAddress.trim()
                        : null,
            });

            onOrderCreated(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                {/* BACK */}
                <button
                    className="back-button"
                    onClick={onBack}
                    disabled={loading}
                >
                    <span>←</span>
                    Kembali ke menu
                </button>

                {/* HEADER */}
                <header className="checkout-header">
                    <span className="checkout-eyebrow">
                        RESTO BANG BAH
                    </span>

                    <h1>
                        Selesaikan
                        <br />
                        Pesanan Kamu.
                    </h1>

                    <p>
                        Lengkapi detail pesanan sebelum
                        pesanan dibuat.
                    </p>
                </header>

                {/* PROGRESS */}
                <div className="checkout-progress">
                    <div className="checkout-step active">
                        <span>1</span>
                        <strong>Pesanan</strong>
                    </div>

                    <div className="checkout-progress-line" />

                    <div className="checkout-step active">
                        <span>2</span>
                        <strong>Pengiriman</strong>
                    </div>

                    <div className="checkout-progress-line" />

                    <div className="checkout-step active">
                        <span>3</span>
                        <strong>Pembayaran</strong>
                    </div>
                </div>

                <div className="checkout-grid">

                    {/* LEFT */}
                    <section className="checkout-main">

                        {/* ORDER TYPE */}
                        <div className="checkout-card">
                            <div className="section-heading">
                                <div className="section-number">
                                    01
                                </div>

                                <div>
                                    <h2>Jenis Pesanan</h2>

                                    <p>
                                        Pilih bagaimana kamu
                                        menerima pesanan.
                                    </p>
                                </div>
                            </div>

                            <div className="option-grid">

                                <button
                                    type="button"
                                    className={
                                        orderType === "takeaway"
                                            ? "option active"
                                            : "option"
                                    }
                                    onClick={() =>
                                        handleOrderTypeChange(
                                            "takeaway"
                                        )
                                    }
                                >
                                    <div className="option-icon">
                                        🥡
                                    </div>

                                    <div className="option-content">
                                        <strong>
                                            Ambil Sendiri
                                        </strong>

                                        <span>
                                            Pesanan kamu
                                            diambil langsung
                                            di tempat.
                                        </span>
                                    </div>

                                    <div className="option-check">
                                        {orderType === "takeaway"
                                            ? "✓"
                                            : ""}
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        orderType === "delivery"
                                            ? "option active"
                                            : "option"
                                    }
                                    onClick={() =>
                                        handleOrderTypeChange(
                                            "delivery"
                                        )
                                    }
                                >
                                    <div className="option-icon">
                                        🛵
                                    </div>

                                    <div className="option-content">
                                        <strong>
                                            Delivery
                                        </strong>

                                        <span>
                                            Pesanan diantar
                                            menggunakan
                                            kurir.
                                        </span>
                                    </div>

                                    <div className="option-check">
                                        {orderType === "delivery"
                                            ? "✓"
                                            : ""}
                                    </div>
                                </button>

                            </div>

                            {/* ADDRESS */}
                            {orderType === "delivery" && (
                                <div className="delivery-box">

                                    <div className="delivery-heading">
                                        <div>
                                            <strong>
                                                📍 Alamat
                                                Pengantaran
                                            </strong>

                                            <span>
                                                Pastikan alamat
                                                sudah lengkap.
                                            </span>
                                        </div>
                                    </div>

                                    <textarea
                                        value={deliveryAddress}
                                        onChange={(e) =>
                                            setDeliveryAddress(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Contoh: Jl. Kebayoran Lama No. 12, Pondok Pinang, Jakarta Selatan..."
                                        maxLength={300}
                                    />

                                    <div className="address-counter">
                                        {deliveryAddress.length}/300
                                        karakter
                                    </div>

                                </div>
                            )}
                        </div>

                        {/* PAYMENT */}
                        <div className="checkout-card">
                            <div className="section-heading">
                                <div className="section-number">
                                    02
                                </div>

                                <div>
                                    <h2>Metode Pembayaran</h2>

                                    <p>
                                        Pilih metode pembayaran
                                        pesanan kamu.
                                    </p>
                                </div>
                            </div>

                            <div className="payment-options">

                                {orderType === "takeaway" && (
                                    <button
                                        type="button"
                                        className={
                                            paymentMethod ===
                                            "cash"
                                                ? "payment-option active"
                                                : "payment-option"
                                        }
                                        onClick={() =>
                                            setPaymentMethod(
                                                "cash"
                                            )
                                        }
                                    >
                                        <div className="payment-icon">
                                            💵
                                        </div>

                                        <div>
                                            <strong>
                                                Cash
                                            </strong>

                                            <span>
                                                Bayar saat
                                                mengambil
                                                pesanan.
                                            </span>
                                        </div>

                                        <div className="payment-check">
                                            {paymentMethod ===
                                            "cash"
                                                ? "✓"
                                                : ""}
                                        </div>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className={
                                        paymentMethod ===
                                        "bank_transfer"
                                            ? "payment-option active"
                                            : "payment-option"
                                    }
                                    onClick={() =>
                                        setPaymentMethod(
                                            "bank_transfer"
                                        )
                                    }
                                >
                                    <div className="payment-icon">
                                        🏦
                                    </div>

                                    <div>
                                        <strong>
                                            Bank Transfer
                                        </strong>

                                        <span>
                                            Upload bukti
                                            pembayaran setelah
                                            pesanan dibuat.
                                        </span>
                                    </div>

                                    <div className="payment-check">
                                        {paymentMethod ===
                                        "bank_transfer"
                                            ? "✓"
                                            : ""}
                                    </div>
                                </button>

                            </div>

                            {error && (
                                <div className="checkout-error">
                                    <span>!</span>
                                    {error}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* RIGHT */}
                    <aside className="checkout-card order-summary">

                        <div className="summary-heading">
                            <div>
                                <span>
                                    PESANAN KAMU
                                </span>

                                <h2>
                                    Ringkasan
                                </h2>
                            </div>

                            <div className="summary-count">
                                {cart.length} menu
                            </div>
                        </div>

                        <div className="summary-items">
                            {cart.map((item) => (
                                <div
                                    className="summary-item"
                                    key={item._id}
                                >
                                    <div className="summary-item-image">
                                        {item.image ? (
                                            <img
                                                src={`http://localhost:5000/uploads/menus/${item.image}`}
                                                alt={item.name}
                                            />
                                        ) : (
                                            <span>🍽️</span>
                                        )}
                                    </div>

                                    <div className="summary-item-info">
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

                                    <strong className="summary-item-price">
                                        Rp{" "}
                                        {(
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
                            <span>Total Pesanan</span>

                            <strong>
                                Rp{" "}
                                {totalPrice.toLocaleString(
                                    "id-ID"
                                )}
                            </strong>
                        </div>

                        <button
                            className="checkout-submit"
                            onClick={handleSubmit}
                            disabled={
                                loading ||
                                cart.length === 0
                            }
                        >
                            <span>
                                {loading
                                    ? "Membuat Pesanan..."
                                    : "Buat Pesanan"}
                            </span>

                            {!loading && (
                                <span className="submit-arrow">
                                    →
                                </span>
                            )}
                        </button>

                        <p className="checkout-note">
                            🔒 Pesanan kamu akan diproses
                            setelah berhasil dibuat.
                        </p>

                    </aside>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
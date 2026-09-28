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
            setError(
                "Alamat delivery minimal 10 karakter."
            );
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

                <button
                    className="back-button"
                    onClick={onBack}
                    disabled={loading}
                >
                    ← Kembali ke menu
                </button>

                <div className="checkout-header">
                    <span>CHECKOUT</span>

                    <h1>Detail Pesanan</h1>

                    <p>
                        Lengkapi informasi pesanan kamu
                        sebelum melanjutkan.
                    </p>
                </div>

                <div className="checkout-grid">

                    <section className="checkout-card">

                        <h2>Jenis Pesanan</h2>

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
                                <strong>
                                    🥡 Takeaway
                                </strong>

                                <span>
                                    Ambil pesanan sendiri
                                </span>
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
                                <strong>
                                    🛵 Delivery
                                </strong>

                                <span>
                                    Pesanan diantar kurir
                                </span>
                            </button>

                        </div>

                        {orderType === "delivery" && (
                            <div className="form-group">

                                <label>
                                    Alamat Delivery
                                </label>

                                <textarea
                                    value={deliveryAddress}
                                    onChange={(e) =>
                                        setDeliveryAddress(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Masukkan alamat lengkap..."
                                    maxLength={300}
                                />

                                <small>
                                    {deliveryAddress.length}/300
                                    {" "}karakter
                                </small>

                            </div>
                        )}

                        <h2 className="payment-title">
                            Metode Pembayaran
                        </h2>

                        <div className="option-grid">

                            {orderType === "takeaway" && (
                                <button
                                    type="button"
                                    className={
                                        paymentMethod === "cash"
                                            ? "option active"
                                            : "option"
                                    }
                                    onClick={() =>
                                        setPaymentMethod(
                                            "cash"
                                        )
                                    }
                                >
                                    <strong>
                                        💵 Cash
                                    </strong>

                                    <span>
                                        Bayar saat pickup
                                    </span>
                                </button>
                            )}

                            <button
                                type="button"
                                className={
                                    paymentMethod ===
                                    "bank_transfer"
                                        ? "option active"
                                        : "option"
                                }
                                onClick={() =>
                                    setPaymentMethod(
                                        "bank_transfer"
                                    )
                                }
                            >
                                <strong>
                                    🏦 Bank Transfer
                                </strong>

                                <span>
                                    Upload bukti transfer
                                </span>
                            </button>

                        </div>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                    </section>

                    <aside className="checkout-card order-summary">

                        <h2>Ringkasan Pesanan</h2>

                        <div className="summary-items">

                            {cart.map((item) => (
                                <div
                                    className="summary-item"
                                    key={item._id}
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

                        <div className="summary-total">
                            <span>Total</span>

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
                            {loading
                                ? "Membuat Pesanan..."
                                : "Buat Pesanan"}
                        </button>

                    </aside>

                </div>
            </div>
        </div>
    );
}

export default Checkout;
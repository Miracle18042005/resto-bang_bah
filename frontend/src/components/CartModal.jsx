import "./css/cartmodal.css";

function CartModal({
    cart,
    totalItems,
    totalPrice,
    onClose,
    onIncrease,
    onDecrease,
    onCheckout,
}) {
    return (
        <>
            <div
                className="cart-modal-overlay"
                onClick={onClose}
            />

            <aside className="cart-modal">
                {/* HEADER */}
                <div className="cart-modal-header">
                    <div className="cart-header-title">
                        <span className="cart-modal-label">
                            PESANAN KAMU
                        </span>

                        <div className="cart-title-row">
                            <h2>Keranjang</h2>

                            {totalItems > 0 && (
                                <span className="cart-count-badge">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="cart-modal-close"
                        onClick={onClose}
                        aria-label="Tutup keranjang"
                    >
                        ×
                    </button>
                </div>

                {/* BODY */}
                <div className="cart-modal-body">
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon">
                                🛒
                            </div>

                            <span className="cart-empty-label">
                                BELUM ADA PESANAN
                            </span>

                            <h3>
                                Keranjang masih kosong
                            </h3>

                            <p>
                                Yuk pilih makanan favorit
                                kamu dari menu Bang Bah.
                            </p>

                            <button
                                type="button"
                                className="cart-empty-button"
                                onClick={onClose}
                            >
                                Lihat Menu
                                <span>→</span>
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items">
                            <div className="cart-items-heading">
                                <span>
                                    {totalItems} item dalam pesanan
                                </span>

                                <span>
                                    Bang Bah
                                </span>
                            </div>

                            {cart.map((item) => (
                                <div
                                    className="cart-item"
                                    key={item._id || item.menuId}
                                >
                                    {/* IMAGE */}
                                    <div className="cart-item-image">
                                        {item.image ? (
                                            <img
                                                src={`http://localhost:5000/uploads/menus/${item.image}`}
                                                alt={item.name}
                                            />
                                        ) : (
                                            <span>🍽️</span>
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div className="cart-item-info">
                                        <h3 title={item.name}>
                                            {item.name}
                                        </h3>

                                        <p className="cart-item-price">
                                            Rp{" "}
                                            {item.price.toLocaleString(
                                                "id-ID"
                                            )}
                                        </p>

                                        <div className="cart-item-bottom">
                                            <div className="cart-quantity">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDecrease(
                                                            item._id ||
                                                            item.menuId
                                                        )
                                                    }
                                                    aria-label={`Kurangi ${item.name}`}
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onIncrease(
                                                            item._id ||
                                                            item.menuId
                                                        )
                                                    }
                                                    aria-label={`Tambah ${item.name}`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <strong className="cart-item-subtotal">
                                                Rp{" "}
                                                {(
                                                    item.price *
                                                    item.quantity
                                                ).toLocaleString(
                                                    "id-ID"
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                {cart.length > 0 && (
                    <div className="cart-modal-footer">
                        <div className="cart-summary">
                            <div>
                                <span className="cart-summary-label">
                                    TOTAL PESANAN
                                </span>

                                <span className="cart-summary-items">
                                    {totalItems} item
                                </span>
                            </div>

                            <strong>
                                Rp{" "}
                                {totalPrice.toLocaleString(
                                    "id-ID"
                                )}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="cart-checkout-button"
                            onClick={onCheckout}
                        >
                            <span>Lanjut Checkout</span>
                            <span className="cart-checkout-arrow">
                                →
                            </span>
                        </button>

                        <p className="cart-footer-note">
                            Harga sudah termasuk sesuai menu.
                        </p>
                    </div>
                )}
            </aside>
        </>
    );
}

export default CartModal;
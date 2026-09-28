import { useState } from "react";
import "./css/CustomerNavbar.css";

function CustomerNavbar({
    user,
    totalItems,
    onHome,
    onMenu,
    onCart,
    onOrders,
    onLogin,
    onLogout,
    onPaymentInfo,
    onTracking,
    onFavorites,
    onPromo,
    onAbout,
    onHelp,
    onAccount,
    onCatering,
}) {
    const [moreOpen, setMoreOpen] = useState(false);

    const handleMore = (item) => {
        setMoreOpen(false);

        if (item === "orders") {
            onOrders();
        }

        if (item === "payment") {
            onPaymentInfo();
        }

        if (item === "tracking") {
            onTracking();
        }

        if (item === "favorites") {
            onFavorites();
        }

        if (item === "promo") {
            onPromo();
        }

        if (item === "about") {
            onAbout();
        }

        if (item === "help") {
            onHelp();
        }

        if (item === "account") {
            onAccount();
        }
    };

    return (
        <>
            {/* =========================
                DESKTOP NAVBAR
            ========================= */}

            <nav className="customer-navbar">
                {/* BRAND */}

                <button
                    className="customer-brand"
                    onClick={onHome}
                >
                    <span className="brand-icon">
                        🍗
                    </span>

                    <span className="brand-text">
                        <span className="brand-main">
                            Bang Bah
                        </span>

                        <span className="brand-sub">
                            Ayam Bakar & Ayam Goreng
                        </span>
                    </span>
                </button>

                {/* NAVIGATION */}

                <div className="customer-nav-links">
                    <button
                        className="nav-link"
                        onClick={onHome}
                    >
                        Home
                    </button>

                    <button
                        className="nav-link"
                        onClick={onMenu}
                    >
                        Menu
                    </button>

                    <button
                        className="nav-link"
                        onClick={onOrders}
                    >
                        Pesanan
                    </button>

                    <button
                        className="nav-link"
                        onClick={onCatering}
                    >
                        Catering
                    </button>

                    <button
                        className={`nav-link more-trigger ${
                            moreOpen ? "active" : ""
                        }`}
                        onClick={() =>
                            setMoreOpen(
                                (value) => !value
                            )
                        }
                    >
                        Lainnya
                        <span className="nav-arrow">
                            {moreOpen ? "⌃" : "⌄"}
                        </span>
                    </button>
                </div>

                {/* ACTIONS */}

                <div className="customer-nav-actions">
                    <button
                        className="customer-cart-button"
                        onClick={onCart}
                        aria-label="Keranjang"
                    >
                        <span className="cart-icon">
                            🛒
                        </span>

                        {totalItems > 0 && (
                            <span className="cart-count">
                                {totalItems > 99
                                    ? "99+"
                                    : totalItems}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <button
                            className="customer-account-button"
                            onClick={() =>
                                onAccount()
                            }
                        >
                            <span className="account-icon">
                                👤
                            </span>

                            <span className="account-name">
                                {user.name || "Akun"}
                            </span>
                        </button>
                    ) : (
                        <button
                            className="customer-account-button"
                            onClick={onLogin}
                        >
                            Login
                        </button>
                    )}
                </div>
            </nav>

            {/* =========================
                MORE MENU
            ========================= */}

            {moreOpen && (
                <>
                    <div
                        className="customer-more-overlay"
                        onClick={() =>
                            setMoreOpen(false)
                        }
                    />

                    <div className="customer-more-menu">
                        <div className="more-menu-header">
                            <div>
                                <span>
                                    MENU
                                </span>

                                <strong>
                                    Menu Lainnya
                                </strong>
                            </div>

                            <button
                                className="more-close"
                                onClick={() =>
                                    setMoreOpen(false)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <button
                            onClick={() =>
                                handleMore("orders")
                            }
                        >
                            <span className="more-icon">
                                📋
                            </span>

                            <div>
                                <strong>
                                    Pesanan Saya
                                </strong>

                                <small>
                                    Lihat riwayat pesanan
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleMore("payment")
                            }
                        >
                            <span className="more-icon">
                                💳
                            </span>

                            <div>
                                <strong>
                                    Pembayaran
                                </strong>

                                <small>
                                    Informasi pembayaran
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleMore("tracking")
                            }
                        >
                            <span className="more-icon">
                                📍
                            </span>

                            <div>
                                <strong>
                                    Lacak Pesanan
                                </strong>

                                <small>
                                    Pantau status pesanan
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleMore("favorites")
                            }
                        >
                            <span className="more-icon">
                                ❤️
                            </span>

                            <div>
                                <strong>
                                    Favorit
                                </strong>

                                <small>
                                    Menu favorit kamu
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleMore("promo")
                            }
                        >
                            <span className="more-icon">
                                🎁
                            </span>

                            <div>
                                <strong>
                                    Promo
                                </strong>

                                <small>
                                    Promo dan penawaran
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleMore("about")
                            }
                        >
                            <span className="more-icon">
                                ℹ️
                            </span>

                            <div>
                                <strong>
                                    Tentang Kami
                                </strong>

                                <small>
                                    Tentang Resto Bang Bah
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleMore("help")
                            }
                        >
                            <span className="more-icon">
                                ❓
                            </span>

                            <div>
                                <strong>
                                    Bantuan
                                </strong>

                                <small>
                                    Bantuan dan informasi
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleMore("account")
                            }
                        >
                            <span className="more-icon">
                                👤
                            </span>

                            <div>
                                <strong>
                                    Akun
                                </strong>

                                <small>
                                    Profil dan pengaturan
                                </small>
                            </div>

                            <span className="more-arrow">
                                →
                            </span>
                        </button>
                    </div>
                </>
            )}

            {/* =========================
                MOBILE BOTTOM NAV
            ========================= */}

            <nav className="customer-bottom-nav">
                <button
                    className="bottom-nav-item"
                    onClick={onHome}
                >
                    <span className="bottom-nav-icon">
                        🏠
                    </span>

                    <small>Home</small>
                </button>

                <button
                    className="bottom-nav-item"
                    onClick={onMenu}
                >
                    <span className="bottom-nav-icon">
                        🍗
                    </span>

                    <small>Menu</small>
                </button>

                <button
                    className="bottom-cart"
                    onClick={onCart}
                >
                    <span className="bottom-cart-circle">
                        🛒

                        {totalItems > 0 && (
                            <b>
                                {totalItems > 99
                                    ? "99+"
                                    : totalItems}
                            </b>
                        )}
                    </span>

                    <small>
                        Keranjang
                    </small>
                </button>

                <button
                    className="bottom-nav-item"
                    onClick={onOrders}
                >
                    <span className="bottom-nav-icon">
                        📦
                    </span>

                    <small>Pesanan</small>
                </button>

                <button
                    className="bottom-nav-item"
                    onClick={() =>
                        setMoreOpen(true)
                    }
                >
                    <span className="bottom-nav-icon">
                        ☰
                    </span>

                    <small>Lainnya</small>
                </button>
            </nav>
        </>
    );
}

export default CustomerNavbar;
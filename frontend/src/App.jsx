import { useEffect, useState } from "react";
import "./css/App.css";
import { getMenus } from "./services/api";

import CustomerNavbar from "./components/CustomerNavbar";
import CartModal from "./components/CartModal";

import Checkout from "./pages/checkout";
import Payment from "./pages/payment";
import Login from "./pages/login";
import Register from "./pages/register";
import MyOrders from "./pages/myorders";
import OrderDetail from "./pages/OrderDetail";

import PaymentPage from "./pages/customer/PaymentPage";
import TrackingPage from "./pages/customer/TrackingPage";
import FavoritesPage from "./pages/customer/FavoritesPage";
import PromoPage from "./pages/customer/PromoPage";
import AboutPage from "./pages/customer/AboutPage";
import HelpPage from "./pages/customer/HelpPage";
import AccountPage from "./pages/customer/AccountPage";
import CateringPage from "./pages/customer/CateringPage";

function App() {
    const [menus, setMenus] = useState([]);
    const [cart, setCart] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState("home");

    const [createdOrder, setCreatedOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const [cartOpen, setCartOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState("Semua");

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");

            if (!savedUser) {
                return null;
            }

            const parsedUser = JSON.parse(savedUser);

            // Jangan izinkan akun admin masuk ke customer app
            if (parsedUser?.role === "admin") {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                return null;
            }

            return parsedUser;
        } catch (error) {
            console.error("Gagal membaca user:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
    });

    // =========================
    // LOAD MENU
    // =========================

    useEffect(() => {
        loadMenus();
    }, []);

    const loadMenus = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMenus();

            if (response?.success) {
                setMenus(response.data || []);
            } else if (Array.isArray(response)) {
                setMenus(response);
            } else if (Array.isArray(response?.data)) {
                setMenus(response.data);
            } else {
                setMenus([]);
            }
        } catch (err) {
            console.error("Gagal mengambil menu:", err);
            setError("Gagal memuat menu. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CART
    // =========================

    const addToCart = (menu) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item._id === menu._id
            );

            if (existingItem) {
                return prevCart.map((item) =>
                    item._id === menu._id
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                        }
                        : item
                );
            }

            return [
                ...prevCart,
                {
                    ...menu,
                    quantity: 1,
                },
            ];
        });
    };

    const increaseQuantity = (menuId) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item._id === menuId
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item
            )
        );
    };

    const decreaseQuantity = (menuId) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item._id === menuId
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, item) =>
            total + Number(item.price || 0) * item.quantity,
        0
    );

    // =========================
    // WHATSAPP
    // =========================

    const sendOrderToWhatsApp = (order) => {
        // Nomor WhatsApp Bang Bah
        // Format wa.me harus menggunakan format internasional
        const phoneNumber = "6285123607185";

        const itemText =
            order.items
                ?.map(
                    (item, index) =>
                        `${index + 1}. ${item.name} x ${item.quantity
                        } = Rp ${Number(
                            item.subtotal || 0
                        ).toLocaleString("id-ID")}`
                )
                .join("\n") || "-";

        const orderTypeText =
            order.orderType === "delivery"
                ? "Delivery"
                : "Takeaway";

        const paymentText =
            order.paymentMethod === "bank_transfer"
                ? "Bank Transfer"
                : "Cash";

        const addressText =
            order.orderType === "delivery"
                ? `\nAlamat: ${order.deliveryAddress || "-"}`
                : "";

        const message = `Halo Bang Bah 👋

Saya baru membuat pesanan.

Nomor Pesanan: ${order.orderNumber}

Pesanan:
${itemText}

Total: Rp ${Number(
            order.totalAmount || order.total || 0
        ).toLocaleString("id-ID")}

Tipe: ${orderTypeText}
Pembayaran: ${paymentText}${addressText}

Mohon diproses ya.
Terima kasih 🙏`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
            message
        )}`;

        window.open(whatsappUrl, "_blank");
    };

    // =========================
    // LOGIN
    // =========================

    const handleLogin = (loggedInUser) => {
        if (!loggedInUser) {
            return;
        }

        // Admin tidak boleh masuk customer app
        if (loggedInUser.role === "admin") {
            localStorage.removeItem("user");
            localStorage.removeItem("token");

            alert(
                "Akun admin harus login melalui halaman admin."
            );

            return;
        }

        setUser(loggedInUser);
        setPage("home");
    };

    // =========================
    // REGISTER
    // =========================

    const handleRegister = (registeredUser) => {
        if (!registeredUser) {
            return;
        }

        setUser(registeredUser);
        setPage("home");
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setCart([]);
        setCreatedOrder(null);
        setSelectedOrderId(null);
        setPage("home");
    };

    // =========================
    // CHECKOUT
    // =========================

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Keranjang masih kosong.");
            return;
        }

        if (!user) {
            setCartOpen(false);
            setPage("login");
            return;
        }

        setCartOpen(false);
        setPage("checkout");
    };

    // =========================
    // ORDER CREATED
    // =========================

    const handleOrderCreated = (order) => {
        setCreatedOrder(order);
        setCart([]);

        setPage("payment");

        // Kirim order ke WhatsApp setelah order berhasil dibuat
        sendOrderToWhatsApp(order);
    };

    // =========================
    // PAYMENT SUBMITTED
    // =========================

    const handlePaymentSubmitted = () => {
        setPage("my-orders");
    };

    // =========================
    // ORDER DETAIL
    // =========================

    const handleOpenOrderDetail = (orderId) => {
        setSelectedOrderId(orderId);
        setPage("order-detail");
    };

    // =========================
    // HOME
    // =========================

    const handleHome = () => {
        setPage("home");
    };

    // =========================
    // MENU
    // =========================

    const handleMenu = () => {
        setPage("home");

        setTimeout(() => {
            document
                .getElementById("menu")
                ?.scrollIntoView({
                    behavior: "smooth",
                });
        }, 50);
    };

    // =========================
    // FILTER MENU
    // =========================

    const filteredMenus = menus.filter((menu) => {
        // Menu unavailable tidak ditampilkan
        if (menu.isAvailable === false) {
            return false;
        }

        // Semua kategori
        if (selectedCategory === "Semua") {
            return true;
        }

        // Support beberapa kemungkinan nama field category
        const menuCategory =
            menu.category ||
            menu.categories ||
            menu.menuCategory ||
            "";

        if (Array.isArray(menuCategory)) {
            return menuCategory.includes(selectedCategory);
        }

        return (
            String(menuCategory).toLowerCase() ===
            selectedCategory.toLowerCase()
        );
    });

    // =========================
    // PAGE: LOGIN
    // =========================

    if (page === "login") {
        return (
            <Login
                onLogin={handleLogin}
                onRegister={() => setPage("register")}
                onBack={handleHome}
            />
        );
    }

    // =========================
    // PAGE: REGISTER
    // =========================

    if (page === "register") {
        return (
            <Register
                onRegister={handleRegister}
                onLogin={() => setPage("login")}
                onBack={handleHome}
            />
        );
    }

    // =========================
    // PAGE: CHECKOUT
    // =========================

    if (page === "checkout") {
        return (
            <Checkout
                cart={cart}
                totalPrice={totalPrice}
                user={user}
                onBack={() => setPage("home")}
                onOrderCreated={handleOrderCreated}
            />
        );
    }

    // =========================
    // PAGE: PAYMENT
    // =========================

    if (page === "payment") {
        return (
            <Payment
                order={createdOrder}
                onBack={() => setPage("home")}
                onPaymentSubmitted={handlePaymentSubmitted}
            />
        );
    }

    // =========================
    // PAGE: MY ORDERS
    // =========================

    if (page === "my-orders") {
        return (
            <MyOrders
                onBack={() => setPage("home")}
                onPayment={(order) => {
                    setCreatedOrder(order);
                    setPage("payment");
                }}
                onOrderDetail={(orderId) => {
                    setSelectedOrderId(orderId);
                    setPage("order-detail");
                }}
            />
        );
    }

    // =========================
    // PAGE: ORDER DETAIL
    // =========================

    if (page === "order-detail") {
        return (
            <OrderDetail
                orderId={selectedOrderId}
                onBack={() => setPage("my-orders")}
            />
        );
    }

    // =========================
    // PAGE: PAYMENT INFO
    // =========================

    if (page === "payment-info") {
        return (
            <PaymentPage
                onBack={handleHome}
            />
        );
    }

    // =========================
    // PAGE: TRACKING
    // =========================

    if (page === "tracking") {
        return (
            <TrackingPage
                onBack={handleHome}
                onOpenOrder={handleOpenOrderDetail}
            />
        );
    }

    // =========================
    // PAGE: FAVORITES
    // =========================

    if (page === "favorites") {
        return (
            <FavoritesPage
                onBack={handleHome}
            />
        );
    }

    // =========================
    // PAGE: PROMO
    // =========================

    if (page === "promo") {
        return (
            <PromoPage
                onBack={handleHome}
            />
        );
    }

    // =========================
    // PAGE: ABOUT
    // =========================

    if (page === "about") {
        return (
            <AboutPage
                onBack={handleHome}
            />
        );
    }

    // =========================
    // PAGE: HELP
    // =========================

    if (page === "help") {
        return (
            <HelpPage
                onBack={handleHome}
            />
        );
    }

    // =========================
    // PAGE: ACCOUNT
    // =========================

    if (page === "account") {
        return (
            <AccountPage
                user={user}
                onBack={handleHome}
                onLogout={handleLogout}
            />
        );
    }

    // =========================
    // PAGE: CATERING
    // =========================

    if (page === "catering") {
        return (
            <CateringPage
                onBack={handleHome}
            />
        );
    }

    // =========================
    // CUSTOMER HOME
    // =========================

    return (
        <div className="app">
            <CustomerNavbar
                user={user}
                totalItems={totalItems}
                onHome={handleHome}
                onMenu={handleMenu}
                onCart={() => setCartOpen(true)}
                onOrders={() => setPage("my-orders")}
                onLogin={() => setPage("login")}
                onLogout={handleLogout}
                onPaymentInfo={() =>
                    setPage("payment-info")
                }
                onTracking={() => setPage("tracking")}
                onFavorites={() => setPage("favorites")}
                onPromo={() => setPage("promo")}
                onAbout={() => setPage("about")}
                onHelp={() => setPage("help")}
                onAccount={() => setPage("account")}
                onCatering={() => setPage("catering")}
            />

            {cartOpen && (
                <CartModal
                    cart={cart}
                    totalItems={totalItems}
                    totalPrice={totalPrice}
                    onClose={() => setCartOpen(false)}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onCheckout={handleCheckout}
                />
            )}

            {/* =========================
                HERO
            ========================= */}

            <section className="hero">
                <div className="hero-overlay" />

                <div className="hero-content">
                    <span className="hero-label">
                        RESTO BANG BAH
                    </span>

                    <h1>
                        Rasa Rumahan,
                        <br />
                        <strong>Selera Semua.</strong>
                    </h1>

                    <p>
                        Dari ayam favorit sampai ikan,
                        seafood, daging, nasi, dan catering
                        untuk berbagai kebutuhan acara.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="hero-button"
                            onClick={handleMenu}
                        >
                            Lihat Menu
                            <span>→</span>
                        </button>

                        <button
                            className="hero-catering-button"
                            onClick={() =>
                                setPage("catering")
                            }
                        >
                            🍱 Catering
                        </button>
                    </div>

                    <div className="hero-trust">
                        <div>
                            <strong>🍗</strong>
                            <span>Menu Beragam</span>
                        </div>

                        <div>
                            <strong>🥡</strong>
                            <span>Takeaway</span>
                        </div>

                        <div>
                            <strong>🍱</strong>
                            <span>Catering</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================
                FEATURES
            ========================= */}

            <section className="home-features">
                <div className="home-feature">
                    <div className="home-feature-icon">
                        🍗
                    </div>

                    <div>
                        <strong>Menu Beragam</strong>

                        <p>
                            Ayam, ikan, seafood, daging,
                            nasi, mie, dan lainnya.
                        </p>
                    </div>
                </div>

                <div className="home-feature">
                    <div className="home-feature-icon">
                        🥡
                    </div>

                    <div>
                        <strong>Pesan Mudah</strong>

                        <p>
                            Pilih menu, masukkan keranjang,
                            lalu pesan dengan mudah.
                        </p>
                    </div>
                </div>

                <div className="home-feature">
                    <div className="home-feature-icon">
                        🍱
                    </div>

                    <div>
                        <strong>Catering Acara</strong>

                        <p>
                            Siap untuk kebutuhan keluarga,
                            kantor, meeting, dan acara lainnya.
                        </p>
                    </div>
                </div>
            </section>

            {/* =========================
                MENU
            ========================= */}

            <section
                id="menu"
                className="menu-section"
            >
                <div className="section-header">
                    <span>MENU KAMI</span>

                    <h2>
                        Pilihan favorit
                        <br />
                        Resto Bang Bah
                    </h2>
                </div>

                {/* CATEGORY */}

                <div className="menu-categories">
                    {[
                        "Semua",
                        "Ayam",
                        "Ikan",
                        "Seafood",
                        "Daging",
                        "Nasi",
                        "Mie",
                        "Lauk",
                        "Minuman",
                        "Paket",
                    ].map((category) => (
                        <button
                            key={category}
                            className={
                                selectedCategory ===
                                    category
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setSelectedCategory(
                                    category
                                )
                            }
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* LOADING */}

                {loading && (
                    <div className="menu-loading">
                        <p>Memuat menu...</p>
                    </div>
                )}

                {/* ERROR */}

                {!loading && error && (
                    <div className="menu-error">
                        <p>{error}</p>

                        <button
                            onClick={loadMenus}
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* EMPTY */}

                {!loading &&
                    !error &&
                    filteredMenus.length === 0 && (
                        <div className="menu-empty">
                            <div>🍽️</div>

                            <h3>
                                Belum ada menu
                            </h3>

                            <p>
                                Belum ada menu tersedia
                                untuk kategori ini.
                            </p>
                        </div>
                    )}

                {/* MENU GRID */}

                {!loading &&
                    !error &&
                    filteredMenus.length > 0 && (
                        <div className="menu-grid">
                            {filteredMenus.map(
                                (menu) => (
                                    <div
                                        className="menu-card"
                                        key={menu._id}
                                    >
                                        <div className="menu-image">
                                            {menu.image ? (
                                                <img
                                                    src={`http://localhost:5000/uploads/menus/${menu.image}`}
                                                    alt={
                                                        menu.name
                                                    }
                                                    onError={(
                                                        event
                                                    ) => {
                                                        event.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : (
                                                <span>
                                                    🍗
                                                </span>
                                            )}
                                        </div>

                                        <div className="menu-info">
                                            <h3>
                                                {
                                                    menu.name
                                                }
                                            </h3>

                                            <p>
                                                {menu.description ||
                                                    "Menu lezat Resto Bang Bah."}
                                            </p>

                                            <div className="menu-bottom">
                                                <strong>
                                                    Rp{" "}
                                                    {Number(
                                                        menu.price ||
                                                        0
                                                    ).toLocaleString(
                                                        "id-ID"
                                                    )}
                                                </strong>

                                                <button
                                                    onClick={() =>
                                                        addToCart(
                                                            menu
                                                        )
                                                    }
                                                >
                                                    + Tambah
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
            </section>

            {/* =========================
                FOOTER
            ========================= */}

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>
                            Resto Bang Bah
                        </h3>

                        <p>
                            Ayam bakar dan ayam goreng
                            Resto Bang Bah.
                        </p>
                    </div>

                    <div className="footer-info">
                        <strong>
                            Pesan Sekarang
                        </strong>

                        <p>
                            Takeaway atau catering
                            untuk kebutuhan acara.
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()}{" "}
                        Resto Bang Bah. All rights
                        reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
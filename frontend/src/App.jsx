import { useEffect, useState } from "react";
import { getMenus } from "./services/api";
import Checkout from "./pages/checkout";
import Payment from "./pages/payment";
import Login from "./pages/login";
import Register from "./pages/register";
import MyOrders from "./pages/myorders";

function App() {
    const [menus, setMenus] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState("home");
    const [createdOrder, setCreatedOrder] = useState(null);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        const loadMenus = async () => {
            try {
                const data = await getMenus();
                setMenus(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadMenus();
    }, []);

    const addToCart = (menu) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item._id === menu._id
            );

            if (existingItem) {
                return currentCart.map((item) =>
                    item._id === menu._id
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                          }
                        : item
                );
            }

            return [
                ...currentCart,
                {
                    ...menu,
                    quantity: 1,
                },
            ];
        });
    };

    const increaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item._id === id
                    ? {
                          ...item,
                          quantity: item.quantity + 1,
                      }
                    : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item._id === id
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
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handleLogin = (result) => {
        setUser(result.user);
        
        if (cart.length > 0) {
          setPage("checkout");
        } else {
          setPage("home")
        }
    };

    const handleRegister = () => {
        setPage("login");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setPage("home");
    };

    const handleCheckout = () => {
        if (!user) {
            setPage("login");
            return;
        }

        setPage("checkout");
    };

    if (page === "login") {
        return (
            <Login
                onLogin={handleLogin}
                onBack={() => setPage("home")}
                onRegister={() => setPage("register")}
            />
        );
    }

    if (page === "register") {
        return (
            <Register
                onRegister={handleRegister}
                onBack={() => setPage("home")}
                onLogin={() => setPage("login")}
            />
        );
    }

    if (page === "my-orders") {
      return (
        <MyOrders
          onBack={() => setPage("home")}
          onPayment={(order) => {
            setCreatedOrder(order);
            setPage("payment");
          }}
        />
      );
    }

    if (page === "checkout") {
    return (
        <Checkout
            cart={cart}
            totalPrice={totalPrice}
            onBack={() => setPage("home")}
            onOrderCreated={(order) => {
                console.log("Order berhasil dibuat:", order);

                setCreatedOrder(order);
                setCart([]);

                if (order.paymentMethod === "bank_transfer") {
                    setPage("payment");
                } else {
                    setPage("home");

                    alert(
                        `Pesanan ${order.orderNumber} berhasil dibuat!`
                    );
                }
            }}
        />
    );
}

if (page === "payment") {
    return (
        <Payment
            order={createdOrder}
            onBack={() => setPage("home")}
            onPaymentSubmitted={(payment) => {
                console.log(
                    "Bukti pembayaran berhasil dikirim:",
                    payment
                );

                setPage("home");

                alert(
                    `Bukti pembayaran untuk pesanan ${createdOrder.orderNumber} berhasil dikirim!`
                );
            }}
        />
    );
}

    return (
        <>
            <nav className="navbar">
    <div className="brand">
        <span className="brand-main">Bang Bah</span>
        <span className="brand-sub">
            Ayam Bakar & Ayam Goreng
        </span>
    </div>

    <div className="nav-links">
        <a
            href="#menu"
            onClick={() => setPage("home")}
        >
            Menu
        </a>

        <a
            href="#cart"
            onClick={() => setPage("home")}
        >
            Keranjang
        </a>

        {user && (
          <a 
          href="#orders"
          onClick={() => setPage ("my-orders")}
          >
            Pesanan Saya
          </a>
        )}
    </div>

    <div className="nav-actions">
        {user ? (
            <button
                className="cart-button"
                onClick={handleLogout}
            >
                Logout
            </button>
        ) : (
            <button
                className="cart-button"
                onClick={() => setPage("login")}
            >
                Login
            </button>
        )}

        <button
            className="cart-button"
            onClick={() =>
                document
                    .getElementById("cart")
                    ?.scrollIntoView({
                        behavior: "smooth",
                    })
            }
        >
            🛒 <span>{totalItems}</span>
        </button>
    </div>
</nav>

            <section className="hero">
                <div className="hero-content">
                    <span>RESTO BANG BAH</span>

                    <h1>
                        Ayam Bakar &
                        <br />
                        Ayam Goreng
                    </h1>

                    <p>
                        Pesan makanan favoritmu dengan mudah.
                        Fresh, enak, dan siap disantap.
                    </p>

                    <button
                        className="hero-button"
                        onClick={() =>
                            document
                                .getElementById("menu")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                })
                        }
                    >
                        Lihat Menu
                    </button>
                </div>
            </section>

            <section id="menu" className="menu-section">
                <div className="section-header">
                    <span>MENU KAMI</span>

                    <h2>
                        Pilihan favorit
                        <br />
                        Resto Bang Bah
                    </h2>
                </div>

                {loading && <p>Memuat menu...</p>}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <div className="menu-grid">
                    {menus.map((menu) => (
                        <div
                            className="menu-card"
                            key={menu._id}
                        >
                            <div className="menu-image">
                                🍗
                            </div>

                            <div className="menu-info">
                                <h3>{menu.name}</h3>

                                <p>
                                    {menu.description ||
                                        "Menu lezat Resto Bang Bah."}
                                </p>

                                <div className="menu-bottom">
                                    <strong>
                                        Rp{" "}
                                        {menu.price.toLocaleString(
                                            "id-ID"
                                        )}
                                    </strong>

                                    <button
                                        onClick={() =>
                                            addToCart(menu)
                                        }
                                    >
                                        + Tambah
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="cart" className="cart-section">
                <div className="cart-header">
                    <div>
                        <span>KERANJANG</span>
                        <h2>Pesanan kamu</h2>
                    </div>

                    <strong>
                        {totalItems} item
                    </strong>
                </div>

                {cart.length === 0 ? (
                    <p className="empty-cart">
                        Keranjang masih kosong.
                    </p>
                ) : (
                    <>
                        <div className="cart-list">
                            {cart.map((item) => (
                                <div
                                    className="cart-item"
                                    key={item._id}
                                >
                                    <div>
                                        <h3>{item.name}</h3>

                                        <p>
                                            Rp{" "}
                                            {item.price.toLocaleString(
                                                "id-ID"
                                            )}
                                        </p>
                                    </div>

                                    <div className="quantity-control">
                                        <button
                                            onClick={() =>
                                                decreaseQuantity(
                                                    item._id
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span>
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() =>
                                                increaseQuantity(
                                                    item._id
                                                )
                                            }
                                        >
                                            +
                                        </button>
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

                        <div className="cart-total">
                            <span>Total</span>

                            <strong>
                                Rp{" "}
                                {totalPrice.toLocaleString(
                                    "id-ID"
                                )}
                            </strong>
                        </div>

                        <button
                            className="checkout-button"
                            onClick={handleCheckout}
                        >
                            Lanjut Pesan
                        </button>
                    </>
                )}
            </section>

            <footer>
                <p>
                    © 2026 Resto Bang Bah. Semua hak
                    dilindungi.
                </p>
            </footer>
        </>
    );
}

export default App;
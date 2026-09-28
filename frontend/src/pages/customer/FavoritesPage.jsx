import "./css/customer-pages.css";

function FavoritesPage({ menus = [], onAddToCart, onBack }) {
    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button onClick={onBack}>←</button>
                <div>
                    <h1>Favorit</h1>
                    <p>Menu yang kamu sukai</p>
                </div>
            </div>

            <div className="empty-state">
                <div className="empty-icon">❤️</div>
                <h2>Belum ada favorit</h2>
                <p>
                    Menu yang kamu sukai akan muncul di halaman ini.
                </p>
            </div>

            {menus.length > 0 && (
                <div className="customer-card">
                    <h2>Menu Pilihan</h2>

                    <div className="favorite-list">
                        {menus.slice(0, 3).map((menu) => (
                            <div className="favorite-item" key={menu._id}>
                                <div>
                                    <strong>{menu.name}</strong>
                                    <p>
                                        Rp{" "}
                                        {Number(menu.price).toLocaleString(
                                            "id-ID"
                                        )}
                                    </p>
                                </div>

                                <button
                                    onClick={() => onAddToCart(menu)}
                                    className="primary-button"
                                >
                                    + Keranjang
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;
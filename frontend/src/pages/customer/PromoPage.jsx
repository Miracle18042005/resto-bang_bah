import "./css/customer-pages.css";

function PromoPage({ onBack }) {
    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button onClick={onBack}>←</button>
                <div>
                    <h1>Promo</h1>
                    <p>Penawaran dari Bang Bah</p>
                </div>
            </div>

            <div className="promo-card">
                <div className="promo-icon">🍗</div>

                <div>
                    <span className="promo-label">PROMO</span>
                    <h2>Menu Favorit Bang Bah</h2>
                    <p>
                        Nikmati berbagai pilihan ayam dan menu favorit
                        Bang Bah.
                    </p>
                </div>
            </div>

            <div className="promo-card">
                <div className="promo-icon">🎉</div>

                <div>
                    <span className="promo-label">COMING SOON</span>
                    <h2>Promo Spesial</h2>
                    <p>
                        Promo dan penawaran khusus akan tersedia di sini.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PromoPage;
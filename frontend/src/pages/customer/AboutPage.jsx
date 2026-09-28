import "./css/customer-pages.css";

function AboutPage({ onBack }) {
    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button onClick={onBack}>←</button>
                <div>
                    <h1>Tentang Kami</h1>
                    <p>Kenal lebih dekat dengan Bang Bah</p>
                </div>
            </div>

            <div className="about-hero">
                <div className="about-logo">🍗</div>
                <h2>Resto Bang Bah</h2>
                <p>
                    Ayam bakar dan ayam goreng Resto Bang Bah
                </p>
            </div>

            <div className="customer-card">
                <h2>Tentang Bang Bah</h2>

                <p>
                    Resto Bang Bah menyediakan berbagai pilihan menu ayam
                    untuk dinikmati bersama keluarga dan orang-orang
                    terdekat.
                </p>

                <p>
                    Pesanan dapat dilakukan secara online melalui website
                    Bang Bah untuk mempermudah proses pemesanan.
                </p>
            </div>

            <div className="customer-card">
                <h2>Kenapa Bang Bah?</h2>

                <div className="feature-grid">
                    <div>
                        <span>🍗</span>
                        <strong>Menu Ayam</strong>
                        <p>Berbagai pilihan menu ayam.</p>
                    </div>

                    <div>
                        <span>📦</span>
                        <strong>Takeaway</strong>
                        <p>Pesanan siap untuk diambil.</p>
                    </div>

                    <div>
                        <span>🛵</span>
                        <strong>Delivery</strong>
                        <p>Pesanan dapat dikirim.</p>
                    </div>

                    <div>
                        <span>💬</span>
                        <strong>Mudah Dipesan</strong>
                        <p>Pesan dengan mudah secara online.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
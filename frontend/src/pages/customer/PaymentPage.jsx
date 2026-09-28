import "./css/customer-pages.css";

function PaymentPage({ onBack }) {
    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button onClick={onBack}>←</button>
                <div>
                    <h1>Pembayaran</h1>
                    <p>Informasi pembayaran pesanan kamu</p>
                </div>
            </div>

            <div className="customer-card">
                <div className="customer-card-icon">💳</div>

                <h2>Metode Pembayaran</h2>
                <p>
                    Pilih metode pembayaran yang tersedia saat melakukan
                    checkout.
                </p>

                <div className="info-list">
                    <div className="info-item">
                        <span>🏦</span>
                        <div>
                            <strong>Bank Transfer</strong>
                            <p>
                                Lakukan transfer sesuai nominal pesanan,
                                kemudian kirim bukti pembayaran.
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span>💵</span>
                        <div>
                            <strong>Cash</strong>
                            <p>
                                Pembayaran tunai tersedia untuk pesanan
                                takeaway.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="customer-card">
                <div className="customer-card-icon">📸</div>
                <h2>Bukti Pembayaran</h2>
                <p>
                    Untuk transfer bank, bukti pembayaran dapat dikirim
                    melalui halaman pembayaran pesanan.
                </p>
            </div>
        </div>
    );
}

export default PaymentPage;
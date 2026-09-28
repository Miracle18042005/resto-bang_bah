import "./css/customer-pages.css";

function TrackingPage({ onBack }) {
    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button onClick={onBack}>←</button>
                <div>
                    <h1>Lacak Pesanan</h1>
                    <p>Pantau proses pesanan kamu</p>
                </div>
            </div>

            <div className="customer-card tracking-card">
                <div className="tracking-order">
                    <span>Nomor Pesanan</span>
                    <strong>RB-XXXXXXXX</strong>
                </div>

                <div className="tracking-timeline">
                    <div className="tracking-step active">
                        <div className="tracking-dot">✓</div>
                        <div>
                            <strong>Pesanan Dibuat</strong>
                            <p>Pesanan berhasil dibuat.</p>
                        </div>
                    </div>

                    <div className="tracking-step active">
                        <div className="tracking-dot">✓</div>
                        <div>
                            <strong>Pembayaran</strong>
                            <p>Pembayaran sedang diproses.</p>
                        </div>
                    </div>

                    <div className="tracking-step">
                        <div className="tracking-dot">3</div>
                        <div>
                            <strong>Pesanan Diproses</strong>
                            <p>Pesanan akan disiapkan oleh Bang Bah.</p>
                        </div>
                    </div>

                    <div className="tracking-step">
                        <div className="tracking-dot">4</div>
                        <div>
                            <strong>Siap Diambil / Dikirim</strong>
                            <p>Pesanan siap untuk diterima.</p>
                        </div>
                    </div>

                    <div className="tracking-step">
                        <div className="tracking-dot">5</div>
                        <div>
                            <strong>Selesai</strong>
                            <p>Pesanan telah selesai.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="customer-card">
                <h2>Informasi</h2>
                <p>
                    Status pesanan akan diperbarui ketika pesanan diproses
                    oleh Bang Bah.
                </p>
            </div>
        </div>
    );
}

export default TrackingPage;
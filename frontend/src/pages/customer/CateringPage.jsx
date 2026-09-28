import "./css/customer-pages.css";

function CateringPage({ onBack }) {
    const packages = [
        {
            icon: "🍱",
            name: "Catering Hemat",
            description: "Cocok untuk acara kecil, keluarga, dan kumpul bersama.",
            price: "Mulai dari Rp25.000 / orang",
        },
        {
            icon: "🍗",
            name: "Catering Lengkap",
            description: "Pilihan lauk lengkap untuk acara kantor, meeting, dan keluarga.",
            price: "Mulai dari Rp35.000 / orang",
        },
        {
            icon: "🍽️",
            name: "Catering Premium",
            description: "Menu lebih lengkap untuk acara spesial dan jumlah tamu besar.",
            price: "Mulai dari Rp50.000 / orang",
        },
    ];

    const events = [
        "🏢 Acara Kantor",
        "🎂 Ulang Tahun",
        "👨‍👩‍👧‍👦 Acara Keluarga",
        "🎓 Sekolah / Kampus",
        "🕌 Pengajian",
        "🤝 Meeting",
        "🎉 Acara Besar",
        "🍽️ Acara Lainnya",
    ];

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            "Halo Bang Bah, saya ingin konsultasi catering."
        );

        window.open(
            `https://wa.me/628xxxxxxxxxx?text=${message}`,
            "_blank"
        );
    };

    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button
                    className="customer-back-button"
                    onClick={onBack}
                >
                    ← Kembali
                </button>

                <div>
                    <span className="customer-page-label">
                        LAYANAN CATERING
                    </span>

                    <h1>Catering Bang Bah</h1>

                    <p>
                        Siap menyediakan makanan untuk berbagai acara,
                        dari acara keluarga sampai kebutuhan kantor.
                    </p>
                </div>
            </div>

            <section className="customer-page-section">
                <div className="customer-section-heading">
                    <span>PILIHAN CATERING</span>
                    <h2>Paket Catering</h2>
                    <p>
                        Pilih paket sesuai kebutuhan acara kamu.
                    </p>
                </div>

                <div className="customer-card-grid">
                    {packages.map((item) => (
                        <div
                            className="customer-info-card"
                            key={item.name}
                        >
                            <div className="customer-info-icon">
                                {item.icon}
                            </div>

                            <h3>{item.name}</h3>

                            <p>{item.description}</p>

                            <strong>{item.price}</strong>

                            <button
                                className="customer-primary-button"
                                onClick={handleWhatsApp}
                            >
                                Konsultasi
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="customer-page-section catering-event-section">
                <div className="customer-section-heading">
                    <span>UNTUK BERBAGAI ACARA</span>
                    <h2>Catering untuk Acara Kamu</h2>
                    <p>
                        Mau acara kecil atau besar, kita bisa
                        menyesuaikan kebutuhan makanan kamu.
                    </p>
                </div>

                <div className="catering-event-grid">
                    {events.map((event) => (
                        <div
                            className="catering-event-card"
                            key={event}
                        >
                            {event}
                        </div>
                    ))}
                </div>
            </section>

            <section className="catering-contact-card">
                <div>
                    <span>🍽️ BINGUNG PILIH MENU?</span>

                    <h2>
                        Konsultasikan Catering
                        <br />
                        Bersama Bang Bah
                    </h2>

                    <p>
                        Beritahu kami tanggal acara, jumlah orang,
                        lokasi, dan kebutuhan kamu. Nanti kita
                        bantu menyesuaikan pilihan menunya.
                    </p>
                </div>

                <button
                    className="customer-primary-button"
                    onClick={handleWhatsApp}
                >
                    💬 Konsultasi via WhatsApp
                </button>
            </section>
        </div>
    );
}

export default CateringPage;
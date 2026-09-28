import "./css/customer-pages.css";

function HelpPage({ onBack }) {
    const faqs = [
        {
            question: "Bagaimana cara memesan?",
            answer:
                "Pilih menu yang kamu inginkan, masukkan ke keranjang, lalu lanjutkan ke checkout.",
        },
        {
            question: "Apakah harus login?",
            answer:
                "Login diperlukan ketika ingin melanjutkan proses pemesanan.",
        },
        {
            question: "Bagaimana cara membayar?",
            answer:
                "Metode pembayaran tersedia melalui bank transfer dan cash sesuai ketentuan pesanan.",
        },
        {
            question: "Bagaimana cara melihat pesanan?",
            answer:
                "Buka menu Pesanan Saya untuk melihat daftar dan detail pesanan.",
        },
        {
            question: "Bagaimana jika ada masalah dengan pesanan?",
            answer:
                "Hubungi Bang Bah melalui WhatsApp untuk mendapatkan bantuan.",
        },
    ];

    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button onClick={onBack}>←</button>
                <div>
                    <h1>Bantuan</h1>
                    <p>Pertanyaan yang sering ditanyakan</p>
                </div>
            </div>

            <div className="customer-card">
                <h2>FAQ</h2>

                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <details key={index} className="faq-item">
                            <summary>{faq.question}</summary>
                            <p>{faq.answer}</p>
                        </details>
                    ))}
                </div>
            </div>

            <div className="customer-card help-contact">
                <div className="customer-card-icon">💬</div>
                <h2>Butuh bantuan?</h2>
                <p>
                    Hubungi Bang Bah melalui WhatsApp jika kamu mengalami
                    masalah dengan pesanan.
                </p>

                <button
                    className="primary-button"
                    onClick={() =>
                        window.open(
                            "https://wa.me/6285123607185",
                            "_blank"
                        )
                    }
                >
                    Hubungi WhatsApp
                </button>
            </div>
        </div>
    );
}

export default HelpPage;
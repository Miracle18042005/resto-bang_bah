import "./css/customer-pages.css";

function AccountPage({ user, onBack, onLogout }) {
    return (
        <div className="customer-page">
            <div className="customer-page-header">
                <button onClick={onBack}>←</button>
                <div>
                    <h1>Akun</h1>
                    <p>Informasi akun kamu</p>
                </div>
            </div>

            {user ? (
                <>
                    <div className="account-profile">
                        <div className="account-avatar">
                            {(user.name || "U").charAt(0).toUpperCase()}
                        </div>

                        <h2>{user.name || "Pengguna"}</h2>

                        <p>
                            {user.phone ||
                                user.email ||
                                "Akun Bang Bah"}
                        </p>
                    </div>

                    <div className="customer-card">
                        <h2>Informasi Akun</h2>

                        <div className="account-info">
                            <div>
                                <span>Nama</span>
                                <strong>{user.name || "-"}</strong>
                            </div>

                            <div>
                                <span>No. HP</span>
                                <strong>{user.phone || "-"}</strong>
                            </div>

                            {user.email && (
                                <div>
                                    <span>Email</span>
                                    <strong>{user.email}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={onLogout}
                    >
                        🚪 Logout
                    </button>
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">👤</div>
                    <h2>Belum Login</h2>
                    <p>Silakan login untuk melihat akun kamu.</p>
                </div>
            )}
        </div>
    );
}

export default AccountPage;
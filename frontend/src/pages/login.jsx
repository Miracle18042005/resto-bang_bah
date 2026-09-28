import { useState } from "react";
import "../css/login.css";

function Login({ onLogin, onBack, onRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Login gagal");
            }

            const token = result.data?.token;
            const loggedInUser = result.data?.user;

            if (!token || !loggedInUser) {
                throw new Error(
                    "Data login tidak ditemukan"
                );
            }

            if (loggedInUser.role === "admin") {
                throw new Error(
                    "Akun admin harus login melalui halaman admin"
                )
            }

            localStorage.setItem(
                "token",
                token
            );
            
            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );

            onLogin({
                token,
                user: loggedInUser,
            })
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <button className="back-button" onClick={onBack}>
                    ← Kembali
                </button>

                <div className="auth-header">
                    <span>RESTO BANG BAH</span>
                    <h1>Login</h1>
                    <p>Masuk untuk melanjutkan pesanan kamu.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Masukkan email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Memproses..." : "Login"}
                    </button>
                </form>

                <p className="auth-switch">
                    Belum punya akun?{" "}
                    <button onClick={onRegister}>
                        Daftar sekarang
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
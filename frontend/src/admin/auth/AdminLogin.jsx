import { useState } from "react";
import "../css/adminlogin.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Email dan password wajib diisi.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Login gagal"
                );
            }

            const user = result.data?.user || result.user;

            if (!user || user.role !== "admin") {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                throw new Error(
                    "Akun ini bukan akun admin."
                );
            }

            localStorage.setItem(
                "adminToken",
                result.data?.token || result.token
            );

            localStorage.setItem(
                "adminUser",
                JSON.stringify(user)
            );

            window.location.href = "/admin";
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">

                <div className="admin-login-logo">
                    <div className="admin-login-icon">
                        🍗
                    </div>

                    <h1>Bang Bah</h1>

                    <p>
                        Admin Dashboard
                    </p>
                </div>

                <form
                    className="admin-login-form"
                    onSubmit={handleLogin}
                >

                    <div className="admin-login-field">
                        <label>
                            Email
                        </label>

                        <input
                            type="tel"
                            placeholder="Masukkan email admin"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            autoComplete="username"
                        />
                    </div>

                    <div className="admin-login-field">
                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="admin-login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Memproses..."
                            : "Login Admin"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default AdminLogin;
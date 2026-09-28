import { useEffect, useState } from "react";
import "./css/adminmenu.css";

const API_URL = "http://localhost:5000";

function AdminMenu() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
        isAvailable: true,
    });

    const fetchMenus = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/menus`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal mengambil data menu"
                );
            }

            setMenus(result.data || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
            files,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "file"
                    ? files[0] || null
                    : value,
        }));
    };

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            price: "",
            category: "",
            image: null,
            isAvailable: true,
        });

        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");

        try {
            const url = editingId
                ? `${API_URL}/api/menus/${editingId}`
                : `${API_URL}/api/menus`;

            const method = editingId
                ? "PUT"
                : "POST";

            const formData = new FormData();

            formData.append(
                "name",
                form.name
            );

            formData.append(
                "description",
                form.description
            );

            formData.append(
                "price",
                Number(form.price)
            );

            formData.append(
                "category",
                form.category
            );

            formData.append(
                "isAvailable",
                form.isAvailable
            );

            if (form.image) {
                formData.append(
                    "menuImage",
                    form.image
                );
            }

            const response = await fetch(
                url,
                {
                    method,
                    body: formData,
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal menyimpan menu"
                );
            }

            alert(
                editingId
                    ? "Menu berhasil diperbarui"
                    : "Menu berhasil ditambahkan"
            );

            resetForm();
            fetchMenus();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (menu) => {
        setForm({
            name: menu.name || "",
            description:
                menu.description || "",
            price: menu.price ?? "",
            category:
                menu.category || "",
            image: null,
            isAvailable:
                menu.isAvailable !== false,
        });

        setEditingId(menu._id);
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm(
                "Yakin ingin menghapus menu ini?"
            );

        if (!confirmed) {
            return;
        }

        try {
            const response =
                await fetch(
                    `${API_URL}/api/menus/${id}`,
                    {
                        method: "DELETE",
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal menghapus menu"
                );
            }

            alert(
                "Menu berhasil dihapus"
            );

            fetchMenus();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatRupiah = (price) => {
        return `Rp ${Number(
            price || 0
        ).toLocaleString("id-ID")}`;
    };

    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${API_URL}/uploads/menus/${image}`;
    };

    return (
        <div className="admin-menu-page">

            <div className="dashboard-title">
                <h2>Manajemen Menu</h2>

                <p>
                    Kelola menu makanan Resto
                    Bang Bah
                </p>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            <div className="menu-admin-toolbar">
                <div>
                    <strong>
                        {menus.length} Menu
                    </strong>

                    <span>
                        {" "}
                        tersedia di sistem
                    </span>
                </div>

                <button
                    className="menu-add-button"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setEditingId(null);
                            setShowForm(true);
                        }
                    }}
                >
                    {showForm
                        ? "Tutup Form"
                        : "+ Tambah Menu"}
                </button>
            </div>

            {showForm && (
                <form
                    className="menu-admin-form"
                    onSubmit={handleSubmit}
                >
                    <div className="menu-form-header">
                        <div>
                            <h3>
                                {editingId
                                    ? "Edit Menu"
                                    : "Tambah Menu"}
                            </h3>

                            <p>
                                Isi informasi menu
                                dengan lengkap.
                            </p>
                        </div>
                    </div>

                    <div className="menu-form-grid">

                        <div className="menu-form-field">
                            <label>
                                Nama Menu
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={
                                    handleChange
                                }
                                placeholder="Contoh: Ayam Bakar"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="menu-form-field">
                            <label>
                                Kategori
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={
                                    form.category
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Contoh: Ayam"
                                maxLength={50}
                                required
                            />
                        </div>

                        <div className="menu-form-field">
                            <label>
                                Harga
                            </label>

                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={
                                    handleChange
                                }
                                placeholder="20000"
                                min="0"
                                required
                            />
                        </div>

                        <div className="menu-form-field">
                            <label>
                                Gambar Menu
                            </label>

                            <input
                                type="file"
                                name="image"
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                onChange={
                                    handleChange
                                }
                            />

                            <small>
                                JPG, PNG, atau WebP.
                                Maksimal 5 MB.
                            </small>
                        </div>

                        <div className="menu-form-field menu-form-full">
                            <label>
                                Deskripsi
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Deskripsi menu..."
                                maxLength={500}
                                rows={4}
                            />
                        </div>

                        <label className="menu-availability">
                            <input
                                type="checkbox"
                                name="isAvailable"
                                checked={
                                    form.isAvailable
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <span>
                                Menu tersedia
                            </span>
                        </label>

                    </div>

                    <div className="menu-form-actions">
                        <button
                            type="button"
                            className="menu-cancel-button"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="menu-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Menyimpan..."
                                : editingId
                                ? "Simpan Perubahan"
                                : "Tambah Menu"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="dashboard-section">
                    <p>
                        Memuat menu...
                    </p>
                </div>
            ) : menus.length === 0 ? (
                <div className="menu-empty">
                    <div className="menu-empty-icon">
                        🍗
                    </div>

                    <h3>
                        Belum ada menu
                    </h3>

                    <p>
                        Tambahkan menu pertama
                        Resto Bang Bah.
                    </p>
                </div>
            ) : (
                <div className="menu-admin-grid">
                    {menus.map((menu) => {
                        const imageUrl =
                            getImageUrl(
                                menu.image
                            );

                        return (
                            <div
                                className="menu-admin-card"
                                key={menu._id}
                            >
                                {imageUrl ? (
                                    <img
                                        className="menu-admin-image"
                                        src={imageUrl}
                                        alt={
                                            menu.name
                                        }
                                        onError={(
                                            e
                                        ) => {
                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                ) : (
                                    <div className="menu-admin-image-placeholder">
                                        🍗
                                    </div>
                                )}

                                <div className="menu-admin-card-body">

                                    <div className="menu-admin-card-top">
                                        <div>
                                            <span className="menu-category">
                                                {
                                                    menu.category
                                                }
                                            </span>

                                            <h3>
                                                {
                                                    menu.name
                                                }
                                            </h3>
                                        </div>

                                        <span
                                            className={`menu-availability-badge ${
                                                menu.isAvailable
                                                    ? "available"
                                                    : "unavailable"
                                            }`}
                                        >
                                            {menu.isAvailable
                                                ? "Tersedia"
                                                : "Tidak tersedia"}
                                        </span>
                                    </div>

                                    {menu.description && (
                                        <p className="menu-description">
                                            {
                                                menu.description
                                            }
                                        </p>
                                    )}

                                    <strong className="menu-price">
                                        {formatRupiah(
                                            menu.price
                                        )}
                                    </strong>

                                    <div className="menu-card-actions">
                                        <button
                                            className="menu-edit-button"
                                            onClick={() =>
                                                handleEdit(
                                                    menu
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="menu-delete-button"
                                            onClick={() =>
                                                handleDelete(
                                                    menu._id
                                                )
                                            }
                                        >
                                            Hapus
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminMenu;
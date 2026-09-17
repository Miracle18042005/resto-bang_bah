const API_URL = "http://localhost:5000/api";

export const getMenus = async () => {
    const response = await fetch(`${API_URL}/menus`);

    if (!response.ok) {
        throw new Error("Gagal mengambil data menu");
    }

    const result = await response.json();

    return result.data;
};

export const createOrder = async ({
    items,
    orderType,
    paymentMethod,
    deliveryAddress,
}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Silakan login terlebih dahulu");
    }

    const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            items,
            orderType,
            paymentMethod,
            deliveryAddress,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Gagal membuat pesanan");
    }

    return result;
};
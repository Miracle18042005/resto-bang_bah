import { useEffect, useState } from "react";
import "./css/adminorders.css";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [processingId, setProcessingId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const [courierFiles, setCourierFiles] = useState({});
    const [processingCourierId, setProcessingCourierId] = useState(null);

    const [deliveryFiles, setDeliveryFiles] = useState({});
    const [processingDeliveryId, setProcessingDeliveryId] = useState(null);
    
    const [pickupFiles, setPickupFiles] = useState({});
    const [processingPickupId, setProcessingPickupId] = useState(null);

    const toggleOrderDetail = (orderId) => {
        setExpandedOrderId((current) => 
            current === orderId ? null : orderId
        );
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                "http://localhost:5000/api/admin/orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal mengambil pesanan"
                );
            }

            setOrders(result.data || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(
            fetchOrders,
            5000
        );

        return () => clearInterval(interval);
    }, []);

    const handleAction = async (
        orderId,
        endpoint,
        options = {}
    ) => {
        try {
            setProcessingId(orderId);

            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `http://localhost:5000/api/admin/orders/${orderId}/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...(options.body
                            ? {}
                            : {
                                  "Content-Type":
                                      "application/json",
                              }),
                    },
                    ...options,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal memproses pesanan"
                );
            }

            await fetchOrders();

            alert(
                result.message ||
                    "Pesanan berhasil diperbarui"
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const processOrder = (order) => {
        handleAction(
            order._id,
            "process"
        );
    };

    const readyOrder = (order) => {
        if (order.orderType === "takeaway") {
            handleAction(
                order._id,
                "ready"
            );
        } else {
            handleAction(
                order._id,
                "ready-for-delivery"
            );
        }
    };

    const cancelOrder = async (order) => {
        const confirmed = window.confirm(
            `Yakin ingin membatalkan pesanan ${order.orderNumber}?`
        );

        if (!confirmed) return;

        handleAction(
            order._id,
            "cancel"
        );
    };

    const statusLabels = {
        waiting_payment:
            "Menunggu Pembayaran",
        payment_submitted:
            "Menunggu Verifikasi",
        payment_rejected:
            "Pembayaran Ditolak",
        payment_verified:
            "Pembayaran Terverifikasi",
        processing: "Diproses",
        ready_for_pickup:
            "Siap Diambil",
        ready_for_delivery:
            "Siap Dikirim",
        out_for_delivery:
            "Dalam Perjalanan",
        completed: "Selesai",
        cancelled: "Dibatalkan",
    };

    const paymentLabels = {
        bank_transfer:
            "Bank Transfer",
        cash: "Cash",
    };

    const handleCourierDelivery = async (orderId) => {
    const file = courierFiles[orderId];

    if (!file) {
        alert(
            "Pilih foto bukti serah terima kurir terlebih dahulu."
        );
        return;
    }

    try {
        setProcessingCourierId(orderId);

        const token = localStorage.getItem("adminToken");

        const formData = new FormData();
        formData.append("courierProofImage", file);

        const response = await fetch(
            `http://localhost:5000/api/admin/orders/${orderId}/out-for-delivery`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                    "Gagal menyerahkan order ke kurir"
            );
        }

        await fetchOrders();

        setCourierFiles((current) => {
            const updated = { ...current };
            delete updated[orderId];
            return updated;
        });

        alert(
            result.message ||
                "Order berhasil diserahkan kepada kurir."
        );
    } catch (err) {
        alert(err.message);
    } finally {
        setProcessingCourierId(null);
    }
};

const handleDeliveryCompleted = async (orderId) => {
    const file = deliveryFiles[orderId];

    if (!file) {
        alert(
            "Pilih foto bukti pesanan sudah diterima terlebih dahulu."
        );
        return;
    }

    try {
        setProcessingDeliveryId(orderId);

        const token = localStorage.getItem("adminToken");

        const formData = new FormData();
        formData.append("deliveryProofImage", file);

        const response = await fetch(
            `http://localhost:5000/api/admin/orders/${orderId}/delivered`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                    "Gagal menyelesaikan pesanan"
            );
        }

        await fetchOrders();

        setDeliveryFiles((current) => {
            const updated = { ...current };
            delete updated[orderId];
            return updated;
        });

        alert(
            result.message ||
                "Pesanan berhasil diselesaikan."
        );
    } catch (err) {
        alert(err.message);
    } finally {
        setProcessingDeliveryId(null);
    }
};

const handlePickupCompleted = async (order) => {
    const file = pickupFiles[order._id];

    if (!file) {
        alert(
            "Pilih foto bukti serah terima pickup terlebih dahulu."
        );
        return;
    }

    try {
        setProcessingPickupId(order._id);

        const token = localStorage.getItem("adminToken");

        const formData = new FormData();
        formData.append("pickupProofImage", file);

        const endpoint =
            order.paymentMethod === "cash"
                ? "cash-pickup"
                : "pickup";

        const response = await fetch(
            `http://localhost:5000/api/admin/orders/${order._id}/${endpoint}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                    "Gagal menyelesaikan pickup"
            );
        }

        await fetchOrders();

        setPickupFiles((current) => {
            const updated = { ...current };
            delete updated[order._id];
            return updated;
        });

        alert(
            result.message ||
                "Pesanan berhasil diselesaikan."
        );
    } catch (err) {
        alert(err.message);
    } finally {
        setProcessingPickupId(null);
    }
};

    return (
        <div className="admin-orders">

            <div className="dashboard-title">
                <h2>Manajemen Pesanan</h2>
                <p>
                    Kelola seluruh pesanan Resto Bang Bah
                </p>
            </div>

            {loading && (
                <p>Memuat pesanan...</p>
            )}

            {error && (
                <p className="admin-error">
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                orders.length === 0 && (
                    <div className="dashboard-section">
                        <p className="empty-dashboard">
                            Belum ada pesanan.
                        </p>
                    </div>
                )}

            <div className="admin-orders-list">

                {orders.map((order) => (
                    <div
                        className="admin-order-card"
                        key={order._id}
                    >

                        <div className="admin-order-header">

                            <div>
                                <strong>
                                    {order.orderNumber}
                                </strong>

                                <span>
                                    {order.createdAt
                                        ? new Date(
                                              order.createdAt
                                          ).toLocaleString(
                                              "id-ID"
                                          )
                                        : "-"}
                                </span>
                            </div>

                            <span
                                className={`order-status status-${order.status}`}
                            >
                                {statusLabels[
                                    order.status
                                ] ||
                                    order.status}
                            </span>

                        </div>

                        <div className="admin-order-customer">

                            <strong>
                                {
                                    order.customer
                                        ?.name
                                }
                            </strong>

                            <span>
                                {
                                    order.customer
                                        ?.phone
                                }
                            </span>

                        </div>

                        <div className="admin-order-items">

                            {order.items?.map(
                                (item, index) => (
                                    <div
                                        className="admin-order-item"
                                        key={index}
                                    >
                                        <span>
                                            {
                                                item.name
                                            }{" "}
                                            ×{" "}
                                            {
                                                item.quantity
                                            }
                                        </span>

                                        <strong>
                                            Rp{" "}
                                            {item.subtotal?.toLocaleString(
                                                "id-ID"
                                            )}
                                        </strong>
                                    </div>
                                )
                            )}

                        </div>

                        <div className="admin-order-info">

                            <div>
                                <span>
                                    Jenis
                                </span>

                                <strong>
                                    {order.orderType ===
                                    "delivery"
                                        ? "Delivery"
                                        : "Takeaway"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Pembayaran
                                </span>

                                <strong>
                                    {
                                        paymentLabels[
                                            order
                                                .paymentMethod
                                        ]
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Total
                                </span>

                                <strong>
                                    Rp{" "}
                                    {order.total?.toLocaleString(
                                        "id-ID"
                                    )}
                                </strong>
                            </div>

                        </div>

                        {order.orderType ===
                            "delivery" &&
                            order.deliveryAddress && (
                                <div className="admin-order-address">
                                    <span>
                                        Alamat Pengiriman
                                    </span>

                                    <p>
                                        {
                                            order.deliveryAddress
                                        }
                                    </p>
                                </div>
                            )}

                            {expandedOrderId === order._id && (
    <div className="admin-order-detail">

        <div className="admin-order-detail-section">
            <span className="admin-detail-label">
                INFORMASI PELANGGAN
            </span>

            <div className="admin-detail-grid">
                <div>
                    <span>Nama</span>
                    <strong>
                        {order.customer?.name || "-"}
                    </strong>
                </div>

                <div>
                    <span>Nomor HP</span>
                    <strong>
                        {order.customer?.phone || "-"}
                    </strong>
                </div>
            </div>
        </div>

        <div className="admin-order-detail-section">
            <span className="admin-detail-label">
                INFORMASI PESANAN
            </span>

            <div className="admin-detail-grid">
                <div>
                    <span>Nomor Pesanan</span>
                    <strong>
                        {order.orderNumber || "-"}
                    </strong>
                </div>

                <div>
                    <span>Jenis Pesanan</span>
                    <strong>
                        {order.orderType === "delivery"
                            ? "Delivery"
                            : "Takeaway"}
                    </strong>
                </div>

                <div>
                    <span>Pembayaran</span>
                    <strong>
                        {paymentLabels[
                            order.paymentMethod
                        ] || "-"}
                    </strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>
                        {statusLabels[
                            order.status
                        ] || order.status}
                    </strong>
                </div>
            </div>
        </div>

        {order.orderType === "delivery" && (
            <div className="admin-order-detail-section">
                <span className="admin-detail-label">
                    ALAMAT PENGIRIMAN
                </span>

                <div className="admin-detail-address">
                    {order.deliveryAddress || "-"}
                </div>
            </div>
        )}

        <div className="admin-order-detail-section">
    <span className="admin-detail-label">
        INFORMASI PEMBAYARAN
    </span>

    <div className="admin-detail-grid">
        <div>
            <span>Metode Pembayaran</span>
            <strong>
                {paymentLabels[order.paymentMethod] || "-"}
            </strong>
        </div>

        <div>
            <span>Status Pembayaran</span>
            <strong>
                {order.payment?.status || "-"}
            </strong>
        </div>

        <div>
            <span>Nominal</span>
            <strong>
                Rp{" "}
                {Number(
                    order.payment?.amount ||
                        order.total ||
                        0
                ).toLocaleString("id-ID")}
            </strong>
        </div>
    </div>

    {order.payment?.rejectionReason && (
        <div className="admin-payment-rejection">
            <span>Alasan Penolakan</span>
            <strong>
                {order.payment.rejectionReason}
            </strong>
        </div>
    )}

    {order.payment?.proofImage && (
        <div className="admin-payment-proof">
            <span className="admin-detail-label">
                BUKTI PEMBAYARAN
            </span>

            <img
                src={`http://localhost:5000/uploads/payments/${order.payment.proofImage}`}
                alt="Bukti pembayaran"
            />
        </div>
    )}
</div>

        <div className="admin-order-detail-section">
            <span className="admin-detail-label">
                DETAIL ITEM
            </span>

            <div className="admin-detail-items">
                {order.items?.map((item, index) => (
                    <div
                        className="admin-detail-item"
                        key={
                            item._id ||
                            item.menuId ||
                            index
                        }
                    >
                        <div>
                            <strong>
                                {item.name}
                            </strong>

                            <span>
                                {item.quantity} ×{" "}
                                Rp{" "}
                                {Number(
                                    item.price || 0
                                ).toLocaleString(
                                    "id-ID"
                                )}
                            </span>
                        </div>

                        <strong>
                            Rp{" "}
                            {Number(
                                item.subtotal ||
                                    item.price *
                                        item.quantity
                            ).toLocaleString(
                                "id-ID"
                            )}
                        </strong>
                    </div>
                ))}
            </div>

            <div className="admin-detail-total">
                <span>Total</span>

                <strong>
                    Rp{" "}
                    {Number(
                        order.total || 0
                    ).toLocaleString("id-ID")}
                </strong>
            </div>
        </div>

    </div>
)}
                        
{order.courierProofImage && (
    <div className="admin-order-proof">
        <span>Bukti Serah Terima Kurir</span>

        <a
            href={`http://localhost:5000/uploads/orders/${order.courierProofImage}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            <img
                src={`http://localhost:5000/uploads/orders/${order.courierProofImage}`}
                alt="Bukti serah terima kurir"
                className="admin-order-proof-image"
            />
        </a>

        <small>
            Klik gambar untuk melihat ukuran penuh
        </small>
    </div>
)}

{order.deliveryProofImage && (
    <div className="admin-order-proof">
        <span>Bukti Pesanan Diterima</span>

        <a
            href={`http://localhost:5000/uploads/orders/${order.deliveryProofImage}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            <img
                src={`http://localhost:5000/uploads/orders/${order.deliveryProofImage}`}
                alt="Bukti pesanan diterima"
                className="admin-order-proof-image"
            />
        </a>

        <small>
            Klik gambar untuk melihat ukuran penuh
        </small>
    </div>
)}

                        <div className="admin-order-actions">
                            <button
                                type="button"
                                className="admin-action-button"
                                onClick={() => 
                                    toggleOrderDetail(order._id)
                                }
                            >
                                {expandedOrderId === order._id
                                    ? "▲ Tutup Detail"
                                    : "▼ Lihat Detail"
                                }
                            </button>
                            {order.status === "ready_for_delivery" && (
                                <div className="courier-delivery-action">

                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (!file) return;

                                            setCourierFiles((current) => ({
                                                ...current,
                                                [order._id] : file,
                                            }));
                                        }}/>

                                        <button
                                            className="admin-action-button"
                                            disabled={
                                                processingCourierId === order._id
                                            }
                                            onClick={() =>
                                                handleCourierDelivery(order._id)
                                            }
                                            >
                                                {processingCourierId === order._id
                                                    ? "Mengirim..."
                                                    : "Serahkan ke Kurir"}
                                            </button>
                                </div>
                            )}

                            {order.status === "ready_for_pickup" && (
    <div className="courier-delivery-action">

        <input
            type="file"
            accept="image/*"
            onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                setPickupFiles((current) => ({
                    ...current,
                    [order._id]: file,
                }));
            }}
        />

        <button
            className="admin-action-button"
            disabled={
                processingPickupId === order._id
            }
            onClick={() =>
                handlePickupCompleted(order)
            }
        >
            {processingPickupId === order._id
                ? "Mengirim..."
                : "✓ Selesaikan Pickup"}
        </button>

    </div>
)}

                            {order.status === "out_for_delivery" && (
                                <div className="courier-delivery-action">

        <input
            type="file"
            accept="image/*"
            onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                setDeliveryFiles((current) => ({
                    ...current,
                    [order._id]: file,
                }));
            }}
        />

        <button
            className="admin-action-button"
            disabled={
                processingDeliveryId === order._id
            }
            onClick={() =>
                handleDeliveryCompleted(order._id)
            }
        >
            {processingDeliveryId === order._id
                ? "Mengirim..."
                : "✓ Pesanan Diterima"}
        </button>

    </div>
)}

{(
    order.status === "payment_verified" ||
    (
        order.status === "waiting_payment" &&
        order.orderType === "takeaway" &&
        order.paymentMethod === "cash"
    )
) && (
    <button
        className="admin-action-button"
        disabled={
            processingId === order._id
        }
        onClick={() =>
            processOrder(order)
        }
    >
        {processingId === order._id
            ? "Memproses..."
            : "▶ Mulai Proses"}
    </button>
)}

                            {order.status ===
                                "processing" && (
                                <button
                                    className="admin-action-button"
                                    disabled={
                                        processingId ===
                                        order._id
                                    }
                                    onClick={() =>
                                        readyOrder(
                                            order
                                        )
                                    }
                                >
                                    {processingId ===
                                    order._id
                                        ? "Memproses..."
                                        : order.orderType ===
                                          "takeaway"
                                        ? "✓ Siap Diambil"
                                        : "✓ Siap Dikirim"}
                                </button>
                            )}

                            {[
                                "waiting_payment",
                                "payment_submitted",
                                "payment_rejected",
                                "payment_verified",
                                "processing",
                                "ready_for_pickup",
                                "ready_for_delivery",
                            ].includes(
                                order.status
                            ) && (
                                <button
                                    className="admin-cancel-button"
                                    disabled={
                                        processingId ===
                                        order._id
                                    }
                                    onClick={() =>
                                        cancelOrder(
                                            order
                                        )
                                    }
                                >
                                    Batalkan
                                </button>
                            )}

                        </div>

                    </div>
                ))}

            </div>
        </div>
    );
}

export default AdminOrders;
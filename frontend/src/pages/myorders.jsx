import { useEffect, useState } from "react";
import "../css/myorders.css";

function MyOrders({ onBack, onPayment }) {
    const [orders, setOrders] = useState([]);
    
    const [activeFilter, setActiveFilter] = useState("all");
    
    const [loading, setLoading] = useState(true);
    const [statusNotification, setStatusNotification] = useState("");

    const [deliveryFiles, setDeliveryFiles] = useState({});
    const [uploadingdeliveryId, setUploadingdeliveryId] = useState(null);
    
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Silakan login terlebih dahulu.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/orders/my-orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal mengambil pesanan."
                );
            }

            const newOrders = result.data || [];

            setOrders((previousOrders) => {
                if (previousOrders.length > 0) {
                    const changedOrder = newOrders.find((newOrder) => {
                        const oldOrder = previousOrders.find(
                            (order) => order._id === newOrder._id
                        );

                        return (
                            oldOrder &&
                            oldOrder.status !== newOrder.status
                        );
                    });

                    if(changedOrder) {
                        setStatusNotification(
                            `Status pesanan ${changedOrder.orderNumber} berubah menjadi " ${getStatusText(
                                changedOrder.status
                            )}".`
                        );
                    }
                }

                return newOrders;
            });

            setError("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(() => {
            fetchOrders();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusText = (status) => {
        const statusMap = {
            waiting_payment: "Menunggu Pembayaran",
            payment_submitted: "Menunggu Verifikasi",
            payment_verified: "Pembayaran Terverifikasi",
            payment_rejected: "Pembayaran Ditolak",
            processing: "Sedang Diproses",
            ready_for_pickup: "Siap Diambil",
            ready_for_delivery: "Siap Dikirim",
            out_for_delivery: "Dalam Perjalanan",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };

        return statusMap[status] || status;
    };

    const getOrderTypeText = (type) => {
        return type === "delivery"
            ? "🛵 Delivery"
            : "🥡 Takeaway";
    };

    const getPaymentText = (method) => {
        return method === "bank_transfer"
            ? "🏦 Bank Transfer"
            : "💵 Cash";
    };

    const getOrderSteps = (order) => {
        if (order.orderType === "delivery") {
            return [
                {
                    key: "payment",
                    label: "Pembayaran",
                    statuses: [
                        "payment_submitted",
                        "payment_verified",
                        "processing",
                        "ready_for_delivery",
                        "out_for_delivery",
                        "completed",
                    ],
                },
                {
                    key: "ready",
                    label: "Siap Dikirim",
                    statuses: [
                        "ready_for_delivery",
                        "out_for_delivery",
                        "completed",
                    ],
                },
                {
                    key: "delivery",
                    label: "Dalam Perjalanan",
                    statuses: [
                        "out_for_delivery",
                        "completed",
                    ],
                },
                {
                    key: "completed",
                    label: "Selesai",
                    statuses: ["completed"],
                },
            ];
        }

        return [
            {
                key: "payment",
                label: "Pembayaran",
                statuses: [
                    "payment_submitted",
                    "payment_verified",
                    "processing",
                    "ready_for_pickup",
                    "completed",
                ],
            },
            {
                key: "processing",
                label: "Diproses",
                statuses: [
                    "processing",
                    "ready_for_pickup",
                    "completed",
                ],
            },
            {
                key: "ready",
                label: "Siap Diambil",
                statuses: [
                    "ready_for_pickup",
                    "completed",
                ],
            },
            {
                key: "completed",
                label: "Selesai",
                statuses: ["completed"],
            },
        ];
    };

    const getStepState = (step, order) => {
        if (order.status === "payment_rejected") {
            return "rejected";
        }

        if (order.status === "cancelled") {
            return "cancelled";
        }

        if (order.status === "waiting_payment") {
            return step.key === "payment"
                ? "current"
                : "upcoming";
        }

        if (step.statuses.includes(order.status)) {
            return "current";
        }

        const steps = getOrderSteps(order);

        const currentIndex = steps.findIndex(
            (item) => item.statuses.includes(order.status)
        );

        const stepIndex = steps.findIndex(
            (item) => item.key === step.key
        );

        if (
            currentIndex !== -1 &&
            stepIndex < currentIndex
        ) {
            return "completed";
        }

        return "upcoming";
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
            setUploadingdeliveryId(orderId);

            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("deliveryProofImage", file);

            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}/delivery-proof`,
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
                        "Gagal mengonfirmasi pesanan."
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
                    "Pesanan berhasil dikonfirmasi."
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setUploadingdeliveryId(null);
        }
    };

    const cancelOrder = async (order) => {
        const confirmed = window.confirm(
            `Yakin ingin membatalkan pesanan ${order.orderNumber}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/orders/${order._id}/cancel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Gagal membatalkan pesanan."
                );
            }

            await fetchOrders();

            alert(
                result.message ||
                    "Pesanan berhasil dibatalkan."
            );
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="my-orders-page">
                <h2>Pesanan Saya</h2>
                <p>Memuat pesanan...</p>
            </div>
        );
    }

    const filteredOrders =
    activeFilter === "all"
        ? orders
        : orders.filter((order) => {
              if (activeFilter === "waiting") {
                  return [
                      "waiting_payment",
                      "payment_submitted",
                      "payment_rejected",
                  ].includes(order.status);
              }

              if (activeFilter === "processing") {
                  return [
                      "payment_verified",
                      "processing",
                      "ready_for_pickup",
                      "ready_for_delivery",
                      "out_for_delivery",
                  ].includes(order.status);
              }

              if (activeFilter === "completed") {
                  return order.status === "completed";
              }

              if (activeFilter === "cancelled") {
                  return order.status === "cancelled";
              }

              return true;
          });

    return (
        <div className="my-orders-page">
            <div className="my-orders-header">
                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ← Kembali
                </button>

                <h2>Pesanan Saya</h2>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {statusNotification && (
                <div className="status-notification">
                    <span>🔔</span>

                    <div>
                        <strong>Status Pesanan Berubah</strong>
                        <p>{statusNotification}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setStatusNotification("")}
                    >
                            x
                        </button>
                </div>
            )}

            {!error && orders.length === 0 && (
                <div className="empty-orders">
                    <h3>Belum ada pesanan</h3>
                    <p>
                        Pesanan yang kamu buat akan muncul
                        di sini.
                    </p>
                </div>
            )}
            
            <div className="order-filters">
    <button
        type="button"
        className={
            activeFilter === "all"
                ? "active"
                : ""
        }
        onClick={() => setActiveFilter("all")}
    >
        Semua
    </button>

    <button
        type="button"
        className={
            activeFilter === "waiting"
                ? "active"
                : ""
        }
        onClick={() => setActiveFilter("waiting")}
    >
        Menunggu
    </button>

    <button
        type="button"
        className={
            activeFilter === "processing"
                ? "active"
                : ""
        }
        onClick={() =>
            setActiveFilter("processing")
        }
    >
        Diproses
    </button>

    <button
        type="button"
        className={
            activeFilter === "completed"
                ? "active"
                : ""
        }
        onClick={() =>
            setActiveFilter("completed")
        }
    >
        Selesai
    </button>

    <button
        type="button"
        className={
            activeFilter === "cancelled"
                ? "active"
                : ""
        }
        onClick={() =>
            setActiveFilter("cancelled")
        }
    >
        Dibatalkan
    </button>
</div>



            <div className="orders-list">
                {filteredOrders.map((order) => {
                    const steps = getOrderSteps(order);

                    return (
                        <div
                            className="order-card"
                            key={order._id}
                        >
                            <div className="order-header">
                                <div>
                                    <h3>
                                        {order.orderNumber}
                                    </h3>

                                    <p>
                                        {order.createdAt
                                            ? new Date(
                                                  order.createdAt
                                              ).toLocaleString(
                                                  "id-ID"
                                              )
                                            : "-"}
                                    </p>
                                </div>

                                <span
                                    className={`order-status status-${order.status}`}
                                >
                                    {getStatusText(
                                        order.status
                                    )}
                                </span>
                            </div>

                            <div className="order-info">
                                <p>
                                    <strong>Tipe:</strong>{" "}
                                    {getOrderTypeText(
                                        order.orderType
                                    )}
                                </p>

                                <p>
                                    <strong>Pembayaran:</strong>{" "}
                                    {getPaymentText(
                                        order.paymentMethod
                                    )}
                                </p>

                                {order.orderType ===
                                    "delivery" &&
                                    order.deliveryAddress && (
                                        <p>
                                            <strong>
                                                Alamat:
                                            </strong>{" "}
                                            {
                                                order.deliveryAddress
                                            }
                                        </p>
                                    )}
                            </div>

                            <div className="order-items">
                                <h4>Pesanan</h4>

                                {order.items?.map(
                                    (item, index) => (
                                        <div
                                            className="order-item"
                                            key={
                                                item.menuId ||
                                                index
                                            }
                                        >
                                            <div>
                                                <span>
                                                    {
                                                        item.name
                                                    }
                                                </span>

                                                <small>
                                                    {item.quantity}{" "}
                                                    × Rp{" "}
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString(
                                                        "id-ID"
                                                    )}
                                                </small>
                                            </div>

                                            <strong>
                                                Rp{" "}
                                                {Number(
                                                    item.subtotal
                                                ).toLocaleString(
                                                    "id-ID"
                                                )}
                                            </strong>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="order-total">
                                <span>Total</span>

                                <strong>
                                    Rp{" "}
                                    {Number(
                                        order.totalAmount ||
                                            order.total ||
                                            0
                                    ).toLocaleString(
                                        "id-ID"
                                    )}
                                </strong>
                            </div>

                            {order.status ===
                                "payment_rejected" &&
                                order.paymentInfo
                                    ?.rejectionReason && (
                                    <div className="payment-rejected-message">
                                        <strong>
                                            Alasan pembayaran
                                            ditolak:
                                        </strong>

                                        <p>
                                            {
                                                order
                                                    .paymentInfo
                                                    .rejectionReason
                                            }
                                        </p>
                                    </div>
                                )}

                            <div className="order-tracking">
                                <h4>
                                    Status Pesanan
                                </h4>

                                <div className="tracking-steps">
                                    {steps.map(
                                        (
                                            step,
                                            index
                                        ) => {
                                            const state =
                                                getStepState(
                                                    step,
                                                    order
                                                );

                                            return (
                                                <div
                                                    className={`tracking-step ${state}`}
                                                    key={
                                                        step.key
                                                    }
                                                >
                                                    <div className="tracking-circle">
                                                        {state ===
                                                        "completed"
                                                            ? "✓"
                                                            : state ===
                                                              "rejected"
                                                            ? "!"
                                                            : state ===
                                                              "cancelled"
                                                            ? "×"
                                                            : index +
                                                                  1}
                                                    </div>

                                                    <span>
                                                        {
                                                            step.label
                                                        }
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>

                            {order.status ===
                                "waiting_payment" &&
                                order.paymentMethod ===
                                    "bank_transfer" && (
                                    <div className="order-action">
                                        <p>
                                            Silakan lakukan
                                            pembayaran lalu
                                            upload bukti
                                            pembayaran.
                                        </p>

                                        <button
                                            className="admin-action-button"
                                            onClick={() =>
                                                onPayment(
                                                    order
                                                )
                                            }
                                        >
                                            Upload Bukti
                                            Pembayaran
                                        </button>
                                    </div>
                                )}

                            {order.status ===
                                "payment_rejected" &&
                                order.paymentMethod ===
                                    "bank_transfer" && (
                                    <div className="order-action">
                                        <p>
                                            Bukti pembayaran
                                            kamu ditolak.
                                            Silakan upload
                                            bukti pembayaran
                                            yang benar.
                                        </p>

                                        <button
                                            className="admin-action-button"
                                            onClick={() =>
                                                onPayment(
                                                    order
                                                )
                                            }
                                        >
                                            Upload Ulang
                                            Bukti Pembayaran
                                        </button>
                                    </div>
                                )}

                            {[
                                "waiting_payment",
                                "payment_submitted",
                                "payment_rejected",
                            ].includes(
                                order.status
                            ) && (
                                <div className="order-action">
                                    <button
                                        className="admin-cancel-button"
                                        onClick={() =>
                                            cancelOrder(
                                                order
                                            )
                                        }
                                    >
                                        Batalkan Pesanan
                                    </button>
                                </div>
                            )}

                            {order.status ===
                                "out_for_delivery" && (
                                <div className="delivery-confirmation">
                                    <h4>
                                        Pesanan Sudah
                                        Diterima?
                                    </h4>

                                    <p>
                                        Upload foto sebagai
                                        bukti bahwa pesanan
                                        sudah kamu terima.
                                    </p>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file =
                                                e.target
                                                    .files?.[0];

                                            if (!file) {
                                                return;
                                            }

                                            setDeliveryFiles(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    [order._id]:
                                                        file,
                                                })
                                            );
                                        }}
                                    />

                                    <button
                                        className="admin-action-button"
                                        disabled={
                                            uploadingdeliveryId ===
                                            order._id
                                        }
                                        onClick={() =>
                                            handleDeliveryCompleted(
                                                order._id
                                            )
                                        }
                                    >
                                        {uploadingdeliveryId ===
                                        order._id
                                            ? "Mengirim..."
                                            : "Konfirmasi Pesanan Diterima"}
                                    </button>
                                </div>
                            )}

                            {order.status ===
                                "completed" && (
                                <div className="completed-message">
                                    <strong>
                                        ✓ Pesanan Selesai
                                    </strong>

                                    <p>
                                        Terima kasih sudah
                                        memesan di Resto Bang
                                        Bah.
                                    </p>
                                </div>
                            )}

                            {order.status ===
                                "cancelled" && (
                                <div className="cancelled-message">
                                    <strong>
                                        ✕ Pesanan Dibatalkan
                                    </strong>

                                    <p>
                                        Pesanan ini sudah
                                        dibatalkan.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MyOrders;
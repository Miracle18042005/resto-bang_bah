import { useEffect, useState } from "react";
import "../css/OrderDetails.css";

function OrderDetail({ orderId, onBack }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deliveryProof, setDeliveryProof] = useState(null);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofMessage, setProofMessage] = useState("");

    const [cancelling, setCancelling] = useState(false);
    const [cancelMessage, setCancelMessage] = useState("");

    const fetchOrder = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal mengambil detail pesanan."
                );
            }

            setOrder(data.order || data);
        } catch (err) {
            setError(err.message);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const handleDeliveryProof = async () => {
        if (!deliveryProof) {
            setProofMessage("Silahkan pilih foto terlebih dahulu.");
            return;
        }

        try {
            setUploadingProof(true);
            setProofMessage("");

            const token = localStorage.getItem("token");

            const formData = new FornData();

            formData.append(
                "deliveryProofImage",
                deliveryProof
            );

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

            const data =  await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Gagal mengirim bukti penerimaan"
                );
            }

            setProofMessage(
                "Bukti penerimaan berhasil dikirim"
            );

            setDeliveryProof(null);

            await fetchOrder(false);
        } catch (err) {
            setProofMessage(err.message);
        } finally {
            setUploadingProof(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;

        fetchOrder(true);

        // Refresh status setiap 5 detik
        const interval = setInterval(() => {
            fetchOrder(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [orderId]);

    const formatPrice = (price) => {
        return `Rp ${Number(price || 0).toLocaleString("id-ID")}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getStatusText = (status) => {
        const statusMap = {
            waiting_payment: "Menunggu Pembayaran",
            payment_submitted: "Menunggu Verifikasi",
            payment_verified: "Pembayaran Terverifikasi",
            payment_rejected: "Pembayaran Ditolak",
            processing: "Sedang Diproses",
            ready_for_pickup: "Siap Diambil",
            ready_for_delivery: "Siap Dikirim",
            out_for_delivery: "Sedang Diantar",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };

        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "completed":
                return "status-success";

            case "cancelled":
            case "payment_rejected":
                return "status-danger";

            case "payment_verified":
                return "status-verified";

            case "processing":
            case "ready_for_pickup":
            case "ready_for_delivery":
            case "out_for_delivery":
                return "status-process";

            default:
                return "status-waiting";
        }
    };

    const getOrderTypeText = (type) => {
        if (type === "delivery") {
            return "Delivery";
        }

        if (type === "takeaway") {
            return "Ambil Sendiri";
        }

        return type || "-";
    };

    const getPaymentText = (method) => {
        if (method === "bank_transfer") {
            return "Bank Transfer";
        }

        if (method === "cash") {
            return "Cash";
        }

        return method || "-";
    };

    /*
     * TRACKING PESANAN
     *
     * Urutannya mengikuti workflow backend kita.
     */
    const trackingSteps = [
        {
            status: "waiting_payment",
            title: "Pesanan Dibuat",
            description: "Pesanan berhasil dibuat.",
        },
        {
            status: "payment_submitted",
            title: "Pembayaran Dikirim",
            description: "Bukti pembayaran sedang menunggu verifikasi.",
        },
        {
            status: "payment_verified",
            title: "Pembayaran Terverifikasi",
            description: "Pembayaran sudah dikonfirmasi.",
        },
        {
            status: "processing",
            title: "Pesanan Diproses",
            description: "Pesanan sedang disiapkan.",
        },
        {
            status:
                order?.orderType === "delivery"
                    ? "ready_for_delivery"
                    : "ready_for_pickup",
            title:
                order?.orderType === "delivery"
                    ? "Siap Dikirim"
                    : "Siap Diambil",
            description:
                order?.orderType === "delivery"
                    ? "Pesanan siap diserahkan kepada kurir."
                    : "Pesanan siap diambil.",
        },
        ...(order?.orderType === "delivery"
            ? [
                  {
                      status: "out_for_delivery",
                      title: "Sedang Diantar",
                      description: "Pesanan sedang dalam perjalanan.",
                  },
              ]
            : []),
        {
            status: "completed",
            title: "Pesanan Selesai",
            description: "Pesanan sudah selesai.",
        },
    ];

    const getTrackingIndex = () => {
        if (!order) return -1;

        if (order.status === "cancelled") {
            return -1;
        }

        if (order.status === "payment_rejected") {
            return 1;
        }

        const index = trackingSteps.findIndex(
            (step) => step.status === order.status
        );

        return index;
    };

    const currentTrackingIndex = getTrackingIndex();

    const isStepCompleted = (index) => {
        if (order?.status === "cancelled") {
            return false;
        }

        if (order?.status === "payment_rejected") {
            return index === 0;
        }

        return index <= currentTrackingIndex;
    };

    if (loading) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-error">
                    <div className="error-icon">!</div>

                    <h2>Gagal Memuat Pesanan</h2>

                    <p>{error}</p>

                    <button onClick={onBack}>
                        Kembali ke Pesanan Saya
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-page">
                <div className="order-detail-error">
                    <div className="error-icon">!</div>

                    <h2>Pesanan Tidak Ditemukan</h2>

                    <button onClick={onBack}>Kembali</button>
                </div>
            </div>
        );
    }

    const handleCancelOrder = async () => {
        const confirmed = window.confirm(
            "Yakin ingin membatalkan pesanan ini?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancelling(true);
            setCancelMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}/cancel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Gagal membatalkan pesanan"
                );
            }

            setCancelMessage(
                "Pesanan berhasil dibatalkan"
            );

            await fetchOrder(false);
        } catch (err) {
            setCancelMessage (err.message);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="order-detail-page">
            <div className="order-detail-container">

                {/* HEADER */}
                <div className="order-detail-header">
                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ← Kembali
                    </button>

                    <div className="order-detail-title">
                        <span>DETAIL PESANAN</span>

                        <h1>Pesanan Kamu</h1>
                    </div>
                </div>

                {/* ORDER SUMMARY */}
                <div className="order-detail-card order-summary-card">
                    <div className="order-summary-top">
                        <div>
                            <span className="detail-label">
                                Nomor Pesanan
                            </span>

                            <h2>
                                {order.orderNumber || "-"}
                            </h2>
                        </div>

                        <span
                            className={`order-status ${getStatusClass(
                                order.status
                            )}`}
                        >
                            {getStatusText(order.status)}
                        </span>
                    </div>

                    <div className="order-date">
                        Dibuat pada {formatDate(order.createdAt)}
                    </div>
                </div>

                {/* TRACKING */}
                <div className="order-detail-card">
                    <div className="card-heading">
                        <span>TRACKING PESANAN</span>
                        <h2>Perjalanan Pesanan</h2>
                    </div>

                    {order.status === "cancelled" ? (
                        <div className="tracking-special tracking-cancelled">
                            <div className="tracking-special-icon">
                                ×
                            </div>

                            <div>
                                <strong>Pesanan Dibatalkan</strong>
                                <p>
                                    Pesanan ini sudah dibatalkan.
                                </p>
                            </div>
                        </div>
                    ) : order.status === "payment_rejected" ? (
                        <div className="tracking-special tracking-rejected">
                            <div className="tracking-special-icon">
                                !
                            </div>

                            <div>
                                <strong>
                                    Pembayaran Ditolak
                                </strong>

                                <p>
                                    {order.payment
                                        ?.rejectionReason ||
                                        "Pembayaran perlu diperiksa kembali."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="order-tracking">
                            {trackingSteps.map(
                                (step, index) => {
                                    const completed =
                                        isStepCompleted(index);

                                    const current =
                                        index ===
                                        currentTrackingIndex;

                                    return (
                                        <div
                                            className={`tracking-step ${
                                                completed
                                                    ? "completed"
                                                    : ""
                                            } ${
                                                current
                                                    ? "current"
                                                    : ""
                                            }`}
                                            key={`${step.status}-${index}`}
                                        >
                                            <div className="tracking-line-wrapper">
                                                <div className="tracking-dot">
                                                    {completed
                                                        ? "✓"
                                                        : index + 1}
                                                </div>

                                                {index <
                                                    trackingSteps.length -
                                                        1 && (
                                                    <div
                                                        className={`tracking-line ${
                                                            index <
                                                            currentTrackingIndex
                                                                ? "completed"
                                                                : ""
                                                        }`}
                                                    />
                                                )}
                                            </div>

                                            <div className="tracking-content">
                                                <strong>
                                                    {step.title}
                                                </strong>

                                                <p>
                                                    {
                                                        step.description
                                                    }
                                                </p>

                                                {current && (
                                                    <span className="tracking-current">
                                                        Status saat ini
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}

                    <div className="tracking-refresh-info">
                        Status pesanan diperbarui otomatis.
                    </div>
                </div>

                {/* CUSTOMER */}
                <div className="order-detail-card">
                    <div className="card-heading">
                        <span>DATA PEMESAN</span>
                        <h2>Informasi Pelanggan</h2>
                    </div>

                    <div className="customer-info">
                        <div className="info-item">
                            <span>Nama</span>

                            <strong>
                                {order.customer?.name || "-"}
                            </strong>
                        </div>

                        <div className="info-item">
                            <span>Nomor HP</span>

                            <strong>
                                {order.customer?.phone || "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* ORDER INFORMATION */}
                <div className="order-detail-card">
                    <div className="card-heading">
                        <span>INFORMASI PESANAN</span>
                        <h2>Detail Pengiriman</h2>
                    </div>

                    <div className="order-info-grid">
                        <div className="info-item">
                            <span>Jenis Pesanan</span>

                            <strong>
                                {getOrderTypeText(
                                    order.orderType
                                )}
                            </strong>
                        </div>

                        <div className="info-item">
                            <span>Metode Pembayaran</span>

                            <strong>
                                {getPaymentText(
                                    order.paymentMethod
                                )}
                            </strong>
                        </div>

                        {order.orderType === "delivery" && (
                            <div className="info-item info-address">
                                <span>
                                    Alamat Pengiriman
                                </span>

                                <strong>
                                    {order.deliveryAddress ||
                                        "-"}
                                </strong>
                            </div>
                        )}
                    </div>
                </div>

                {/* ITEMS */}
                <div className="order-detail-card">
                    <div className="card-heading">
                        <span>ITEM PESANAN</span>
                        <h2>Pesanan Kamu</h2>
                    </div>

                    <div className="detail-items">
                        {order.items?.map(
                            (item, index) => (
                                <div
                                    className="detail-item"
                                    key={
                                        item._id ||
                                        item.menuId ||
                                        index
                                    }
                                >
                                    <div className="detail-item-left">
                                        <div className="item-quantity">
                                            {item.quantity}x
                                        </div>

                                        <div>
                                            <h3>
                                                {item.name}
                                            </h3>

                                            <p>
                                                {formatPrice(
                                                    item.price
                                                )}{" "}
                                                / item
                                            </p>
                                        </div>
                                    </div>

                                    <strong>
                                        {formatPrice(
                                            item.subtotal ??
                                                item.price *
                                                    item.quantity
                                        )}
                                    </strong>
                                </div>
                            )
                        )}
                    </div>

                    <div className="detail-total">
                        <span>Total Pesanan</span>

                        <strong>
                            {formatPrice(order.total)}
                        </strong>
                    </div>
                </div>

                {/* PAYMENT */}
                {order.payment && (
                    <div className="order-detail-card">
                        <div className="card-heading">
                            <span>PEMBAYARAN</span>
                            <h2>Informasi Pembayaran</h2>
                        </div>

                        <div className="payment-detail">
                            <div className="info-item">
                                <span>Metode</span>

                                <strong>
                                    {getPaymentText(
                                        order.payment.method
                                    )}
                                </strong>
                            </div>

                            <div className="info-item">
                                <span>Status</span>

                                <strong>
                                    {order.payment.status ||
                                        "-"}
                                </strong>
                            </div>

                            {order.payment.amount !==
                                undefined && (
                                <div className="info-item">
                                    <span>Jumlah</span>

                                    <strong>
                                        {formatPrice(
                                            order.payment.amount
                                        )}
                                    </strong>
                                </div>
                            )}
                        </div>

                        {order.payment.rejectionReason && (
                            <div className="rejection-box">
                                <strong>
                                    Alasan Penolakan
                                </strong>

                                <p>
                                    {
                                        order.payment
                                            .rejectionReason
                                    }
                                </p>
                            </div>
                        )}

                        {order.payment.proofImage && (
                            <div className="proof-section">
                                <span>
                                    Bukti Pembayaran
                                </span>

                                <img
                                    src={`http://localhost:5000/uploads/payments/${order.payment.proofImage}`}
                                    alt="Bukti pembayaran"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* PROOFS */}
                {(order.pickupProofImage ||
                    order.courierProofImage ||
                    order.deliveryProofImage) && (
                    <div className="order-detail-card">
                        <div className="card-heading">
                            <span>BUKTI PESANAN</span>
                            <h2>Dokumentasi Pesanan</h2>
                        </div>

                        <div className="proof-grid">
                            {order.pickupProofImage && (
                                <div className="proof-card">
                                    <span>
                                        Bukti Pengambilan
                                    </span>

                                    <img
                                        src={`http://localhost:5000/uploads/pickups/${order.pickupProofImage}`}
                                        alt="Bukti pengambilan"
                                    />
                                </div>
                            )}

                            {order.courierProofImage && (
                                <div className="proof-card">
                                    <span>
                                        Bukti Kurir
                                    </span>

                                    <img
                                        src={`http://localhost:5000/uploads/couriers/${order.courierProofImage}`}
                                        alt="Bukti kurir"
                                    />
                                </div>
                            )}

                            {order.deliveryProofImage && (
                                <div className="proof-card">
                                    <span>
                                        Bukti Pesanan Diterima
                                    </span>

                                    <img
                                        src={`http://localhost:5000/uploads/deliveries/${order.deliveryProofImage}`}
                                        alt="Bukti pesanan diterima"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CUSTOMER DELIVERY CONFIRMATION */}
                {order.orderType === "delivery" &&
                    order.status === "out_for_delivery" && (
                        <div className="order-detail-card">
                            <div className="card-heading">
                                <span>KONFIRMASI PESANAN</span>
                                <h2>Pesanan Sudah Diterima?</h2>
                            </div>

                            <p>
                                Jika pesanan sudah sampai, silahkan upload foto sebagai bukti bahwa pesanan sudah diterima
                            </p>

                            <div className="delivery-proof-upload">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => 
                                        setDeliveryProof(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                />
                                {deliveryProof && (
                                    <p>
                                        File dipilih:{""}
                                        <strong>
                                            {deliveryProof.name}
                                        </strong>
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={handleDeliveryProof}
                                    disabled={
                                        !deliveryProof || 
                                        uploadingProof
                                    }
                                >
                                    {uploadingProof
                                        ? "mengirim..."
                                        : "Konfirmasi Pesanan Diterima"
                                    }
                                </button>
                                {proofMessage && (
                                    <p>
                                        {proofMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAKEWAY INFORMATION */}
                    {order.orderType === "takeway" && 
                        order.status === "ready-for-pickup" && (
                            <div className="order-detail-card">
                                <div className="card-heading">
                                    <span>SIAP DIAMBIL</span>
                                    <h2>Pesanan Siap Diambil</h2>
                                </div>

                                <div className="tracking-special">
                                    <div className="tracking-special-icon">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            Pesanan kamu udah siap!
                                        </strong>

                                        <p>
                                            Silahkan datang ke Resto Bang Bah untuk mengambil pesanan.
                                        </p>
                                        <p>
                                            tunjukkan nomor pesanan berikut kepada pihak resto:
                                        </p>

                                        <strong>
                                            {order.orderNumber}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CUSTOMER CANCEL */}
                        {[
                            "paiting_payment",
                            "payment_submitted",
                            "payment_rejected",
                        ].includes(order.status) && (
                            <div className="order-detail-card">
                                <div className="card-heading">
                                    <span>AKSI PESANAN</span>
                                    <h2>Batalkan Pesanan</h2>
                                </div>

                                <p>
                                    Pesanan masih dapat dibatalkan karena belum mulai diproses oleh pihak Resto Bang Bah
                                </p>

                                <button
                                    type="button"
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                >
                                    {cancelling
                                        ? "Membatalkan..."
                                        : "Batalkan Pesanan"}
                                </button>

                                {cancelMessage && (
                                    <p>{cancelMessage}</p>
                                )}
                            </div>
                        )
                        }

                {/* FINAL MESSAGE */}
                {order.status === "completed" && (
                    <div className="order-message success-message">
                        <div>✓</div>

                        <div>
                            <strong>
                                Pesanan Selesai
                            </strong>

                            <p>
                                Terima kasih sudah memesan
                                di Resto Bang Bah.
                            </p>
                        </div>
                    </div>
                )}

                {order.status === "cancelled" && (
                    <div className="order-message cancelled-message">
                        <div>×</div>

                        <div>
                            <strong>
                                Pesanan Dibatalkan
                            </strong>

                            <p>
                                Pesanan ini sudah
                                dibatalkan.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderDetail;
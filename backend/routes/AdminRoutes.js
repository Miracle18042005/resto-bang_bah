const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const {
    uploadPickupProof,
    uploadCourierProof,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/orders", protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data order",
        });
    }
});

router.get("/orders/payment-submitted", protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find({
            status: "payment_submitted"
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil order payment submitted",
        });
    }
});

router.post("/payments/:id/verify", protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({
                success: false,
                message: "ID tidak valid",
            })
        }

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment tidak ditemukan",
            });
        }

        if (payment.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Payment sudah diproses sebelumnya",
            });
        }

        if (payment.method !== "bank_transfer") {
            return res.status(400).json({
                success: false,
                message: "Payment ini bukan bank transfer",
            });
        }

        const order = await Order.findById(payment.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        if (order.status !== "payment_submitted") {
            return res.status(400).json ({
                success: false,
                message: "Order tidak sedang menunggu verifikasi pembayaran ",
            });
        }

        payment.status = "verified";
        payment.verifiedBy = req.user.userId;
        payment.verifiedAt = new Date();

        await payment.save();

        order.status = "payment_verified";
        await order.save();

        res.json({
            success: true,
            message: "Pembayaran berhasil diverifikasi",
            data: {
                payment,
                order,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal memverifikasi pembayaran",
        });
    }
});

router.post("/payments/:id/reject", protect, adminOnly, async (req, res) => {
    try {

        const { reason } = req.body;

        if (!reason || reason.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Alasan penolakan wajib diisi",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid",
            });
        }

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment tidak ditemukan",
            });
        }

        if (payment.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Payment sudah diproses sebelumnya",
            });
        }
        
        if (payment.method !== "bank_transfer") {
            return res.status(400).json({
                success: false,
                message: "Payment ini bukan bank transfer",
            });
        }

        const order = await Order.findById(payment.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        if (order.status !== "payment_submitted") {
            return res.status(400).json ({
                success: false,
                message: "Order tidak sedang menunggu verifikasi pembayaran",
            });
        }

        payment.status = "rejected";
        payment.rejectionReason = reason.trim();
        payment.verifiedBy = req.user.userId;
        payment.verifiedAt = new Date();

        await payment.save();

        order.status = "payment_rejected";
        await order.save();

        res.json({
            success: true,
            message: "Pembayaran ditolak",
            data: {
                payment,
                order,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal menolak pembayaran",
        });
    }
});

router.get("/payments/pending", protect, adminOnly, async (req, res) => {
    try {
        const payments = await Payment.find({ status: "pending" })
            .populate("orderId")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil pembayaran pending"
        });
    }
});

router.post("/orders/:id/process", protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid",
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        const isCashTakeaway =
            order.orderType === "takeaway" &&
            order.paymentMethod === "cash";

        if (isCashTakeaway) {
            if (order.status !== "waiting_payment") {
                return res.status(400).json({
                    success: false,
                    message: "Order cash takeaway tidak berada pada status yang benar",
                });
            }
        } else {
            if (order.status !== "payment_verified") {
                return res.status(400).json({
                    success: false,
                    message: "Order belum memiliki pembayaran yang terverifikasi",
                });
            }

            const payment = await Payment.findOne({
                orderId: order._id,
            });

            if (!payment || payment.status !== "verified") {
                return res.status(400).json({
                    success: false,
                    message: "Pembayaran order belum terverifikasi",
                });
            }
        }

        order.status = "processing";
        await order.save();

        res.json({
            success: true,
            message: "Order mulai diproses",
            data: order,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal memproses order",
        });
    }
});

router.post("/orders/:id/ready", protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid",
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        if (order.status !== "processing") {
            return res.status(400).json({
                success: false,
                message: "Order belum sedang diproses",
            });
        }

        order.status = "ready_for_pickup";
        await order.save();

        res.json({
            success: true,
            message: "Order siap diambil",
            data: order,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengubah status order",
        });
    }
});

router.post("/orders/:id/ready-for-delivery", protect, adminOnly, async(req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid",
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json ({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        if (order.status !== "processing") {
            return res.status(400).json ({
                success: false,
                message: "Order belum sedang diproses",
            });
        }

        if (order.orderType !== "delivery") {
            return res.status(400).json({
                success:false,
                message: "Order takeaway tidak menggunakan status ready for delivery",
            });
        }

        if (order.paymentMethod !== "bank_transfer") {
            return res.status(400).json({
                success: false,
                message: "Order delivery wajib menggunakan bank transfer",
            });
        }

            const payment = await Payment.findOne({
            orderId: order._id,
        });

        if (!payment || payment.method !== "bank_transfer" || payment.status !== "verified") {
            return res.status(400).json({
                success: false,
                message: "Pembayaran delivery belum terverifikasi",
            });
        }

            order.status = "ready_for_delivery";
            await order.save();

            res.json({
                success:true,
                message: "Order siap untuk dikirim",
                data: order,
            });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success:false,
            message: "gagal mengubah status order",
        });
    }
});

router.post(
    "/orders/:id/out-for-delivery",
    protect,
    adminOnly,
    uploadCourierProof,
    async (req, res) => {
        try {
            const {id} = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID order tidak valid",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti serah terima courier wajib di upload",
                });
            }

            const order = await Order.findById(id);

            if(!order) {
                return res.status(400).json({
                    success: false,
                    message: "Order tidak ditemukan",
                });
            }

            if(order.orderType !== "delivery") {
                return res.status(400).json({
                    success:false,
                    message: "Order ini bukan delivery",
                });
            }

            if (order.status !== "ready_for_delivery") {
                return res.status(400).json({
                    success: false,
                    message: "Order belum siap untuk diserahkan ke kurir",
                });
            }

            const payment = await Payment.findOne({
                orderId: order._id,
            });

            if (!payment || payment.method !== "bank_transfer") {
                return res.status(400).json({
                    success: false,
                    message: "Payment delivery tidak ditemukan",
                });
            }

            if (payment.status !== "verified") {
                return res.status(400).json({
                    success:false,
                    message: "Pembayaran ini belum diverifikasi",
                });
            }

            if (order.courierProofImage) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti serah terima courier sudah diupload",
                });
            }

            order.courierProofImage = req.file.filename;
            order.status = "out_for_delivery";

            await order.save();

            res.json({
                success:true,
                message: "Order berhasil diserahkan kepada kurir",
                data: order,
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Gagal memproses serah terima kurir"
            });
        }
    }
);

router.post(
    "/orders/:id/pickup",
    protect,
    adminOnly,
    uploadPickupProof,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID order tidak valid",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti pickup wajib diupload",
                });
            }

            const order = await Order.findById(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order tidak ditemukan",
                });
            }

            if (order.orderType !== "takeaway") {
                return res.status(400).json({
                    success: false,
                    message: "Order ini bukan takeaway",
                });
            }

            if (order.paymentMethod !== "bank_transfer") {
                return res.status(400).json({
                    success: false,
                    message: "Endpoint ini khusus takeaway bank transfer",
                });
            }

            if (order.status !== "ready_for_pickup") {
                return res.status(400).json({
                    success: false,
                    message: "Order belum siap untuk pickup",
                });
            }

            const payment = await Payment.findOne({
                orderId: order._id,
            });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: "Data payment tidak ditemukan",
                });
            }

            if (payment.method !== "bank_transfer") {
                return res.status(400).json({
                    success: false,
                    message: "Metode payment order bukan bank transfer",
                });
            }

            if (payment.status !== "verified") {
                return res.status(400).json({
                    success: false,
                    message: "Pembayaran belum terverifikasi",
                });
            }

            if(order.pickupProofImage) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti pickup sudah diupload",
                });
            }

            order.pickupProofImage = req.file.filename;
            order.status = "completed";

            await order.save();

            res.json({
                success: true,
                message: "Pickup berhasil dikonfirmasi",
                data: order,
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Gagal mengonfirmasi pickup",
            });
        }
    }
);

router.post(
    "/orders/:id/cash-pickup",
    protect,
    adminOnly,
    uploadPickupProof,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID order tidak valid",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti pickup wajib diupload",
                });
            }

            const order = await Order.findById(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order tidak ditemukan",
                });
            }

            if (order.orderType !== "takeaway") {
                return res.status(400).json({
                    success: false,
                    message: "Order ini bukan takeaway",
                });
            }

            if (order.paymentMethod !== "cash") {
                return res.status(400).json({
                    success: false,
                    message: "Order ini bukan pembayaran cash",
                });
            }

            if (order.status !== "ready_for_pickup") {
                return res.status(400).json({
                    success: false,
                    message: "Order belum siap untuk pickup",
                });
            }

            let payment = await Payment.findOne({
                orderId: order._id,
            });

            if (order.pickupProofImage) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti pickup sudah di upload"
                })
            }
            
            // Untuk cash takeaway, payment dibuat
            // saat customer membayar di pickup.
            if (!payment) {
                payment = await Payment.create({
                    orderId: order._id,
                    amount: order.total,
                    method: "cash",
                    proofImage: null,
                    status: "verified",
                    verifiedBy: req.user.userId,
                    verifiedAt: new Date(),
                });
            } else {
                if (payment.method !== "cash") {
                    return res.status(400).json({
                        success: false,
                        message: "Metode payment order bukan cash",
                    });
                }

                if (payment.status === "verified") {
                    return res.status(400).json({
                        success: false,
                        message: "Pembayaran cash sudah dikonfirmasi",
                    });
                }

                payment.status = "verified";
                payment.verifiedBy = req.user.userId;
                payment.verifiedAt = new Date();

                await payment.save();
            }

            order.pickupProofImage = req.file.filename;
            order.status = "completed";

            await order.save();

            res.json({
                success: true,
                message: "Pembayaran cash dan pickup berhasil dikonfirmasi",
                data: {
                    order,
                    payment,
                },
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Gagal mengonfirmasi cash pickup",
            });
        }
    }
);

router.post("/orders/:id/cancel", protect, adminOnly, async(req,res) => {
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid",
            });
        }

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        const cancellableStatuses = [
            "waiting_payment",
            "payment_submitted",
            "payment_rejected",
            "payment_verified",
            "processing",
            "ready_for_pickup",
            "ready_for_delivery",
        ];

        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: "Order tidak dapat dibatalkan pada status ini",
            });
        }

        order.status = "cancelled";
        await order.save();

        res.json({
            success:true,
            message: "Order berhasil dibatalkan oleh admin",
            data: order,
        });
    } catch (error) {
        console.error(error) ;

        res.status(500).json({
            success: false,
            message: "Gagal membatalkan order",
        });
    }
});

module.exports = router;
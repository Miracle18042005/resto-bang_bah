const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");
const Menu = require("../models/menu");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/user");
const {
    uploadDeliveryProof,
} = require ("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
    try {
        const { 
            items, 
            orderType,
            paymentMethod, 
            deliveryAddress 
        } = req.body;

        if (
            !items || 
            !Array.isArray(items) || 
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Order harus memiliki minimal satu item",
            });
        }

        if (items.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Order maksimal memiliki 50 jenis item",
            });
        }

        if (!["takeaway", "delivery"].includes(orderType)) {
            return res.status(400).json({
                success: false,
                message: "Tipe order tidak valid",
            });
        }

        if (!["bank_transfer" , "cash"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Metode pembayaran tidak valid"
            })
        }

        if (orderType === "delivery" && paymentMethod !== "bank_transfer") {
            return res.status(400).json({
                success: false,
                message: "Delivery hanya dapat menggunakan bank transfer"
            })
        }

        if (orderType === "delivery") {
            if(
                !deliveryAddress ||
                typeof deliveryAddress !== "string" ||
                deliveryAddress.trim().length <10 ||
                deliveryAddress.trim().length >300
            ) {
                return res.status(400).json({
                    success:false,
                    message: "Alamat delivery harus antara 10 sampai 300 karakter",
                });
            }
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        const orderItems = [];
        let total = 0;

        for (const item of items) {
            if(!mongoose.Types.ObjectId.isValid(item.menuId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID menu ${item.menuId} tidak valid'
                });
            }

            const menu = await Menu.findById(item.menuId);

            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: `Menu ${item.menuId} tidak ditemukan`,
                });
            }

            if (!menu.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `Menu ${menu.name} sedang tidak tersedia`,
                });
            }

            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(quantity) || 
                quantity < 1 || 
                quantity > 99
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity harus berupa angka bulat antara 1 sampai dengan 99",
                });
            }

            const subtotal = menu.price * quantity;

            orderItems.push({
                menuId: menu._id,
                name: menu.name,
                price: menu.price,
                quantity,
                subtotal,
            });

            total += subtotal;
        }

        const orderNumber = `RB-${Date.now()}`;

        const order = await Order.create({
            orderNumber,

            customer: {
                userId: user._id,
                name: user.name,
                phone: user.phone,
            },

            items: orderItems,

            total,

            orderType,

            paymentMethod,

            deliveryAddress:
                orderType === "delivery"
                ? deliveryAddress.trim()
                : null,

            status: "waiting_payment",
        });

        res.status(201).json({
            success: true,
            message: "Order berhasil dibuat",
            data: order,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal membuat order",
        });
    }
});

router.get("/my-orders", protect, async (req, res) => {
    try {
        const orders = await Order.find({
            "customer.userId": req.user.userId,
        }).sort({ createdAt: -1 });

        const orderIds = orders.map((order) => order._id);

        const payments = await Payment.find({
            orderId: { $in: orderIds },
        });

        const paymentMap = new Map();

        payments.forEach((payment) => {
            paymentMap.set(
                payment.orderId.toString(),
                payment
            );
        });

        const ordersWithPayment = orders.map((order) => {
            const payment = paymentMap.get(
                order._id.toString()
            );

            return {
                ...order.toObject(),

                paymentInfo: payment
                    ? {
                          status: payment.status,
                          method: payment.method,
                          amount: payment.amount,
                          proofImage: payment.proofImage,
                          rejectionReason:
                              payment.rejectionReason || null,
                          verifiedAt:
                              payment.verifiedAt || null,
                      }
                    : null,
            };
        });

        res.json({
            success: true,
            data: ordersWithPayment,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil order",
        });
    }
});

router.get("/:id", protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID order tidak valid",
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        if (order.customer.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses ke order ini",
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil order",
        });
    }
});

router.post("/:id/cancel", protect, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID order tidak valid",
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order tidak ditemukan",
            });
        }

        if (
            order.customer.userId.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses ke order ini",
            });
        }

        const cancellableStatuses = [
            "waiting_payment",
            "payment_submitted",
            "payment_rejected",
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
            success: true,
            message: "Order berhasil dibatalkan",
            data: order,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal membatalkan order",
        });
    }
});

router.post(
    "/:id/delivery-proof",
    protect,
    uploadDeliveryProof,
    async (req, res) => {
        try {
            const {id} = req.params;

            if(!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID order tidak valid",
                });
            }

            if(!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti delivery wajib di upload",
                });
            }

            const order = await Order.findById(id);

            if (!order) {
                return res.status(404).json({
                    success:false,
                    message: "Order tidak ditemukan",
                });
            }

            if(
                order.customer.userId.toString() !==
                req.user.userId
            ) {
                return res.status(403).json({
                    success:false,
                    message: "Anda tidak memiliki akses ke order ini",
                });
            }

            if(order.orderType !== "delivery") {
                return res.status(400).json({
                    success: false,
                    message: "Order ini bukan delivery",
                });
            }

            if(order.status !== "out_for_delivery") {
                return res.status(400).json ({
                    success:false,
                    message: "Order belum sedang dalam proses delivery",
                });
            }

            if(order.deliveryProofImage) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti delivery sudah diupload",
                });
            }

            order.deliveryProofImage = req.file.filename;
            order.status = "completed" ;

            await order.save();

            res.json({
                success:true,
                message: "delivery berhasil dikonfirmasi",
                data:order,
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success:false,
                message: "Gagal mengonfirmasi delivery",
            });
        }
    }
);

module.exports = router;
const express = require("express");
const protect = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const mongoose = require("mongoose")
const {
    uploadPaymentProof,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    uploadPaymentProof,
    async (req, res) => {
        try {
            const { orderId, method } = req.body;

            if (!orderId || !method) {
                return res.status(400).json({
                    success: false,
                    message: "orderId dan method wajib diisi",
                });
            }

            if (!["bank_transfer", "cash"].includes(method)) {
                return res.status(400).json({
                    success: false,
                    message: "Metode pembayaran tidak valid",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(orderId)){
                return res.status(400).json ({
                    succes: false,
                    message: "ID order tidak valid",
                });
            }

            const order = await Order.findById(orderId);

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

            if (order.status !== "waiting_payment") {
                return res.status(400).json({
                    success: false,
                    message: "Order tidak sedang menunggu pembayaran",
                });
            }

            if(order.orderType === "delivery" && method !== "bank_transfer") {
                return res.status(400).json({
                    succes: false,
                    message: "Delivery hanya dapat menggunakan bank transfer",
                });
            }

            if (method === "bank_transfer" && !req.file) {
                return res.status(400).json ({
                    succes:false ,
                    message: "Bukti transfer wajib diupload",
                });
            }

            const existingPayment = await Payment.findOne({
                orderId: order._id,
            });

            if (existingPayment) {
                return res.status(409).json({
                    success: false,
                    message: "Payment untuk order ini sudah dibuat",
                });
            }

            const payment = await Payment.create({
                orderId: order._id,
                amount: order.total,
                method,
                proofImage: req.file ? req.file.filename : null,
            });

            if(method === "bank_transfer") {
                order.status = "payment_submitted";
                await order.save();
            }

            res.status(201).json({
                success: true,
                message: "Pembayaran berhasil disubmit",
                data: payment,
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Gagal membuat payment",
            });
        }
    }
);

module.exports = router;
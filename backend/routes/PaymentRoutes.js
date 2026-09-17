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

            if (method !== "bank_transfer") {
                return res.status(400).json({
                    success: false,
                    message: "Endpoint ini hanya untuk pembayaran bank transfer"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(orderId)){
                return res.status(400).json ({
                    success: false,
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

            if(!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Bukti transfer wajib di upload",
                });
            }

            const existingPayment = await Payment.findOne({
                orderId
            });

            if (existingPayment) {
                //Payment masih menunggu verifikasi
                if (existingPayment.status === "pending") {
                    return res.status(400).json({
                        success:false,
                        message: "Bukti pembayaran sedang menunggu verifikasi",
                    });
                }

                //Payment sudah diverifikasi
                if (existingPayment.status === "verified") {
                    return res.status(400).json({
                        success:false,
                        message: "Pembayaran untuk order ini sudah diverfikasi",
                    });
                }

                // Payment ditolak, bisa upload bukti baru
                if (existingPayment.status === "rejected") {
                    existingPayment.amount = order.total;
                    existingPayment.method = "bank_transfer";
                    existingPayment.proofImage = req.file.filename;
                    existingPayment.status = "pending";
                    existingPayment.verifiedBy = null;
                    existingPayment.verifiedAt = null;
                    existingPayment.rejectionReason = null;

                    await existingPayment.save();

                    order.status = "payment_submitted";
                    await order.save();

                    return res.status(200).json({
                        success: true,
                        message: "Bukti pembayaran berhasil dikirim ulang",
                        data: existingPayment,
                    });
                }
            }

            const payment = await Payment.create({
                orderId: order._id,
                amount: order.total,
                method,
                proofImage: req.file.filename,
            });

            order.status = "payment_submitted";
            await order.save();

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
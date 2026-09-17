const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        menuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            max: 99,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        customer: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            name: {
                type: String,
                required: true,
            },

            phone: {
                type: String,
                required: true,
            },
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order harus memiliki minimal satu item",
            },
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        orderType: {
            type: String,
            enum: ["takeaway", "delivery"],
            required: true,
        },

        paymentMethod: {
            type:String,
            enum: ["bank_transfer", "cash"],
            required: true,
        },

        deliveryAddress: {
            type: String,
            trim: true,
            maxlength: 300,
            default: null,

            validate: {
                validator: function (value) {
                    if(this.orderType === "delivery") {
                        return (
                            typeof value === "string" &&
                            value.trim().length >= 10
                        );
                    }

                    return true;

                },

                message: "Alamat Delivery wajib diisi minimal 10 karakter",
            },
        },

        pickupProofImage:{
            type: String,
            default: null,
        },

        courierProofImage: {
            type:String,
            default:null,
        },

        deliveryProofImage:{
            type:String,
            default:null,
        },

        status: {
            type: String,
            enum: [
                "waiting_payment",
                "payment_submitted",
                "payment_verified",
                "payment_rejected",
                "processing",
                "ready_for_pickup",
                "ready_for_delivery",
                "out_for_delivery",
                "completed",
                "cancelled",
            ],
            default: "waiting_payment",
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
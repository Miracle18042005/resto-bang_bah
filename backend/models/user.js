const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Nama wajib diisi"],
            trim: true,
            maxlength: [100, "Nama maksimal 100 karakter"],
        },

        email: {
            type: String,
            required: [true, "Email wajib diisi"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [150, "Email maksimal 150 karakter"],
        },

        phone: {
            type: String,
            trim: true,
            maxlength: [20, "Nomor telepon maksimal 20 karakter"],
        },

        password: {
            type: String,
            required: [true, "Password wajib diisi"],
            minlength: [8,"Password minimal 8 karakter"],
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
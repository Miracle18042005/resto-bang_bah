const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Nama menu wajib diisi"],
            trim: true,
            maxlength: [100, "Nama menu maksimal 100 karakter"],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Deskripsi maksimal 500 karakter"],
        },

        price: {
            type: Number,
            required: [true, "Harga menu wajib diisi"],
            min: [0, "Harga tidak boleh negatif"],
        },

        category: {
            type: String,
            required: [true, "Kategori menu wajib diisi"],
            trim: true,
            maxlength: [50, "Kategori maksimal 50 karakter"],
        },

        image: {
            type: String,
            trim: true,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;
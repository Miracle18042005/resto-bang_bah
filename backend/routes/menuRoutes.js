const express = require("express");
const fs = require("fs");
const path = require("path");

const Menu = require("../models/menu");

const {
    uploadMenuImage,
} = require("../middleware/uploadMiddleware");

const router = express.Router();


// =========================
// GET SEMUA MENU
// =========================
router.get("/", async (req, res) => {
    try {
        const menus = await Menu.find();

        res.json({
            success: true,
            data: menus,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data menu",
        });
    }
});


// =========================
// GET MENU BERDASARKAN ID
// =========================
router.get("/:id", async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: "Menu tidak ditemukan",
            });
        }

        res.json({
            success: true,
            data: menu,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "ID menu tidak valid",
        });
    }
});


// =========================
// UPDATE MENU
// =========================
router.put(
    "/:id",
    uploadMenuImage,
    async (req, res) => {
        try {
            const menu = await Menu.findById(
                req.params.id
            );

            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: "Menu tidak ditemukan",
                });
            }

            const {
                name,
                description,
                price,
                category,
                isAvailable,
            } = req.body;

            menu.name = name;
            menu.description = description;
            menu.price = price;
            menu.category = category;

            if (isAvailable !== undefined) {
                menu.isAvailable =
                    isAvailable === "true" ||
                    isAvailable === true;
            }

            // Kalau ada gambar baru
            if (req.file) {
                // Hapus gambar lama jika ada
                if (menu.image) {
                    const oldImagePath = path.join(
                        __dirname,
                        "..",
                        "uploads",
                        "menus",
                        menu.image
                    );

                    if (
                        fs.existsSync(oldImagePath)
                    ) {
                        fs.unlinkSync(
                            oldImagePath
                        );
                    }
                }

                // Simpan nama file baru
                menu.image =
                    req.file.filename;
            }

            await menu.save();

            res.json({
                success: true,
                message:
                    "Menu berhasil diperbarui",
                data: menu,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
);


// =========================
// TAMBAH MENU
// =========================
router.post(
    "/",
    uploadMenuImage,
    async (req, res) => {
        try {
            const {
                name,
                description,
                price,
                category,
                isAvailable,
            } = req.body;

            const menu = await Menu.create({
                name,
                description,
                price,
                category,
                isAvailable:
                    isAvailable === undefined
                        ? true
                        : isAvailable === "true" ||
                          isAvailable === true,
                image: req.file
                    ? req.file.filename
                    : undefined,
            });

            res.status(201).json({
                success: true,
                message:
                    "Menu berhasil ditambahkan",
                data: menu,
            });
        } catch (error) {
            // Kalau database gagal setelah file
            // berhasil diupload, hapus file tersebut
            if (req.file) {
                const filePath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    "menus",
                    req.file.filename
                );

                if (
                    fs.existsSync(filePath)
                ) {
                    fs.unlinkSync(filePath);
                }
            }

            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
);


// =========================
// HAPUS MENU
// =========================
router.delete("/:id", async (req, res) => {
    try {
        const menu =
            await Menu.findByIdAndDelete(
                req.params.id
            );

        if (!menu) {
            return res.status(404).json({
                success: false,
                message:
                    "Menu tidak ditemukan",
            });
        }

        // Hapus gambar menu dari folder
        if (menu.image) {
            const imagePath = path.join(
                __dirname,
                "..",
                "uploads",
                "menus",
                menu.image
            );

            if (
                fs.existsSync(imagePath)
            ) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({
            success: true,
            message:
                "Menu berhasil dihapus",
            data: menu,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message:
                "ID menu tidak valid",
        });
    }
});


module.exports = router;
const express = require("express");
const Menu = require("../models/menu");

const router = express.Router();

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

router.get("/:id", async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);

        if(!menu){
            return res.status(404).json({
                success: false,
                message : "Menu tidak ditemukan"
            });
        }

        res.json({
            success: true,
            data: menu,
        });
    } catch(error) {
        res.status(400).json({
            success: false,
            message: "ID menu tidak valid",
        });
    }
});

router.put("/:id", async (req, res) =>{
    try {
        const menu = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if(!menu) {
            return res.status(404).json({
                success: false,
                message: "Menu tidak ditemukan",
            });
        }

        res.json({
            success: true,
            message: "Menu berhasil diperbarui",
            data: menu,
        });
    } catch (eror) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, description, price, category, image, isAvailable } = req.body;

        const menu = await Menu.create({
            name,
            description,
            price,
            category,
            image,
            isAvailable,
        });

        res.status(201).json({
            success: true,
            message: "Menu berhasil ditambahkan",
            data: menu,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const menu = await Menu.findByIdAndDelete(req.params.id);

        if(!menu){
            return res.status(404).json({
                succes: false,
                message: "Menu tidak ditemukan",
            });
        }
        
        res.json({
            success: true,
            message: "Menu berhasil dihapus",
            data: menu,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "ID menu tidak valid",
        });
    }
});

module.exports = router;
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const menuRoutes = require("./routes/menuRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/OrderRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");
const adminRoutes = require("./routes/AdminRoutes");

const app = express();


// =========================
// UPLOADS
// =========================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(
    express.json({
        limit: "1mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb",
    })
);


// =========================
// API ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);


// =========================
// ROOT
// =========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message:
            "RESTO BANGBAH API is running",
    });
});


// =========================
// 404
// =========================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message:
            "Endpoint tidak ditemukan",
    });
});


// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message:
            "Terjadi kesalahan pada server",
    });
});


// =========================
// SERVER
// =========================

const PORT =
    process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Gagal menjalankan server:",
            error
        );

        process.exit(1);
    }
};

startServer();
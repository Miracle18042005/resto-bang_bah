require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = "admin@restobangbah.local";
        const password = "Admin12345!";

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log("Admin sudah ada.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: "Admin RESTO BANGBAH",
            email,
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin berhasil dibuat.");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error("Gagal membuat admin:", error.message);
        process.exit(1);
    }
};

createAdmin();
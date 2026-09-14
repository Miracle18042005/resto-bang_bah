const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const createUploadMiddleware = (fieldName, folderName) => {
    const destination = `uploads/${folderName}`;

    // Buat folder otomatis kalau belum ada
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination);
        },

        filename: (req, file, cb) => {
            const randomName = crypto.randomBytes(16).toString("hex");
            const extension = path.extname(file.originalname).toLowerCase();

            cb(
                null,
                `${Date.now()}-${randomName}${extension}`
            );
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("File harus berupa JPG, PNG, atau WebP")
            );
        }

        cb(null, true);
    };

    const upload = multer({
        storage,
        fileFilter,

        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });

    return (req, res, next) => {
        upload.single(fieldName)(req, res, (error) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            next();
        });
    };
};

const uploadPaymentProof = createUploadMiddleware(
    "proofImage",
    "payments"
);

const uploadPickupProof = createUploadMiddleware(
    "pickupProofImage",
    "orders"
);

const uploadCourierProof = createUploadMiddleware(
    "courierProofImage",
    "orders"
);

const uploadDeliveryProof = createUploadMiddleware(
    "deliveryProofImage",
    "orders"
);

module.exports = {
    uploadPaymentProof,
    uploadPickupProof,
    uploadCourierProof,
    uploadDeliveryProof,
};
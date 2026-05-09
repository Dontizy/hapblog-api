import multer from "multer";
import path from "path";
import fs, { mkdir } from "fs"

const uploadPath = path.join(process.cwd(), "uploads")

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, uploadPath);
    },

    filename(_req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueSuffix + path.extname(file.originalname))
    },
})


// File filter
const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const isValidExt = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    const isValidMime = allowedTypes.test(file.mimetype);

    if (isValidExt && isValidMime) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"));
    }
};

// Multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});


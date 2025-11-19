// middlewares/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // keep original ext, add timestamp
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    const uniqueName = Date.now() + "-" + base + ext;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

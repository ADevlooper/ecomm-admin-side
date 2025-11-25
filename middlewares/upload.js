import multer from "multer";
import fs from "fs";

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Accept only image mime types and allow field names 'image' and 'images'
function fileFilter(req, file, cb) {
  const allowedFields = ["image", "images"];
  if (!allowedFields.includes(file.fieldname)) {
    // reject unexpected field names
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }

  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }

  cb(null, true);
}

export const upload = multer({ storage, fileFilter });

// Common middleware exports for routes
export const uploadSingle = upload.single("image");
export const uploadMultiple = (max = 10) => upload.array("images", max);

// Accept either a single 'image' field or multiple 'images' field in the same request
export const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

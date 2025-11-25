import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import tagRoutes from "./routes/tagsRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (uploads folder)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/images", imageRoutes);
app.use("/tags", tagRoutes);

// Home route
app.get("/", (req, res) => {
  res.redirect("/products");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

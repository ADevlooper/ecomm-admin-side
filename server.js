import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/productsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use("/", productsRouter);

app.listen(3000, () => console.log("Server running on port 3000"));

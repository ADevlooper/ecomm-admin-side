import { db } from "../db/client.js";
import { products } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getAllProducts = async (req, res) => {
  try {
    const result = await db.select().from(products);
    res.render("index", { products: result });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).send("Error fetching products");
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, rating, image_url } = req.body;

    await db.insert(products).values({
      name,
      description,
      price: Number(price) || 0,
      rating: Number(rating) || 0,
      image_url,
    });

    res.redirect("/");
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).send("Error creating product");
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, Number(id)));

    if (!result.length) return res.status(404).send("Product not found");

    res.render("edit", { product: result[0] });
  } catch (err) {
    console.error("FETCH BY ID ERROR:", err);
    res.status(500).send("Error fetching product");
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, rating, image_url } = req.body;

    await db
      .update(products)
      .set({
        name,
        description,
        price: Number(price),
        rating: Number(rating),
        image_url,
      })
      .where(eq(products.id, Number(id)));

    res.redirect("/");
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).send("Error updating product");
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    await db.delete(products).where(eq(products.id, Number(id)));

    res.redirect("/");
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).send("Error deleting product");
  }
};

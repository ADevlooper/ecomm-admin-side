import { db } from "../db/client.js";
import { products } from "../db/schema.js";
import { eq } from "drizzle-orm";

// READ ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  try {
    const result = await db.select().from(products);
    res.render("index", { products: result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading products");
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, rating, image_url } = req.body;

    await db.insert(products).values({
      name,
      description,
      price: Number(price),
      rating: Number(rating),
      image_url
    });

    res.send(`
      <script>
        alert("Product Created Successfully!");
        window.location.href = "/";
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating product");
  }
};

// GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, req.params.id));

    if (!result.length) {
      return res.status(404).send("Product not found");
    }

    res.render("edit", { product: result[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching product");
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, rating, image_url } = req.body;

    await db
      .update(products)
      .set({
        name,
        description,
        price: Number(price),
        rating: Number(rating),
        image_url
      })
      .where(eq(products.id, req.params.id));

    res.send(`
      <script>
        alert("Product Updated Successfully!");
        window.location.href = "/";
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating product");
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, req.params.id));

    res.send(`
      <script>
        alert("Product Deleted Successfully!");
        window.location.href = "/";
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
};

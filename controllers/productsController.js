import { db } from "../db/client.js";
import { products } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getAllProducts = async (req, res) => {
  try {
    const result = await db.select().from(products);
    res.render("index", { products: result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading products");
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, rating } = req.body;

    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    await db.insert(products).values({
      name,
      description,
      price: Number(price),
      rating: Number(rating),
      image_url: imageUrl,
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

export const getProductById = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, req.params.id));

    if (!result.length) return res.status(404).send("Product not found");

    res.render("edit", { product: result[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching product");
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, rating, image_url } = req.body;

    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    await db
      .update(products)
      .set({
        name,
        description,
        price: Number(price),
        rating: Number(rating),
        image_url: finalImageUrl,
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

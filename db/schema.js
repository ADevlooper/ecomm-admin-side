// /db/schema.js
// Drizzle ORM schema for ecomm-admin-side

import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  primaryKey,
} from "drizzle-orm/pg-core";

/* ---------------------------
   PRODUCTS
   --------------------------- */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).default(0),
  in_stock: boolean("in_stock").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* ---------------------------
   CATEGORIES
   --------------------------- */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

/* ---------------------------
   IMAGES
   --------------------------- */
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 1000 }).notNull(),
  alt_text: varchar("alt_text", { length: 255 }),
  filename: varchar("filename", { length: 500 }),
  created_at: timestamp("created_at").defaultNow(),
});

/* ---------------------------
   JUNCTION TABLES
   --------------------------- */
export const product_categories = pgTable(
  "product_categories",
  {
    product_id: integer("product_id").notNull().references(() => products.id),
    category_id: integer("category_id").notNull().references(() => categories.id),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.product_id, table.category_id),
  })
);

/* ---------------------------
   FIXED: PRODUCT_IMAGES
   --------------------------- */
export const product_images = pgTable("product_images", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").notNull().references(() => products.id),
  image_id: integer("image_id").notNull().references(() => images.id),
  is_primary: boolean("is_primary").default(false),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  decimal
} from "drizzle-orm/pg-core";

// ------------------------
//  CATEGORIES TABLE
// ------------------------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ------------------------
//  PRODUCTS TABLE
// ------------------------
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),

  // NEW: relational category
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),

  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),

  stock: integer("stock").notNull(),
  availableStock: integer("available_stock").notNull(),

  brand: varchar("brand", { length: 255 }),
  warrantyInfo: varchar("warranty_info", { length: 255 }),

  tags: jsonb("tags").default([]),
  images: jsonb("images").default([]),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});



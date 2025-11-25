import { db } from "../db/client.js";
import { tags, product_tags } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

// Create or return existing tag (case-insensitive)
export async function createTag(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new Error("Tag name is required");

  // try case-insensitive match
  const lower = trimmed.toLowerCase();
  const existing = await db.select().from(tags).where(sql`LOWER(${tags.name}) = ${lower}`);
  if (existing && existing.length) return existing[0];

  const slug = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const inserted = await db.insert(tags).values({ name: trimmed, slug }).returning();
  return inserted[0];
}

export async function getTagByName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const rows = await db.select().from(tags).where(sql`LOWER(${tags.name}) = ${lower}`);
  return rows && rows.length ? rows[0] : null;
}

export async function attachTagToProduct(productId, tagId) {
  // validate
  if (!productId || !tagId) throw new Error("productId and tagId are required");

  const existing = await db
    .select()
    .from(product_tags)
    .where(eq(product_tags.product_id, Number(productId)))
    .where(eq(product_tags.tag_id, Number(tagId)));

  if (existing && existing.length) return existing[0];

  const inserted = await db.insert(product_tags).values({ product_id: Number(productId), tag_id: Number(tagId) }).returning();
  return inserted[0];
}

export async function removeTagFromProduct(productId, tagId) {
  if (!productId || !tagId) throw new Error("productId and tagId are required");
  await db.delete(product_tags).where(eq(product_tags.product_id, Number(productId))).where(eq(product_tags.tag_id, Number(tagId)));
  return true;
}

export async function getTagsForProduct(productId) {
  if (!productId) return [];
  const rows = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(product_tags)
    .leftJoin(tags, eq(product_tags.tag_id, tags.id))
    .where(eq(product_tags.product_id, Number(productId)));
  return rows || [];
}

export default {
  createTag,
  getTagByName,
  attachTagToProduct,
  removeTagFromProduct,
  getTagsForProduct,
};

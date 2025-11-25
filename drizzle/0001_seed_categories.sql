-- Migration: ensure categories are restricted and pre-seeded

-- Remove old description column if present
ALTER TABLE IF EXISTS categories DROP COLUMN IF EXISTS description;

-- Add a check constraint to enforce allowed category names (idempotent: drop if exists)
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_allowed;
ALTER TABLE categories ADD CONSTRAINT categories_name_allowed CHECK (name IN (
  'Electronics', 'Furniture', 'Groceries', 'Appliances', 'Fashion', 'Others'
));

-- Insert the six predefined categories (idempotent)
INSERT INTO categories (name, slug, created_at)
VALUES
  ('Electronics', 'electronics', now()),
  ('Furniture', 'furniture', now()),
  ('Groceries', 'groceries', now()),
  ('Appliances', 'appliances', now()),
  ('Fashion', 'fashion', now()),
  ('Others', 'others', now())
ON CONFLICT (name) DO NOTHING;

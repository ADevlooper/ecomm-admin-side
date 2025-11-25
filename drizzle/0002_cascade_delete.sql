-- Drop old foreign key constraint on product_categories.product_id (without cascade)
ALTER TABLE product_categories
DROP CONSTRAINT IF EXISTS product_categories_product_id_products_id_fk;

-- Add new foreign key with ON DELETE CASCADE
ALTER TABLE product_categories
ADD CONSTRAINT product_categories_product_id_products_id_fk
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

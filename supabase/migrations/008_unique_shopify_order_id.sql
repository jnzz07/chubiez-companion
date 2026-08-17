-- The webhook's duplicate-send guard was a plain SELECT-then-INSERT, which
-- has a race: two near-simultaneous webhook deliveries for the same order
-- (Shopify is known to occasionally deliver the same webhook twice) could
-- both pass the "does this already exist?" check before either INSERT
-- committed, producing duplicate codes for the same unit. A real database
-- constraint closes that race at the only layer that can guarantee it.
--
-- If the race already produced duplicate rows for the same order/unit
-- (each with its own independently-claimed code, since every request
-- claims its own pool code before the insert races), this index would
-- fail to create — clean those up first, keeping the earliest row.
DELETE FROM access_codes a
USING access_codes b
WHERE a.shopify_order_id IS NOT NULL
  AND a.shopify_order_id = b.shopify_order_id
  AND a.id > b.id;

-- Partial index (WHERE shopify_order_id IS NOT NULL) because admin/backfill
-- codes never set shopify_order_id, and NULL must not collide with itself.
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_codes_shopify_order_id_unique
  ON access_codes(shopify_order_id)
  WHERE shopify_order_id IS NOT NULL;

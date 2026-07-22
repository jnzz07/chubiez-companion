-- Allow 'backfill' as a generated_by source, for bulk-sending codes to
-- customers who ordered before this tool existed.
ALTER TABLE access_codes DROP CONSTRAINT access_codes_generated_by_check;
ALTER TABLE access_codes ADD CONSTRAINT access_codes_generated_by_check
  CHECK (generated_by IN ('shopify', 'admin', 'backfill'));

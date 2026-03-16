-- Core table — one row per generated access code
CREATE TABLE access_codes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL,
  code             TEXT NOT NULL UNIQUE,
  plush_type_slug  TEXT REFERENCES plush_types(slug) ON DELETE SET NULL,
  shopify_order_id TEXT,                          -- null for admin-generated codes
  used             BOOLEAN NOT NULL DEFAULT false,
  used_at          TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  sent_at          TIMESTAMPTZ,
  generated_by     TEXT NOT NULL DEFAULT 'shopify' CHECK (generated_by IN ('shopify', 'admin'))
);

CREATE INDEX idx_access_codes_email      ON access_codes(email);
CREATE INDEX idx_access_codes_code       ON access_codes(code);
CREATE INDEX idx_access_codes_order_id   ON access_codes(shopify_order_id) WHERE shopify_order_id IS NOT NULL;
CREATE INDEX idx_access_codes_status     ON access_codes(used, expires_at);

ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write — never exposed to browser
CREATE POLICY "Service role full access on access_codes"
  ON access_codes FOR ALL USING (auth.role() = 'service_role');

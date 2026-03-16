-- Plush type catalog — one row per SKU
CREATE TABLE plush_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plush_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read plush types"
  ON plush_types FOR SELECT USING (true);

CREATE POLICY "Service role can manage plush types"
  ON plush_types FOR ALL USING (auth.role() = 'service_role');

-- Seed initial plush types (update slugs to match your Shopify SKUs)
INSERT INTO plush_types (slug, name, description) VALUES
  ('standard',     'Chubiez Plushie',      'The original comfort plushie'),
  ('cloud-bear',   'Cloud Bear',           'Soft pastel bear for cloudy days'),
  ('anxiety-frog', 'Anxiety Frog',         'For when your brain won''t stop');

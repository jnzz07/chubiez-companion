-- Key/value settings editable from the admin panel (e.g. the access-code email template).
CREATE TABLE app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on app_settings"
  ON app_settings FOR ALL USING (auth.role() = 'service_role');

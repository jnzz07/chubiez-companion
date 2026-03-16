-- App profile — created when a user redeems their first code
CREATE TABLE companion_users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  plush_type_slug TEXT REFERENCES plush_types(slug) ON DELETE SET NULL,
  display_name    TEXT,
  is_admin        BOOLEAN NOT NULL DEFAULT false,
  onboarded       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companion_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON companion_users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON companion_users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access on companion_users"
  ON companion_users FOR ALL USING (auth.role() = 'service_role');

-- Pool of pre-made access codes exported from the Bemellou app.
-- The webhook/admin panel CLAIMS codes from here — it never invents its own.
-- Each code can be assigned exactly once (UNIQUE + atomic claim function).
CREATE TABLE code_pool (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  batch        TEXT,                              -- optional label for the import batch
  assigned     BOOLEAN NOT NULL DEFAULT false,
  assigned_at  TIMESTAMPTZ,
  imported_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_code_pool_available ON code_pool(assigned) WHERE assigned = false;

ALTER TABLE code_pool ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write — never exposed to browser
CREATE POLICY "Service role full access on code_pool"
  ON code_pool FOR ALL USING (auth.role() = 'service_role');

-- Atomically claim the oldest available code. Safe under concurrent webhooks:
-- SKIP LOCKED means two simultaneous orders can never get the same code.
CREATE OR REPLACE FUNCTION claim_pool_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claimed TEXT;
BEGIN
  UPDATE code_pool
  SET assigned = true, assigned_at = NOW()
  WHERE id = (
    SELECT id FROM code_pool
    WHERE assigned = false
    ORDER BY imported_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING code INTO claimed;

  RETURN claimed; -- NULL when the pool is empty
END;
$$;

-- Access codes are single-use but never time-expire — only "used" matters.
ALTER TABLE access_codes ALTER COLUMN expires_at DROP NOT NULL;
ALTER TABLE access_codes ALTER COLUMN expires_at DROP DEFAULT;
COMMENT ON COLUMN access_codes.expires_at IS 'Deprecated — codes no longer expire. Column kept for historical rows.';

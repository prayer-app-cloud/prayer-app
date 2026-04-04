-- ============================================================
-- Function: Increment prayer count atomically
-- Called when a user taps "I prayed"
-- ============================================================
CREATE OR REPLACE FUNCTION increment_prayer_count(p_request_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE prayer_requests
  SET prayer_count = prayer_count + 1,
      updated_at = now()
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: Generate a unique share slug
-- 8-char alphanumeric, collision-resistant
-- ============================================================
CREATE OR REPLACE FUNCTION generate_share_slug()
RETURNS VARCHAR AS $$
DECLARE
  new_slug VARCHAR;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := substr(replace(encode(gen_random_bytes(6), 'base64'), '/', ''), 1, 8);
    SELECT EXISTS(SELECT 1 FROM prayer_requests WHERE share_slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: Expire old requests
-- Run periodically (via cron or edge function)
-- ============================================================
CREATE OR REPLACE FUNCTION expire_old_requests()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE prayer_requests
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expires_at < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Trigger: Auto-generate share_slug on insert
-- ============================================================
CREATE OR REPLACE FUNCTION set_share_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_slug IS NULL OR NEW.share_slug = '' THEN
    NEW.share_slug := generate_share_slug();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prayer_requests_share_slug
  BEFORE INSERT ON prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_share_slug();

-- ============================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prayer_requests_updated_at
  BEFORE UPDATE ON prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Function: Create user record on anonymous sign-up
-- Triggered when Supabase auth creates a new user
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, session_id, auth_method)
  VALUES (NEW.id, NEW.id::VARCHAR, 'anonymous')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create user record when auth.users gets a new row
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

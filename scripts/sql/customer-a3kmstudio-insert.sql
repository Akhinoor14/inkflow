-- Customer-specific license row for a3kmstudio@gmail.com
-- Run this in Supabase SQL Editor.

INSERT INTO license_keys (key, email, max_devices, expires_at, revoked, device_ids)
VALUES ('INKF-U3VN-HR6G-EWXF', 'a3kmstudio@gmail.com', 2, NULL, false, '{}')
ON CONFLICT (key) DO UPDATE
SET email = EXCLUDED.email,
    max_devices = EXCLUDED.max_devices,
    expires_at = EXCLUDED.expires_at,
    revoked = EXCLUDED.revoked,
    device_ids = EXCLUDED.device_ids;

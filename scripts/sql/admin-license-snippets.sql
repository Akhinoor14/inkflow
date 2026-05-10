-- Admin-friendly license SQL snippets
-- Example key already filled in for direct copy-paste.

-- 1) Revoke a key
UPDATE license_keys
SET revoked = true
WHERE key = 'INKF-U3VN-HR6G-EWXF';

-- 2) Re-enable a revoked key
UPDATE license_keys
SET revoked = false
WHERE key = 'INKF-U3VN-HR6G-EWXF';

-- 3) Extend expiry by 30 days
UPDATE license_keys
SET expires_at = COALESCE(expires_at, NOW()) + INTERVAL '30 days'
WHERE key = 'INKF-U3VN-HR6G-EWXF';

-- 4) Make a key lifetime (no expiry)
UPDATE license_keys
SET expires_at = NULL
WHERE key = 'INKF-U3VN-HR6G-EWXF';

-- 5) Reset all registered devices for a key
UPDATE license_keys
SET device_ids = '{}'
WHERE key = 'INKF-U3VN-HR6G-EWXF';

-- 6) Remove one specific device id from a key
UPDATE license_keys
SET device_ids = array_remove(device_ids, 'device_id_to_remove')
WHERE key = 'INKF-U3VN-HR6G-EWXF';

-- 7) View one key status
SELECT key, email, revoked, max_devices, device_ids, expires_at, last_activated_at, created_at
FROM license_keys
WHERE key = 'INKF-U3VN-HR6G-EWXF';

-- 8) View recent activation logs
SELECT key, email, device_id, event, app_version, created_at
FROM activation_log
ORDER BY created_at DESC
LIMIT 100;

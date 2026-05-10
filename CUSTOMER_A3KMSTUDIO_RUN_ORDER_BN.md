# a3kmstudio@gmail.com - Exact Run Order

এই file-এ দেখানো হলো `a3kmstudio@gmail.com` customer-এর জন্য Supabase-এ ঠিক কোন order-এ কাজ করবে।

-----------------------------------

## 1) প্রথমে base tables run করো

Supabase SQL Editor এ আগে base schema run করো:

```sql
CREATE TABLE IF NOT EXISTS license_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  email TEXT,
  device_ids TEXT[] DEFAULT '{}',
  max_devices INTEGER DEFAULT 2,
  revoked BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS activation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  device_id TEXT,
  email TEXT,
  event TEXT,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_license_key ON license_keys(key);

ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read by key" ON license_keys;
DROP POLICY IF EXISTS "Allow anon update device_ids" ON license_keys;
DROP POLICY IF EXISTS "Allow anon insert log" ON activation_log;

CREATE POLICY "Allow anon read by key" ON license_keys
  FOR SELECT USING (true);

CREATE POLICY "Allow anon update device_ids" ON license_keys
  FOR UPDATE USING (true);

CREATE POLICY "Allow anon insert log" ON activation_log
  FOR INSERT WITH CHECK (true);
```

-----------------------------------

## 2) এরপর customer row insert করো

এই file run করো:

- [scripts/sql/customer-a3kmstudio-insert.sql](scripts/sql/customer-a3kmstudio-insert.sql)

এটার ভিতরে already এই values আছে:
- Email: `a3kmstudio@gmail.com`
- Key: `INKF-U3VN-HR6G-EWXF`
- max_devices: `2`
- expires_at: `NULL`
- revoked: `false`
- device_ids: `{}`

এই SQL file-এর কাজ:
1. নতুন row insert করা
2. key আগে থাকলে update করা
3. same customer row বারবার safe ভাবে run করা

-----------------------------------

## 3) তারপর verify করো

Supabase SQL Editor-এ এই query চালিয়ে দেখো row আছে কি না:

```sql
SELECT key, email, revoked, max_devices, device_ids, expires_at, last_activated_at, created_at
FROM license_keys
WHERE key = 'INKF-U3VN-HR6G-EWXF';
```

Expected:
1. `email = a3kmstudio@gmail.com`
2. `revoked = false`
3. `max_devices = 2`
4. `device_ids = []`
5. `expires_at = NULL`

-----------------------------------

## 4) তারপর live app test করো

Customer-এর app flow:
1. Open app: `https://foylx.vercel.app`
2. Email লিখবে: `a3kmstudio@gmail.com`
3. Key লিখবে: `INKF-U3VN-HR6G-EWXF`
4. Activate চাপবে
5. Success হলে app unlock হবে

-----------------------------------

## 5) activation successful হলে কী দেখবে

Supabase এ check করো:
1. `device_ids` populated হয়েছে
2. `last_activated_at` update হয়েছে
3. `activation_log`-এ নতুন row এসেছে

Logs দেখতে:

```sql
SELECT key, email, device_id, event, app_version, created_at
FROM activation_log
ORDER BY created_at DESC
LIMIT 100;
```

-----------------------------------

## 6) problem হলে কী করবে

### যদি key কাজ না করে
1. `revoked` false কি না দেখো
2. `expires_at` NULL বা future date কি না দেখো
3. key ঠিক copy হয়েছে কি না দেখো

### যদি device limit hit হয়
1. `device_ids` দেখো
2. `max_devices` দেখো
3. দরকার হলে device reset করো

### যদি customer new device নেয়
1. `device_ids = '{}'` করো
2. আবার activate করতে দাও

-----------------------------------

## 7) short version

Exact order:
1. Base SQL run
2. [scripts/sql/customer-a3kmstudio-insert.sql](scripts/sql/customer-a3kmstudio-insert.sql) run
3. Row verify
4. App-এ activation test
5. Logs verify
6. Need হলে revoke / extend / reset

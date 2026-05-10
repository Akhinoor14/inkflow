# InkFlow License System - Complete Newborn Guide (Bangla)

এই গাইড এমনভাবে লেখা যে একদম নতুন কেউও শুরু থেকে শেষ পর্যন্ত license system চালু করতে পারে।

-----------------------------------

## 0) আমি যা already করে দিয়েছি

এই project-এ আমি already নিচের কাজগুলো করে দিয়েছি:
1. Activation gate app-এ connect করা হয়েছে: [src/app/page.tsx](src/app/page.tsx)
2. Bengali activation UI labels + error mapping করা হয়েছে: [src/app/page.tsx](src/app/page.tsx)
3. 20 key generator script তৈরি করা হয়েছে: [scripts/generate-licenses.js](scripts/generate-licenses.js)
4. Admin SQL snippets ready file তৈরি করা হয়েছে: [scripts/sql/admin-license-snippets.sql](scripts/sql/admin-license-snippets.sql)

তাই এখন তোমার হাতে main কাজ শুধু তিনটা:
1. Supabase base SQL run করা
2. license keys generate করা
3. generated SQL insert run করা

-----------------------------------

## 1) License system কেন দরকার

License system থাকলে:
1. তুমি paid access control করতে পারবে
2. 1 key কত device-এ চলবে সেটা নিয়ন্ত্রণ করতে পারবে
3. key revoke করতে পারবে (চুরি/refund/abuse হলে)
4. expiry date দিয়ে subscription টাইপ access দিতে পারবে

License না থাকলে:
1. যে কেউ app unlimited ব্যবহার করতে পারবে
2. premium feature protect করা কঠিন হবে

-----------------------------------

## 2) User এর জন্য experience কেমন হবে

বর্তমান flow (তোমার project-এর code অনুযায়ী):
1. User app খুলবে
2. যদি valid license cache না থাকে, Activation screen দেখবে
3. User Email + License Key দিবে
4. activate হলে app unlock হবে

Important:
1. এই flow-তে user account/password লাগে না
2. login system থাকলে (Google বা custom) account-based করা যায়, কিন্তু এখন license key + email flow
3. একটি key max 2 device (default)

So, user account খুলবে কিভাবে?
1. বর্তমান system এ account create করার step নাই
2. তুমি customer-কে email + license key পাঠাবে
3. user activation screen এ email + key দিয়ে প্রবেশ করবে

-----------------------------------

## 3) তোমার কী কী setup করা বাকি

তোমার env variables already set + deploy হয়েছে।
এখন main remaining কাজ:
1. Supabase এ license tables/policies বানানো
2. Initial license keys insert করা
3. Test activation
4. Optional admin operations (revoke/extend/reset)

-----------------------------------

## 4) Supabase setup (where থেকে where)

### Step A: Supabase project
1. যাও: https://supabase.com
2. Login
3. New Project
4. Project name: inkflow-studio
5. Database password set করো
6. Region choose করো
7. Create Project

### Step B: SQL Editor open
1. Left sidebar -> SQL Editor
2. New Query
3. নিচের base SQL paste করে Run করো

~~~sql
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
~~~

-----------------------------------

## 5) 20টা license key generate script (ready)

### Option 1: Terminal এ run করে 20টা key print

~~~powershell
node -e "const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const seg=n=>Array.from({length:n},()=>chars[Math.floor(Math.random()*chars.length)]).join('');for(let i=0;i<20;i++){console.log(`INKF-${seg(4)}-${seg(4)}-${seg(4)}`)}"
~~~

### Option 2: ready script run করো, এটা easiest

1. এই ফাইল already তৈরি আছে: [scripts/generate-licenses.js](scripts/generate-licenses.js)
2. Terminal open করে project root-এ গিয়ে run করো:

~~~powershell
node scripts/generate-licenses.js
~~~

3. Output ফাইল 2টা তৈরি হবে:
  - [generated-license-20.sql](generated-license-20.sql)
  - [generated-license-20.txt](generated-license-20.txt)
4. [generated-license-20.sql](generated-license-20.sql) খুলে পুরো content কপি করো
5. Supabase -> SQL Editor -> New Query এ paste করে Run করো

-----------------------------------

## 6) Admin-friendly SQL snippets (Revoke/Extend/Reset)

এই file already ready আছে: [scripts/sql/admin-license-snippets.sql](scripts/sql/admin-license-snippets.sql)

ব্যবহার নিয়ম:
1. Supabase -> SQL Editor -> New Query
2. [scripts/sql/admin-license-snippets.sql](scripts/sql/admin-license-snippets.sql) খুলে দরকারি snippet copy করো
3. এই example key ব্যবহার করো: `INKF-U3VN-HR6G-EWXF`
4. Run করো

### 6.1 Key revoke

~~~sql
UPDATE license_keys
SET revoked = true
WHERE key = 'INKF-U3VN-HR6G-EWXF';
~~~

### 6.2 Re-enable revoked key

~~~sql
UPDATE license_keys
SET revoked = false
WHERE key = 'INKF-U3VN-HR6G-EWXF';
~~~

### 6.3 Extend expiry by 30 days

~~~sql
UPDATE license_keys
SET expires_at = COALESCE(expires_at, NOW()) + INTERVAL '30 days'
WHERE key = 'INKF-U3VN-HR6G-EWXF';
~~~

### 6.4 Lifetime license (no expiry)

~~~sql
UPDATE license_keys
SET expires_at = NULL
WHERE key = 'INKF-U3VN-HR6G-EWXF';
~~~

### 6.5 Device reset (all devices clear)

~~~sql
UPDATE license_keys
SET device_ids = '{}'
WHERE key = 'INKF-U3VN-HR6G-EWXF';
~~~

### 6.6 Remove one device id

~~~sql
UPDATE license_keys
SET device_ids = array_remove(device_ids, 'device_id_to_remove')
WHERE key = 'INKF-U3VN-HR6G-EWXF';
~~~

### 6.7 View key status

~~~sql
SELECT key, email, revoked, max_devices, device_ids, expires_at, last_activated_at, created_at
FROM license_keys
WHERE key = 'INKF-U3VN-HR6G-EWXF';
~~~

### 6.8 View recent activation logs

~~~sql
SELECT key, email, device_id, event, app_version, created_at
FROM activation_log
ORDER BY created_at DESC
LIMIT 100;
~~~

-----------------------------------

## 7) Bengali UX-friendly error message pack

তোমার UI-তে user-friendly বাংলা message ব্যবহার করলে conversion ভালো হয়।

Status:
1. নিচের mapping অনুযায়ী UI text/error messages code-এ already apply করা হয়েছে
2. Location: [src/app/page.tsx](src/app/page.tsx)

Recommended mapping:
1. not_activated -> এই ডিভাইস এখনো অ্যাক্টিভেট করা হয়নি
2. expired -> লাইসেন্স ভেরিফিকেশন মেয়াদ শেষ। আবার অনলাইনে ভেরিফাই করুন
3. max_devices -> এই key সর্বোচ্চ ডিভাইস সীমা পূর্ণ করেছে
4. revoked -> এই লাইসেন্স বাতিল করা হয়েছে
5. invalid_key -> লাইসেন্স key ভুল। আবার চেক করুন
6. offline_error -> সার্ভারে সংযোগ হয়নি। ইন্টারনেট চেক করুন
7. success -> লাইসেন্স সফলভাবে অ্যাক্টিভেট হয়েছে

UI label suggestion:
1. Activate InkFlow -> লাইসেন্স অ্যাক্টিভেশন
2. Email -> আপনার ইমেইল
3. License Key -> লাইসেন্স কী
4. Activate License -> এখনই অ্যাক্টিভেট করুন

-----------------------------------

## 8) Vercel এ আর কী লাগবে

তুমি env vars add করে ফেলেছ (good)।
এখন code change হলে redeploy করবে:
1. git push
2. Vercel auto deploy
অথবা
3. Vercel dashboard -> project -> Deployments -> Redeploy

-----------------------------------

## 9) End-to-end test checklist (must do)

### Admin side
1. Supabase table created
2. At least 1 license inserted
3. Key revoke/unrevoke test করা হয়েছে

### User side
1. Wrong key দিলে error আসে
2. Correct key দিলে unlock হয়
3. Page refresh এর পরও unlocked থাকে
4. Internet off করে grace period flow কাজ করে
5. max 2 device rule কাজ করে

-----------------------------------

## 10) Business flow (customer কে কীভাবে দিবে)

Recommended practical flow:
1. Customer payment complete
2. তুমি একটি নতুন key generate করবে
3. DB এ insert করবে customer email সহ
4. customer কে email করবে:
   - App URL
   - License key
   - activation steps
5. support issue হলে SQL snippets দিয়ে manage করবে

Email template example:

Subject: Your InkFlow License Key

Hello,
Thanks for your purchase.
Use the details below to activate InkFlow:
- Email: a3kmstudio@gmail.com
- License Key: INKF-XXXX-XXXX-XXXX
- App URL: https://foylx.vercel.app

Activation Steps:
1. Open app URL
2. Enter email and key
3. Click Activate

Support: support@yourdomain.com

-----------------------------------

## 11) Password system লাগবে কি?

Current system: No password required.
1. License key + email is enough
2. এটা fast onboarding

If তুমি password-based account system চাও:
1. NextAuth email/password provider add করতে হবে
2. users table add করতে হবে
3. signup/login/reset password flow বানাতে হবে
4. তারপর license কে account-এর সাথে link করা যাবে

এইটা আলাদা বড় feature, এখনকার deploy-এর জন্য বাধ্যতামূলক না।

-----------------------------------

## 12) আজকে তোমার exact কাজ (short)

1. Supabase এ base SQL run করো
2. `node scripts/generate-licenses.js` run করো
3. `generated-license-20.sql` Supabase এ run করো
4. live app এ 1টা key দিয়ে activation test করো
5. `scripts/sql/admin-license-snippets.sql` থেকে revoke test করো
6. সব pass হলে license system ready

### কীভাবে করবে, ছোট version
1. Supabase dashboard open করো
2. SQL Editor open করো
3. base table SQL paste + Run
4. VS Code Terminal এ `node scripts/generate-licenses.js` run
5. `generated-license-20.sql` open করে copy
6. Supabase SQL Editor এ paste + Run
7. Live site এ key দিয়ে activate test
8. `scripts/sql/admin-license-snippets.sql` দিয়ে revoke/extend test

-----------------------------------

## 13) Optional next upgrades

1. Admin panel page for key management
2. Auto email delivery after payment webhook
3. Device management UI
4. Analytics for activation/failure reasons
5. Bengali/English language toggle on activation screen

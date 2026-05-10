# InkFlow License System - Total Master Guide (Bangla)

এই guide একদম শুরু থেকে শেষ পর্যন্ত license system বুঝতে সাহায্য করবে।
এখানে আছে:
1. কেন license দরকার
2. user কীভাবে ব্যবহার করবে
3. developer/admin কী করবে
4. Supabase কোথায় কী সেট করবে
5. কোন file আগে খুলবে
6. কোন query কখন চালাবে
7. কী already হয়ে গেছে
8. কী এখনো তোমার করতে হবে

-----------------------------------

## 0) এখন কী already হয়ে গেছে

আমি project-এ already এই কাজগুলো করে দিয়েছি:
1. License activation gate app-এ যোগ করা হয়েছে: [src/app/page.tsx](src/app/page.tsx)
2. Bengali activation text + error mapping যোগ করা হয়েছে: [src/app/page.tsx](src/app/page.tsx)
3. 20 license key generate করার script তৈরি করা হয়েছে: [scripts/generate-licenses.js](scripts/generate-licenses.js)
4. Admin SQL snippets file তৈরি করা হয়েছে: [scripts/sql/admin-license-snippets.sql](scripts/sql/admin-license-snippets.sql)
5. Customer-specific workflow file তৈরি করা হয়েছে: [01_CUSTOMER_LICENSE_WORKFLOW_A3KMSTUDIO_BN](../04_customer/01_CUSTOMER_LICENSE_WORKFLOW_A3KMSTUDIO_BN.md)
6. Total newborn guide files update করা হয়েছে

Current example key:
- `INKF-U3VN-HR6G-EWXF`

Current customer email example:
- `a3kmstudio@gmail.com`

-----------------------------------

## 1) License system কেন দরকার

License system দিয়ে তুমি:
1. Paid access control করতে পারবে
2. One key কত device-এ চলবে সেটা ঠিক করতে পারবে
3. Key revoke করতে পারবে
4. Expiry দিতে পারবে
5. Customer support সহজ করতে পারবে

Without license:
1. সবাই unlimited use করতে পারবে
2. premium control করা কঠিন হবে

-----------------------------------

## 2) User experience কেমন হবে

Current flow:
1. User app খুলবে
2. Activation screen দেখাবে যদি license cache না থাকে
3. User email লিখবে
4. User license key লিখবে
5. Activate চাপবে
6. সফল হলে app unlock হবে

Important:
1. Password লাগে না
2. এই version-এ email + license key enough
3. Device limit, revoke, expiry সব Supabase দিয়ে control হবে

-----------------------------------

## 3) Developer হিসেবে তোমার role কী

তুমি admin/developer হিসেবে করবা:
1. Supabase-এ license row বানানো
2. Customer-কে key দেওয়া
3. Revoke/extend/reset করা
4. Logs check করা
5. Need হলে device reset করা

App নিজে যা করবে:
1. Activation verify করবে
2. Device id save করবে
3. Cache রাখবে
4. Offline grace period চেক করবে

-----------------------------------

## 4) Supabase setup - কোথায় থেকে শুরু করবে

### Step 1: Supabase open করো
1. যাও: https://supabase.com
2. Login করো
3. Project select করো
4. SQL Editor এ যাও

### Step 2: Base tables create করো
SQL Editor এ এটা run করো:

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

## 5) 20টা license key কীভাবে generate করবে

### Option A: Script run করা (recommended)
1. Terminal open করো
2. project root-এ থাকো
3. চালাও:

```powershell
node scripts/generate-licenses.js
```

Output হবে:
1. [generated-license-20.sql](generated-license-20.sql)
2. [generated-license-20.txt](generated-license-20.txt)

### Option B: Direct print

```powershell
node -e "const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const seg=n=>Array.from({length:n},()=>chars[Math.floor(Math.random()*chars.length)]).join('');for(let i=0;i<20;i++){console.log(`INKF-${seg(4)}-${seg(4)}-${seg(4)}`)}"
```

-----------------------------------

## 6) Generated SQL কীভাবে Supabase-এ run করবে

1. [generated-license-20.sql](generated-license-20.sql) open করো
2. পুরো content copy করো
3. Supabase SQL Editor এ New query খুলো
4. Paste করো
5. Run করো

এতে license_keys table-এ 20 row insert হবে।

-----------------------------------

## 7) Admin-friendly SQL snippets - কাজ কী

এই file already ready আছে: [scripts/sql/admin-license-snippets.sql](scripts/sql/admin-license-snippets.sql)

এই file-এর কাজ:
1. Revoke করা
2. আবার চালু করা
3. Expiry বাড়ানো
4. Lifetime বানানো
5. Devices reset করা
6. One device remove করা
7. Status দেখা
8. Activation logs দেখা

### Use করার নিয়ম
1. Supabase SQL Editor open করো
2. [scripts/sql/admin-license-snippets.sql](scripts/sql/admin-license-snippets.sql) থেকে দরকারি অংশ copy করো
3. Run করো

### Example key already filled
- `INKF-U3VN-HR6G-EWXF`

### Query types

#### A) Revoke
Key বন্ধ করে দেয়।
Use when:
1. Refund
2. Abuse
3. Key leak

#### B) Re-enable
আগে বন্ধ করা key আবার চালু করে।

#### C) Extend expiry
Subscription date বাড়ায়।

#### D) Lifetime
Expiry NULL করে lifetime access দেয়।

#### E) Device reset
সব registered device remove করে।

#### F) Remove one device
Specific device id remove করে।

#### G) View status
Key-এর current state দেখায়।

#### H) View logs
Recent activation history দেখায়।

-----------------------------------

## 8) Customer workflow - a3kmstudio@gmail.com

Customer email:
- `a3kmstudio@gmail.com`

এই customer-এর জন্য তোমার কাজ:
1. Supabase row তৈরি/verify করা
2. Key দেওয়া
3. Activate test করা
4. Logs দেখা
5. Need হলে revoke/extend/reset করা

### Suggested row values
- `email` = `a3kmstudio@gmail.com`
- `key` = `INKF-U3VN-HR6G-EWXF`
- `max_devices` = `2`
- `expires_at` = `NULL`
- `revoked` = `false`
- `device_ids` = `{}`

### Customer-কে কী দেবে
1. App URL: `https://foylx.vercel.app`
2. Email: `a3kmstudio@gmail.com`
3. License Key: `INKF-U3VN-HR6G-EWXF`

### Customer কী করবে
1. App খুলবে
2. Email লিখবে
3. Key লিখবে
4. Activate চাপবে

-----------------------------------

## 9) User activation flow - app কীভাবে কাজ করে

App open হলে:
1. আগে cache চেক করবে
2. Cache না থাকলে activation screen দেখাবে
3. User email + key দিলে Supabase verify করবে
4. Valid হলে device id save করবে
5. Next time একই device হলে cache দিয়ে খুলতে পারে

Offline হলে:
1. 7 দিনের grace period কাজ করবে
2. Cache recent হলে temporary access পাওয়া যাবে

-----------------------------------

## 10) Developer perspective - এখন কী কী set করতে হবে

### Supabase-এ set হওয়া উচিত
1. `license_keys` table
2. `activation_log` table
3. Row Level Security policies
4. At least 1 license row
5. Activation logs working

### Row fields মানে কী
1. `key` = actual license key
2. `email` = customer email
3. `device_ids` = activated device ids
4. `max_devices` = কত device allowed
5. `expires_at` = expiry date বা NULL
6. `revoked` = active কিনা
7. `last_activated_at` = last verification time

-----------------------------------

## 11) Error message কীভাবে বুঝবে

UI-তে Bengali messages already দেওয়া আছে:
1. Not activated -> এই ডিভাইস এখনো অ্যাক্টিভেট করা হয়নি
2. Expired -> লাইসেন্স ভেরিফিকেশন মেয়াদ শেষ
3. Max devices -> এই key সর্বোচ্চ ডিভাইস সীমা পূর্ণ করেছে
4. Revoked -> এই লাইসেন্স বাতিল করা হয়েছে
5. Invalid key -> লাইসেন্স key ভুল
6. Offline error -> সার্ভারে সংযোগ হয়নি
7. Success -> লাইসেন্স সফলভাবে অ্যাক্টিভেট হয়েছে

UI labels:
1. Activate InkFlow -> লাইসেন্স অ্যাক্টিভেশন
2. Email -> আপনার ইমেইল
3. License Key -> লাইসেন্স কী
4. Activate License -> এখনই অ্যাক্টিভেট করুন

-----------------------------------

## 12) Vercel deployment-এর পর কী করবে

Vercel এ env vars already add করা আছে।
Deploy হয়ে গেলে:
1. App open করো
2. Activation screen check করো
3. Customer key দিয়ে test করো
4. Success হলে done

Need হলে redeploy:
1. git push
2. Vercel auto deploy

-----------------------------------

## 13) Step-by-step testing order

এই order follow করো:
1. Supabase base SQL run
2. `node scripts/generate-licenses.js` run
3. `generated-license-20.sql` Supabase-এ run
4. Customer row verify
5. Live app-এ activation test
6. `device_ids` দেখো
7. Logs দেখো
8. Revoke test করো
9. Re-enable test করো
10. Device reset test করো

-----------------------------------

## 14) Trouble হলে কী দেখবে

### Problem 1: Activation fails
Check:
1. Key ঠিক আছে কি না
2. Email ঠিক আছে কি না
3. `revoked` false কি না
4. `expires_at` expired কি না
5. Supabase env ঠিক আছে কি না

### Problem 2: Max device error
Check:
1. `device_ids` কতগুলো আছে
2. `max_devices` কত
3. দরকার হলে device reset করো

### Problem 3: Revoked issue
Check:
1. `revoked = true` কি না
2. revoke হলে আবার activate হবে না

### Problem 4: Device new হলে
Check:
1. old device remove করতে হবে
2. `device_ids` reset করতে হতে পারে

-----------------------------------

## 15) Very short summary

তোমার main কাজগুলো:
1. Supabase tables run করা
2. 20 keys generate করা
3. SQL insert run করা
4. Customer email `a3kmstudio@gmail.com` দিয়ে license assign করা
5. Live app-এ activate test করা
6. প্রয়োজন হলে revoke/extend/reset করা

-----------------------------------

## 16) Relevant files

1. [src/app/page.tsx](src/app/page.tsx) - activation gate + Bengali messages
2. [scripts/generate-licenses.js](scripts/generate-licenses.js) - 20 key generator
3. [scripts/sql/admin-license-snippets.sql](scripts/sql/admin-license-snippets.sql) - revoke/extend/reset queries
4. [01_CUSTOMER_LICENSE_WORKFLOW_A3KMSTUDIO_BN](../04_customer/01_CUSTOMER_LICENSE_WORKFLOW_A3KMSTUDIO_BN.md) - customer-specific guide
5. [02_LICENSE_NEWBORN_GUIDE_BN](02_LICENSE_NEWBORN_GUIDE_BN.md) - simpler guide

-----------------------------------

## 17) Final note

এই guide-এর উদ্দেশ্য খুব simple:
1. beginner confusion কমানো
2. developer কাজ clear করা
3. customer flow সহজ করা
4. license operations easy রাখা

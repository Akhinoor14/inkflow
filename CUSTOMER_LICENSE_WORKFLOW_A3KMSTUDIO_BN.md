# InkFlow License Workflow for a3kmstudio@gmail.com

এই file টা developer perspective থেকে লেখা।
এখানে দেখানো আছে customer email `a3kmstudio@gmail.com` ব্যবহার করে কী কী করতে হবে, কোনটা automatic, কোনটা manual, আর কোনটা পরে test করতে হবে।

-----------------------------------

## 1) এই customer-এর জন্য তোমার role কী

তুমি developer/admin হিসেবে 3টা জিনিস handle করবে:
1. Supabase-এ license row create করবে
2. customer-কে license key দেবে
3. চাইলে revoke / extend / reset করবে

Customer যা করবে:
1. app খুলবে
2. নিজের email লিখবে
3. license key লিখবে
4. activate করবে

Important:
1. এখানে password লাগে না
2. email শুধু identity/record হিসেবে use হচ্ছে
3. আসল control হচ্ছে license key + device limit + expiry + revoke flag

-----------------------------------

## 2) এই customer-এর জন্য এখন কী set করা উচিত

Supabase row-তে এই values রাখো:

| Field | Value | Meaning |
|---|---|---|
| `email` | `a3kmstudio@gmail.com` | customer tracking/support |
| `key` | একটি generated key | activation code |
| `max_devices` | `2` | max 2 device use |
| `expires_at` | `NULL` | lifetime হলে |
| `revoked` | `false` | active থাকতে |
| `device_ids` | `{}` | প্রথম activation এর আগে empty |

-----------------------------------

## 3) এখন order কী হওয়া উচিত

### Step 1: Supabase row create/verify
1. Supabase dashboard open করো
2. SQL Editor open করো
3. `license_keys` টেবিলে এই customer email দিয়ে row আছে কি না দেখো
4. না থাকলে insert করো

Example:

```sql
INSERT INTO license_keys (key, email, max_devices, expires_at)
VALUES ('INKF-U3VN-HR6G-EWXF', 'a3kmstudio@gmail.com', 2, NULL);
```

### Step 2: customer-কে key send করো
customer কে এই 3টা জিনিস দেবে:
1. App URL: `https://foylx.vercel.app`
2. Email: `a3kmstudio@gmail.com`
3. License Key: `INKF-U3VN-HR6G-EWXF` (বা অন্য generated key)

### Step 3: customer app খুলবে
Customer এই flow follow করবে:
1. Vercel app open
2. email লিখবে
3. key লিখবে
4. Activate চাপবে
5. success হলে app unlock হবে

### Step 4: তুমি Supabase-এ verify করবে
Activation successful হলে check করবে:
1. `device_ids` array-তে device id যোগ হয়েছে কি না
2. `last_activated_at` update হয়েছে কি না
3. `activation_log`-এ row গেছে কি না

-----------------------------------

## 4) তুমি কোন কাজগুলো manual করবে

Manual কাজ:
1. customer email লিখে row verify করা
2. key customer-কে পাঠানো
3. revoke/extend/reset করা
4. সমস্যা হলে logs দেখা

Automatic কাজ:
1. প্রথম activation-এ device id save হওয়া
2. online verification
3. cache থাকলে next launch-এ unlock হওয়া
4. 7-day offline grace check

-----------------------------------

## 5) customer support perspective

যদি customer বলেন app open হচ্ছে না:
1. email ঠিক লিখেছে কি না দেখো
2. key ঠিক লিখেছে কি না দেখো
3. key revoked কি না দেখো
4. max device exceeded কি না দেখো
5. expiry শেষ হয়েছে কি না দেখো
6. Supabase-এ logs check করো

যদি customer new device এ ব্যবহার করতে চায়:
1. `device_ids` reset করো
2. অথবা `max_devices` বাড়াও

যদি refund/abuse issue হয়:
1. `revoked = true` করো
2. customer আর unlock করতে পারবে না

-----------------------------------

## 6) এই customer-এর জন্য quick checklist

1. Supabase row আছে
2. email = `a3kmstudio@gmail.com`
3. key active আছে
4. customer key পেয়েছে
5. live app-এ activate হয়ে গেছে
6. device_ids populated হয়েছে
7. test revoke/reenable done

-----------------------------------

## 7) Final note

এই file-এর purpose খুব simple:
1. customer email specific workflow রাখা
2. developer কি করবে সেটা clear রাখা
3. manual vs automatic আলাদা করা
4. next time confusion কমানো

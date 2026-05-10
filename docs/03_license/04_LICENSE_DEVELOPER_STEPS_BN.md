# InkFlow License - Developer Steps

এই file developer/admin-এর জন্য।

## 1) Supabase setup
1. Supabase open করো
2. SQL Editor এ যাও
3. base tables run করো

## 2) License keys generate
1. Terminal open করো
2. চালাও:

```powershell
node scripts/generate-licenses.js
```

3. `generated-license-20.sql` file তৈরি হবে
4. সেটা copy করে Supabase SQL Editor এ run করো

## 3) Customer assign
1. customer email নাও
2. generated list থেকে 1টা key নাও
3. ওই key Supabase row-তে থাকছে কি না verify করো
4. customer-কে same key দাও

## 4) customer email example
- `a3kmstudio@gmail.com`

## 5) key selection rule
1. 20টা generated key-এর যেকোনো 1টা নিতে পারো
2. তবে যেটা customer-কে দেবে, সেটাই DB row-তে থাকতে হবে
3. যদি নতুন key বানাও, আগে DB-তে insert করতে হবে

## 6) maintenance
### Revoke
- refund / abuse হলে `revoked = true`

### Re-enable
- ভুল revoke হলে `revoked = false`

### Extend
- expiry বাড়াতে চাইলে 30 days add করো

### Reset devices
- নতুন device allow করতে `device_ids = '{}'`

### Logs
- activation history দেখতে `activation_log` দেখো

## 7) testing order
1. row আছে কি না দেখো
2. app-এ activate test করো
3. device_ids populated হয়েছে কি না দেখো
4. logs দেখো
5. revoke test করো
6. re-enable test করো

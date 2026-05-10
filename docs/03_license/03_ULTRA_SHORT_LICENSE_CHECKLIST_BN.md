# InkFlow License - Ultra Short Checklist

## যা already done
1. License system app-এ connect করা আছে
2. Bengali UI messages যোগ করা আছে
3. 20টা license key generate করা আছে
4. Admin SQL snippets file ready আছে

## এখন তোমার কাজ
1. Supabase এ base SQL run করো
2. 20টা key insert করো
3. 1 key customer-কে দাও
4. Live app-এ activate test করো
5. Revoke / re-enable test করো

## exact order
1. Supabase SQL Editor খোলো
2. base table SQL run করো
3. terminal এ চালাও:

```powershell
node scripts/generate-licenses.js
```

4. generated-license-20.sql Supabase এ run করো
5. customer row verify করো
6. app-এ key দিয়ে activation test করো
7. logs দেখো
8. revoke test করো
9. আবার re-enable করো

## key কোনটা use করবে?
1. 20টা generated key-এর যেকোনো 1টা use করবে
2. DB row-তে key আর customer-কে দেওয়া key একই হতে হবে
3. random নতুন key দিলে হবে না যদি সেটা DB-তে insert না করো

## simple rule
- Generate key -> DB insert -> customer-কে same key দাও

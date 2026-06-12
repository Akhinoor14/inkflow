# Environment Variables - Checklist & Copy-Paste Template

এই file ব্যবহার করে environment variables collect করতে পারবে।

---

## Step 1: তোমার values এখানে fill করো

### Google OAuth (https://console.cloud.google.com থেকে)

```env
GOOGLE_CLIENT_ID=_______________________________
GOOGLE_CLIENT_SECRET=_______________________________
```

### Supabase (https://supabase.com থেকে)

```env
NEXT_PUBLIC_SUPABASE_URL=_______________________________
NEXT_PUBLIC_SUPABASE_ANON_KEY=_______________________________
```

---

## Step 2: যখন সব fill করে দিবে

যখন উপরের সব fields fill হয়ে যাবে, এই command দাও:

```powershell
# .env.local update করার জন্য (manually করতে পারবে, নাহলে Copilot করে দেবে)
```

---

## Step 3: Verify

এই command দিয়ে variables সঠিক আছে কি দেখো:

```powershell
# Linux/Mac
grep "GOOGLE_CLIENT_ID\|SUPABASE_URL" .env.local

# Windows PowerShell
Select-String "GOOGLE_CLIENT_ID|SUPABASE_URL" .env.local
```

Expected output:
```
GOOGLE_CLIENT_ID=xyz123...
NEXT_PUBLIC_SUPABASE_URL=https://abc123...
```

---

## Step 4: Local test

```powershell
npm run dev
```

এ যেতে হবে:
1. `http://localhost:3000` ওপেন হবে
2. Google login button দেখবে (যদি Google setup করা থাকে)
3. কোনো error না আসলে successful

---

## Important Note

তোমার `.env.local` এ থাকা secrets কখনও GitHub এ push করবে না।

`.gitignore` তে `.env.local` আছে কিনা check করো:

```powershell
Select-String ".env.local" .gitignore
```

---

## Ready for next step?

যখন সব values ready থাকবে, বলো: "environment variables ready"

তখন Copilot:
1. .env.local automatically update করবে
2. Local test করবে
3. Vercel setup guide দেবে

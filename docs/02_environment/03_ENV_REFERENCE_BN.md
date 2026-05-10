# .env.local - Final Reference (Bangla)

এই ফাইলে দেখাচ্ছি final .env.local কিভাবে দেখতে হবে।

---

## Complete .env.local Template

```env
# ════════════════════════════════════════════════════════════════════
# REQUIRED - Local development চলানোর জন্য (Level 1)
# ════════════════════════════════════════════════════════════════════

# Auto-generated secret (কখনও share করবে না)
NEXTAUTH_SECRET=abc123def456xyz789abcdefghijklmnop1234567890

# যেখানে app চলছে
NEXTAUTH_URL=http://localhost:3000


# ════════════════════════════════════════════════════════════════════
# GOOGLE OAUTH - Drive Sync (Level 2)
# ════════════════════════════════════════════════════════════════════
# https://console.cloud.google.com থেকে পাবে
# YouTube: "Google OAuth setup" খোলো কনফিউজড হলে

GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrst.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrst


# ════════════════════════════════════════════════════════════════════
# SUPABASE - License & Activation (Level 3, Optional)
# ════════════════════════════════════════════════════════════════════
# https://supabase.com থেকে পাবে
# License system চাইলে এটা লাগবে

NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM2RlZjQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM0NTY3ODkwLCJleHAiOjE5NTA5Mzc4OTB9.aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890


# ════════════════════════════════════════════════════════════════════
# OPTIONAL - Premium APIs (এখন disable করা আছে, দরকার হলে পরে enable)
# ════════════════════════════════════════════════════════════════════

# Azure Ink Recognizer ($1 per 1000 calls) - better handwriting recognition
NEXT_PUBLIC_AZURE_INK_KEY=

# Google Vision API ($1.50 per 1000 images) - better OCR
NEXT_PUBLIC_GOOGLE_VISION_KEY=

# MyScript iinkJS (~$500/year) - real-time handwriting recognition
NEXT_PUBLIC_MYSCRIPT_KEY=
```

---

## কোথায় কোন value?

| Variable | কোথায় পাবে | কেন লাগে |
|---|---|---|
| `NEXTAUTH_SECRET` | Generate করা (ইতিমধ্যে done) | User session encrypt |
| `NEXTAUTH_URL` | তুমি decide করবে | App URL |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | Drive sync এ user login |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | Drive sync authentication |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard | License database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard | License database access |

---

## যখন Vercel deploy করবে

`.env.local` এর এই values Vercel dashboard এ add করতে হবে:

1. Vercel project settings -> Environment Variables
2. এর অধীন এই 6টা add করো:
   - NEXTAUTH_SECRET ✅
   - NEXTAUTH_URL = `https://your-vercel-domain.vercel.app`
   - GOOGLE_CLIENT_ID ✅
   - GOOGLE_CLIENT_SECRET ✅
   - NEXT_PUBLIC_SUPABASE_URL ✅
   - NEXT_PUBLIC_SUPABASE_ANON_KEY ✅

---

## Security best practice

### DO
✅ `.env.local` use করো locally development এ
✅ `.env.local` add করো `.gitignore` এ
✅ Vercel dashboard এ environment variables add করো (git এ না)
✅ Secret values (NEXTAUTH_SECRET, CLIENT_SECRET) কখনও share করবে না

### DO NOT
❌ `.env.local` GitHub এ push করবে না
❌ Console log এ secret values print করবে না
❌ Secret values দিয়ে commit messages write করবে না
❌ Public repositories এ secret values রাখবে না

---

## Notes

- `NEXT_PUBLIC_*` = browser এ visible হবে (public)
- Private vars = server-only থাকবে (secret)
- Vercel automatically `.env.local` load করে না
- Vercel দে manually environment variables add করতে হয়

---

## When ready

যখন সব values fill করবে, বলো:

"I have filled all environment variables"

তখন আমি:
1. Verify করব values valid আছে
2. Local test করব
3. Vercel deployment step শেখাব

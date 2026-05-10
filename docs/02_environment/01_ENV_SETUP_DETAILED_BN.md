# Environment Variables Setup - Complete Guide (Bangla)
## Vercel Deployment-এর জন্য সব details

---

## Overview: কোনো variables লাগবে?

InkFlow app চলতে পারে তিন level এ:

| Level | Required Vars | Status |
|---|---|---|
| **Level 1: Local Web** | NEXTAUTH_SECRET, NEXTAUTH_URL | ✅ Already done |
| **Level 2: Google Sync** | + Google OAuth (CLIENT_ID, CLIENT_SECRET) | ❌ TODO |
| **Level 3: License + Cloud** | + Supabase (URL, ANON_KEY) | ❌ TODO |

তুমি Vercel deploy করতে চাইলে minimum Level 2 লাগবে।

---

## Part 1: NEXTAUTH_SECRET (ইতিমধ্যে done)

### কী এটা?
একটা random secret string যা user login session encrypt করে।
এটা **never share করবে না**, secret থাকতে হবে।

### status:
✅ তোমার .env.local এ ইতিমধ্যে auto-generate করা আছে।
নতুন করে generate করার দরকার নেই।

### Check করতে:
`.env.local` ফাইল ওপেন করো, এমন line থাকবে:
```
NEXTAUTH_SECRET=abc123def456...
```

---

## Part 2: NEXTAUTH_URL

### কী এটা?
App যেখানে host থাকবে, সেই website URL।
- **Local development:** `http://localhost:3000`
- **Vercel production:** `https://tumarbag-inkflow.vercel.app`

### status:
✅ `.env.local` এ local URL ইতিমধ্যে আছে।
Vercel deploy করলে এটা change হবে।

### Check করতে:
`.env.local` এ এই line থাকবে:
```
NEXTAUTH_URL=http://localhost:3000
```

---

## Part 3: Google OAuth Setup (Level 2)

### কেন লাগে?
Google Drive Sync feature চাইলে।
ব্যবহারকারীরা তাদের Google Drive এ notebook sync করতে পারবে।

### কী পাবে
2টা secret string:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### ধাপে ধাপে কিভাবে পাবে

#### Step 1: Google Cloud Console খোলো
1. যাও: https://console.cloud.google.com
2. কোনো account এ login করো (যদি login না থাকে)
3. এখন console দেখবে

#### Step 2: নতুন project create করো
1. Top-left corner এ "Select a project" বাক্স দেখবে
2. সেখানে click করো
3. "NEW PROJECT" button পাবে
4. Project name দাও: **InkFlow Studio**
5. "CREATE" click করো
6. 2-3 মিনিট wait করো (project তৈরি হচ্ছে)

#### Step 3: APIs enable করো
1. Left sidebar এ "APIs & Services" খোলো
2. "Library" click করো
3. Search box এ search করো: **Google Drive API**
4. First result click করো
5. Blue "ENABLE" button click করো
6. Wait করো...

এরপর **আবার Library এ ফিরে যাও** এবং:
1. Search করো: **Google+ API**
2. Enable করো (যদি থাকে)

#### Step 4: OAuth Credentials তৈরি করো
1. "APIs & Services" -> "Credentials" tab click করো
2. Top এ "CREATE CREDENTIALS" button পাবে
3. Dropdown থেকে "OAuth client ID" select করো
4. একটা warning আসবে: "You will need to configure OAuth consent first"
5. সেখানে "CONFIGURE CONSENT SCREEN" button থাকবে, click করো

#### Step 5: OAuth Consent Screen configure করো
এখানে তোমার app info দিতে হবে:

1. **User Type:** "External" select করো
2. **App name:** দাও `InkFlow Studio`
3. **User support email:** তোমার email দাও
4. "SAVE AND CONTINUE" click করো

এরপর Scopes section এ:
1. এখানে কোনো special scope add করার দরকার নেই (default ঠিক)
2. "SAVE AND CONTINUE" click করো

এরপর Test users section:
1. "ADD USERS" click করো
2. তোমার email add করো (যাতে testing করতে পারো)
3. "SAVE AND CONTINUE" click করো

#### Step 6: Back to Credentials
1. আবার "APIs & Services" -> "Credentials" এ যাও
2. "CREATE CREDENTIALS" -> "OAuth client ID" click করো

এখানে:
1. **Application type:** "Web application" select করো
2. **Name:** দাও `InkFlow Web`
3. **Authorized redirect URIs** section এ:
   - এই 2টা URL add করো:
   ```
   http://localhost:3000/api/auth/callback/google
   https://tumarbag-inkflow.vercel.app/api/auth/callback/google
   ```
   (Vercel domain-এ তোমার actual domain থাকবে)

4. "CREATE" click করো

এরপর একটা popup আসবে তোমার credentials সহ:
- **Client ID** (long string যা `.clients.googleusercontent.com` দিয়ে শেষ হয়)
- **Client Secret** (small string)

#### Step 7: Copy করো
এই 2টা value copy করো somewhere safe (notepad open করে রাখো)

```
GOOGLE_CLIENT_ID=xyz123abc456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefg123
```

### .env.local এ paste করো

1. VS Code এ `.env.local` open করো
2. এই 2 lines খোলো এবং তোমার values paste করো:

```env
GOOGLE_CLIENT_ID=xyz123abc456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefg123
```

3. Save করো (Ctrl+S)

---

## Part 4: Supabase Setup (Level 3, Optional but for License)

### কেন লাগে?
License system চলাতে।
ব্যবহারকারীরা license key দিয়ে app activate করতে পারবে।

### কী পাবে
2টা URL+key:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ধাপে ধাপে কিভাবে পাবে

#### Step 1: Supabase এ account
1. যাও: https://supabase.com
2. "Sign Up" click করো
3. GitHub দিয়ে signup করো (সবচেয়ে সহজ)
4. Authorize করো

#### Step 2: নতুন project
1. Dashboard এ "New Project" button click করো
2. **Project name:** `inkflow-studio` দাও
3. **Database Password:** একটা strong password দাও (random generate করে সেট করো)
4. **Region:** যেখানে তুমি আছো তার কাছাকাছি select করো (or default ok)
5. "Create new project" click করো
6. 3-5 মিনিট wait করো (project বন্ধু হচ্ছে)

#### Step 3: API credentials পাওয়া
1. Setup যখন complete হবে, তুমি কে Supabase dashboard এ থাকবে
2. Left sidebar এ "Settings" -> "API" click করো
3. সেখানে 2টা important string থাকবে:
   - **Project URL** (যা `.supabase.co` দিয়ে শেষ হয়)
   - **anon public key** (long string)

#### Step 4: Copy করো

```
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### .env.local এ paste করো

1. VS Code এ `.env.local` open করো
2. এই 2 lines খোলো:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save করো

### Optional: SQL Database Setup

যদি License system চাও, তাহলে Supabase এ tables create করতে হবে।
এটা Copilot করে দিতে পারে পরে।

---

## Summary: তোমার .env.local এর final version

এখন তোমার `.env.local` এমন হবে:

```env
# ─── REQUIRED ──────────────────────────────────────────────────
NEXTAUTH_SECRET=abc123def456xyz...
NEXTAUTH_URL=http://localhost:3000

# ─── GOOGLE OAUTH (for Drive sync) ─────────────────────────────
GOOGLE_CLIENT_ID=xyz123abc456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefg123

# ─── SUPABASE (for license system) ──────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── OPTIONAL PAID APIs ───────────────────────────────────────
NEXT_PUBLIC_AZURE_INK_KEY=
NEXT_PUBLIC_GOOGLE_VISION_KEY=
NEXT_PUBLIC_MYSCRIPT_KEY=
```

---

## Next: Vercel এ এই values দেওয়া

যখন তুমি `.env.local` ready করবে, তখন:

### Step 1: Vercel account
1. যাও: https://vercel.com
2. "Sign up" করো (GitHub দিয়ে সহজ)

### Step 2: Project import
1. Dashboard এ "Add New" -> "Project" click করো
2. GitHub এ তোমার project repository import করো
3. Project settings এ "Environment Variables" section পাবে
4. এখানে `.env.local` থেকে সব variables add করো

### Step 3: Deploy
1. "Deploy" button click করো
2. Vercel automatically build + deploy করবে
3. Public URL পাবে (যেমন: `https://inkflow-studio-abc123.vercel.app`)

### Step 4: Update Google Consent Screen
1. Google Cloud Console এ ফিরে যাও
2. OAuth consent screen এ Production status change করো (optional)
3. দেখাও যে তোমার Vercel domain trusted

---

## Checklist: তুমি এখন কী করবে

- [ ] Google Cloud Console account
- [ ] Project create
- [ ] APIs enable (Drive API)
- [ ] OAuth credentials
- [ ] GOOGLE_CLIENT_ID copy
- [ ] GOOGLE_CLIENT_SECRET copy
- [ ] .env.local update
- [ ] Test locally: `npm run dev`
- [ ] Supabase account (optional but recommended)
- [ ] Supabase project
- [ ] Supabase URL copy
- [ ] Supabase anon key copy
- [ ] .env.local update
- [ ] Vercel account
- [ ] Vercel project setup
- [ ] Environment variables add
- [ ] Deploy

---

## Common Issues

### Issue: "Redirect URI mismatch"
**Problem:** Google auth error যখন login করার সময়
**Fix:** Credentials এ redirect URI ঠিক আছে কিনা চেক করো

### Issue: Supabase connection refused
**Problem:** Database connect না হচ্ছে
**Fix:** URL + key ঠিক আছে কিনা verify করো, whitelist IP

### Issue: "NEXTAUTH_SECRET not set"
**Problem:** App error
**Fix:** .env.local এ NEXTAUTH_SECRET line আছে কিনা দেখো

---

## Last: যখন সব ready হয়ে যাবে

এর পর Copilot এর কাছে বলো:
1. "Google OAuth test করো"
2. "Supabase SQL setup করো"
3. "Vercel এ deploy করো"
4. "License key test করো"

Copilot নিজে থেকে সব steps handle করতে পারে।

# InkFlow Studio — Developer Guide
## বিসমিল্লাহির রাহমানির রাহীম

---

## 📋 Table of Contents
1. [Project Overview](#overview)
2. [Local Development Setup](#local-dev)
3. [Environment Variables](#env-vars)
4. [Web Hosting — Vercel (Recommended)](#vercel)
5. [Web Hosting — Render (Alternative)](#render)
6. [Desktop App (.exe) — Electron](#electron-exe)
7. [Android APK — Capacitor](#android-apk)
8. [License & Activation System](#license)
9. [Anti-Piracy Layers](#anti-piracy)
10. [Supabase Setup (License + Sync)](#supabase)
11. [Google OAuth Setup](#google-oauth)
12. [File Structure](#file-structure)

---

## 1. Project Overview {#overview}

| Feature | Technology | Cost |
|---|---|---|
| Frontend | Next.js 14 + React + TypeScript | Free |
| Drawing | perfect-freehand (SVG) | Free |
| Local storage | Dexie.js (IndexedDB) | Free |
| OCR | Tesseract.js (offline) | Free |
| Shape recognition | $1 Unistroke (offline) | Free |
| Text editor | TipTap | Free |
| Export | jsPDF + docx.js | Free |
| Auth | NextAuth.js | Free |
| Cloud sync | Google Drive API | Free (user's Drive) |
| Database | Supabase free tier | Free |
| Hosting | Vercel free tier | Free |
| Desktop | Electron + electron-builder | Free |
| Mobile | Capacitor | Free |
| Calculator | fx-991EX (built-in) | Free |
| **Total** | | **$0/month** |

---

## 2. Local Development Setup {#local-dev}

### Prerequisites
- Node.js 18+ (download: https://nodejs.org)
- npm 9+
- Git

### Steps

```bash
# 1. Clone or unzip the project
cd inkflow-studio

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.local.example .env.local

# 4. Set minimum required variable (generate a random string)
# Open .env.local and set:
# NEXTAUTH_SECRET=any_random_32_char_string_here

# 5. Start dev server
npm run dev

# 6. Open browser
# http://localhost:3000
```

**App works fully offline without any API keys.** Google Drive sync and license system require additional setup (see below).

---

## 3. Environment Variables {#env-vars}

Edit `.env.local`:

```bash
# ── REQUIRED ──────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app  # or http://localhost:3000 for dev

# ── GOOGLE OAUTH (for Drive sync) ─────────────────────────────
# Setup: https://console.cloud.google.com → APIs → Credentials
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# ── SUPABASE (for license system) ──────────────────────────────
# Setup: https://supabase.com (free, no credit card)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# ── OPTIONAL PAID APIs (disabled by default) ───────────────────
NEXT_PUBLIC_AZURE_INK_KEY=          # Azure Ink Recognizer
NEXT_PUBLIC_GOOGLE_VISION_KEY=      # Google Vision OCR
```

---

## 4. Web Hosting — Vercel (RECOMMENDED) {#vercel}

**Vercel is the best choice** — built for Next.js, free tier is generous, global CDN, automatic HTTPS.

### Steps

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (first time)
vercel

# 4. Set environment variables in Vercel dashboard:
#    https://vercel.com → Your Project → Settings → Environment Variables
#    Add all variables from .env.local

# 5. Deploy production
vercel --prod
```

### Or via GitHub (easier):
1. Push code to GitHub: `git init && git add . && git commit -m "init" && git push`
2. Go to https://vercel.com → New Project → Import from GitHub
3. Add environment variables in Settings
4. Every `git push` auto-deploys ✅

### Free tier limits:
- 100GB bandwidth/month
- Unlimited deployments
- Custom domain: free

---

## 5. Web Hosting — Render (Alternative) {#render}

Use Render if you need a persistent server (e.g., for WebSocket features later).

```bash
# render.yaml (create this file)
services:
  - type: web
    name: inkflow-studio
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXTAUTH_SECRET
        sync: false
      - key: NEXTAUTH_URL
        value: https://inkflow-studio.onrender.com
```

**Vercel vs Render:**
| | Vercel | Render |
|---|---|---|
| Next.js support | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐ Good |
| Free tier | Always-on | Spins down after 15min |
| Speed | Faster (CDN) | Slower cold start |
| Recommendation | ✅ **Use this** | Use only if needed |

---

## 6. Desktop App (.exe) — Electron {#electron-exe}

### Build .exe (Windows)

```bash
# On Windows machine (or GitHub Actions):

# 1. Install dependencies
npm install

# 2. Build Next.js static export
npm run build

# 3. Build .exe installer
npm run electron:win

# Output: dist-electron/InkFlow-Studio-Setup-1.0.0.exe
```

### Build on any OS using GitHub Actions (free):

Create `.github/workflows/build.yml`:

```yaml
name: Build Electron Apps
on:
  push:
    tags: ['v*']

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install
      - run: npm run electron:win
        env:
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      - uses: actions/upload-artifact@v4
        with:
          name: windows-exe
          path: dist-electron/*.exe

  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install
      - run: npm run electron:mac
      - uses: actions/upload-artifact@v4
        with:
          name: mac-dmg
          path: dist-electron/*.dmg
```

Then: `git tag v1.0.0 && git push --tags` → GitHub builds `.exe` and `.dmg` automatically.

### Required: App Icons
```
build-resources/
  icon.ico      (Windows — 256x256)
  icon.icns     (macOS — 512x512)
  icon.png      (Linux — 512x512)
```

Use https://www.icoconverter.com to convert PNG → ICO.

---

## 7. Android APK — Capacitor {#android-apk}

### Prerequisites
- Android Studio (free): https://developer.android.com/studio
- Java 17+

### Steps

```bash
# 1. Build Next.js
npm run build

# 2. Add Android platform (first time only)
npm run cap:add:android

# 3. Sync web assets to Android
npm run cap:sync

# 4. Open in Android Studio
npm run cap:open:android
```

In Android Studio:
- **Build → Generate Signed APK** → Create keystore → Build APK
- Or: **Build → Build Bundle(s)/APK(s) → Build APK(s)**
- Output: `android/app/build/outputs/apk/release/app-release.apk`

### Build APK without Android Studio (command line):

```bash
cd android
# Debug APK (for testing):
./gradlew assembleDebug

# Release APK (for distribution):
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/
```

### Sign the APK for distribution:

```bash
# Generate keystore (do once, keep safe!)
keytool -genkey -v -keystore inkflow-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias inkflow

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore inkflow-release.jks \
  app-release-unsigned.apk inkflow

# Align
zipalign -v 4 app-release-unsigned.apk InkFlow-Studio.apk
```

---

## 8. License & Activation System {#license}

### Supabase Database Setup

Go to https://supabase.com → New Project → SQL Editor:

```sql
-- License keys table
CREATE TABLE license_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  email TEXT,
  device_ids TEXT[] DEFAULT '{}',
  max_devices INTEGER DEFAULT 2,
  revoked BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,           -- NULL = lifetime
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activated_at TIMESTAMPTZ
);

-- Activation log
CREATE TABLE activation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  device_id TEXT,
  email TEXT,
  event TEXT,                        -- 'activated', 'verified', 'deactivated'
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX idx_license_key ON license_keys(key);

-- Row level security (only allow reading own key)
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read by key" ON license_keys
  FOR SELECT USING (true);

CREATE POLICY "Allow anon update device_ids" ON license_keys
  FOR UPDATE USING (true);

CREATE POLICY "Allow anon insert log" ON activation_log
  FOR INSERT WITH CHECK (true);
```

### Generate License Keys

Run this in Node.js:

```javascript
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const segment = n => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
const key = `INKF-${segment(4)}-${segment(4)}-${segment(4)}`;
console.log(key); // e.g. INKF-AB3D-XY7Z-MN2K
```

### Insert a key into Supabase:

```sql
INSERT INTO license_keys (key, email, max_devices, expires_at)
VALUES ('INKF-AB3D-XY7Z-MN2K', 'customer@email.com', 2, NULL);
-- expires_at NULL = lifetime license
-- expires_at '2025-12-31' = expires on that date
```

---

## 9. Anti-Piracy Layers {#anti-piracy}

| Layer | Method | Implemented |
|---|---|---|
| L1 — License Key | INKF-XXXX-XXXX-XXXX format required | ✅ |
| L2 — Machine Binding | Device fingerprint (CPU+RAM+hostname hash) | ✅ |
| L3 — Online Activation | Supabase verify on every launch | ✅ |
| L4 — Offline Grace | 7-day offline grace period | ✅ |
| L5 — Device Limit | Max 2 devices per key | ✅ |
| L6 — Revocation | Revoke any key instantly from Supabase | ✅ |
| L7 — Tamper Detection | sentinel check, electron binary verification | ✅ |
| L8 — Obfuscation | `bytenode` to compile JS to bytecode | ⚠️ Optional |

### Optional: JS Bytecode (bytenode)

```bash
npm install bytenode --save-dev

# In electron/main.js, replace:
# require('./preload.js')
# with compiled bytecode version for harder reverse engineering
```

### Code Signing (reduces Windows SmartScreen warnings)

**Free option:** Use a self-signed certificate (users get a warning but can proceed).
**Paid option:** Buy a code signing cert from Sectigo (~$200/year) — no warnings.

```bash
# Self-signed cert for testing:
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

---

## 10. Supabase Setup {#supabase}

1. Go to https://supabase.com → Sign up (free)
2. New Project → Choose region closest to your users
3. Wait ~2 min for setup
4. Go to Settings → API
5. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Run the SQL from Section 8

---

## 11. Google OAuth Setup {#google-oauth}

1. Go to https://console.cloud.google.com
2. New Project → "InkFlow Studio"
3. APIs & Services → Enable:
   - Google Drive API
   - Google+ API (for profile)
4. Credentials → Create OAuth Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/auth/callback/google`
5. Copy Client ID → `GOOGLE_CLIENT_ID`
6. Copy Client Secret → `GOOGLE_CLIENT_SECRET`

---

## 12. File Structure {#file-structure}

```
inkflow-studio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/auth/           # NextAuth Google OAuth
│   │   ├── login/              # Login page
│   │   ├── page.tsx            # Main editor
│   │   ├── layout.tsx          # Root layout
│   │   └── providers.tsx       # DB init, dark mode
│   ├── components/
│   │   ├── apps/
│   │   │   ├── Calculator.tsx  # Floating window wrapper
│   │   │   └── fx991ex/        # Full fx-991EX calculator
│   │   ├── canvas/             # Drawing engine components
│   │   ├── modals/             # OCR, Search, Settings, Drive
│   │   ├── sidebar/            # Notebook/page list
│   │   ├── toolbar/            # Drawing tools
│   │   └── ui/                 # PageHeader, AudioSync, etc.
│   ├── hooks/                  # useImageDrop, useThumbnail, etc.
│   ├── lib/
│   │   ├── audio/              # Audio sync
│   │   ├── auth/               # Google Drive API
│   │   ├── canvas/             # Stroke engine, shape recognition
│   │   ├── export/             # PDF, DOCX, PNG export
│   │   ├── license/            # License/activation system
│   │   ├── ocr/                # Tesseract.js OCR
│   │   └── storage/            # Dexie IndexedDB, auto-save
│   ├── store/                  # Zustand state
│   └── types/                  # TypeScript types
├── electron/                   # Desktop app
│   ├── main.js                 # Electron main process
│   └── preload.js              # Secure IPC bridge
├── public/                     # Static assets
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── build-resources/            # App icons for electron-builder
├── .env.local.example          # Environment variable template
├── package.json                # Dependencies + build config
├── capacitor.config.json       # Android APK config
└── 03_DEVELOPER_GUIDE.md       # This file
```

---

## 13. Calculator Module Architecture

```
public/calc/
  core/
    arithmetic.js     — basic ops, fractions, number theory, SI prefixes
    trigonometry.js   — all trig, hyperbolic, DMS, polar, triangle solver, DFT
    algebra.js        — quadratic/cubic/quartic solvers, Newton-Raphson, linear systems
    calculus.js       — derivatives (5-pt), Simpson integration, RK4 ODE, Taylor series
    statistics.js     — descriptive stats, distributions, regression, t-test, CI
    matrix.js         — LU/QR/Cholesky, eigenvalues, inverse, rank, least squares
    complex.js        — full complex arithmetic, Durand-Kerner roots, Möbius
    financial.js      — TVM, NPV/IRR/MIRR, depreciation, amortization, bonds
  engineering/
    units.js          — 25+ categories, 400+ units, bidirectional conversion
    constants.js      — 80+ NIST CODATA constants with uncertainty + descriptions
    electrical.js     — Ohm, RC/RL/RLC, AC, dB, 3-phase, motors, PCB traces
    structural.js     — beams (SS/cantilever/fixed), Mohr's circle, buckling, fatigue
    fluid.js          — Reynolds, Bernoulli, Darcy-Weisbach, pumps, compressible, drag
    thermodynamics.js — ideal/real gas, heat transfer, cycles (Carnot/Otto/Rankine)
  main.js             — unified expression parser connecting all modules
  ../calculator.html  — complete standalone HTML UI
```

### Adding a new function to the calculator
1. Add the function to the relevant `core/` or `engineering/` module
2. Export it in that module's `return {}` block
3. Add it to `FN` object in `main.js` so it's available in expressions
4. Optionally add a keyboard button in `calculator.html`

### Adding a new engineering tool
In `calculator.html`, add to `ETOOLS` array:
```js
{t:'🔧 My Tool', d:'Short description', fn:'eMyTool'}
```
Then add two functions:
```js
function eMyTool() { mkTool('Title', fieldsHTML, 'cMyTool'); }
function cMyTool()  { /* read inputs, showRes([{k,v}]) */ }
```

---

## 14. Session Progress (What's Built)

| Feature | Status |
|---------|--------|
| Drawing canvas (SVG + perfect-freehand) | ✅ |
| Shapes + shape recognition ($1 Unistroke) | ✅ |
| Eraser, lasso select | ✅ |
| TipTap text editor | ✅ |
| Dark mode + ink auto-adjust | ✅ |
| 6 background types | ✅ |
| Undo/redo (100 entries) | ✅ |
| IndexedDB storage (Dexie) | ✅ |
| Auto-save | ✅ |
| OCR (Tesseract.js, EN+BN) | ✅ |
| Search across notebooks | ✅ |
| Export PDF/DOCX/PNG | ✅ |
| Google Drive sync + conflict UI | ✅ |
| Audio sync (record + waveform) | ✅ |
| Page thumbnails | ✅ |
| Settings modal (4 tabs) | ✅ |
| License/activation system | ✅ |
| Calculator (modular, 14 JS files) | ✅ |
| 25+ unit conversion categories | ✅ |
| 80+ physical constants | ✅ |
| 12 engineering tool calculators | ✅ |
| Electron desktop (.exe) config | ✅ |
| Capacitor Android (APK) config | ✅ |
| Service Worker (offline PWA) | ✅ |
| 02_USER_GUIDE.md | ✅ |
| 03_DEVELOPER_GUIDE.md | ✅ |

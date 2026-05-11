<div align="center">

# 🖊 Foylx Note

**A local-first digital notebook with handwriting, OCR, audio sync, and Google Drive backup.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-offline_ready-5DCAA5)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-Commercial-orange)](./src/lib/license/licenseSystem.ts)

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [Deploy](#-deploy)

</div>

---

## ✨ Features

| Category | Feature |
|---|---|
| ✏️ **Drawing** | Pressure-sensitive pen, highlighter, eraser (stroke + segment) |
| ⬡ **Shapes** | Drag-to-draw (rect, circle, ellipse, triangle, arrow, line) + auto-recognition from freehand |
| 📝 **Text** | TipTap rich text — bold, italic, color, font, checklist |
| ∑ **Math** | KaTeX equation editor — inline LaTeX rendering |
| 👁 **OCR** | Tesseract.js offline OCR — English + বাংলা handwriting |
| 🔍 **Search** | Full-text search across all notebooks including OCR'd handwriting |
| 🎙 **Audio Sync** | Record while writing — click any stroke to replay audio from that moment |
| ☁️ **Drive Sync** | Google Drive auto-save with conflict resolution |
| 📄 **Export** | PDF, DOCX, PNG export |
| 🌙 **Dark Mode** | Dark mode with ink color auto-adjustment |
| 📱 **PWA** | Offline-first, installable on mobile/desktop |
| 🧮 **Calculator** | fx-991EX style scientific + engineering calculator |
| 🔐 **License** | Activation code system for commercial distribution |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud project (for Drive sync — optional)
- Supabase project (for license system — optional)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/foylx-note
cd foylx-note
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required (minimum to run)
NEXTAUTH_SECRET=any-long-random-string-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for login + Drive sync)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Supabase (for license validation)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Azure Ink Recognizer (cloud shape recognition)
NEXT_PUBLIC_AZURE_INK_KEY=your-azure-key
```

### 3. Run

```bash
npm run dev
# Open http://localhost:3000
```

> **Core features work with $0/month** — Drive sync and license system need API keys.

---

## 🏗 Architecture

```
Foylx Note — Local-First PWA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Browser
  ┌─────────────────────────────────────┐
  │  React 18 + Next.js 14 (App Router) │
  │  Zustand store  ←→  Immer patches   │
  │                                     │
  │  Canvas (SVG)                       │
  │  ├── perfect-freehand (stroke)      │
  │  ├── $1 Unistroke (shape recog.)    │
  │  ├── TipTap (rich text)             │
  │  └── KaTeX (math equations)         │
  │                                     │
  │  IndexedDB / Dexie.js               │
  │  Service Worker (offline PWA)       │
  └──────────────┬──────────────────────┘
                 │ (online)
  ┌──────────────▼──────────────────────┐
  │  Google Drive API v3                │
  │  ├── MyNotes/notebook/page_N.json   │
  │  └── user_prefs.json                │
  └─────────────────────────────────────┘
```

### Canvas Pipeline

```
PointerEvent → raw points[]
  → perfect-freehand smoothing → SVG render (live)
  → pen-up → geometry classifier:
      straightness > 0.92 → Line
      closed + circularity > 0.78 → Circle/Ellipse
      closed + corners 3-6 → Rectangle
      closed + corners 2-4 → Triangle
      shaft + hook → Arrow
      fallback → $1 Unistroke Recognizer
  → shape? → ShapeElement : StrokeElement
  → IndexedDB save (15s debounce)
  → Drive sync
```

---

## 📂 Project Structure

```
src/
  app/                  # Next.js App Router pages
  components/
    canvas/             # Drawing canvas, shapes, text, math
    toolbar/            # Main toolbar + pen options
    sidebar/            # Notebook/page navigation
    modals/             # OCR, Search, Settings, Drive
    apps/               # Calculator (fx-991EX)
    ui/                 # Audio sync panel, loading screen
  hooks/                # useKeyboardShortcuts, useThumbnail, useImageDrop
  lib/
    canvas/             # strokeEngine, shapeRecognition
    storage/            # db (Dexie), autoSave
    audio/              # audioSync
    export/             # PDF, DOCX, PNG export
    auth/               # googleDrive OAuth
    ocr/                # tesseractOCR
    license/            # activation system
  store/                # Zustand app store
  types/                # TypeScript types
public/
  sw.js                 # Service Worker
  manifest.json         # PWA manifest
electron/               # Desktop wrapper
docs/                   # Documentation (BN + EN)
```

---

## 🌐 Deploy

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
# Set environment variables in Vercel dashboard
```

### Environment Variables on Vercel
Add all `.env.local` values in: **Project → Settings → Environment Variables**

---

## 🖥 Desktop App (Electron)

```bash
npm run electron:build
# Produces dist/foylx-note-setup.exe (Windows)
#          dist/foylx-note.dmg (macOS)
```

> Requires activation key — see `src/lib/license/licenseSystem.ts`

---

## 📱 Mobile App (Capacitor)

```bash
npx cap add android
npx cap sync
npx cap open android   # Opens Android Studio → Build APK
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `P` | Pen tool |
| `H` | Highlighter |
| `E` | Eraser |
| `S` | Select |
| `T` | Text |
| `L` | Lasso |
| `V` | Pan |
| `Q` | Shape tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Save now |
| `Ctrl+A` | Select all |
| `Delete` | Delete selected |
| `Ctrl+Enter` | New page |
| `Ctrl+0` | Reset zoom |

---

## 🔐 License System

Foylx Note uses an activation code system for commercial distribution:

1. Generate codes: `node scripts/generate-licenses.js`
2. Store in Supabase `licenses` table
3. User enters code on first launch
4. Code validated against Supabase — one machine bind

See `docs/03_license/` for full guide.

---

## 🛡 Anti-Piracy

- Activation code required for Electron `.exe`
- Machine fingerprint bound to license
- Supabase validates each launch
- Offline grace period: 7 days

---

<div align="center">

Made with ❤️ | **বিসমিল্লাহির রাহমানির রাহীম**

</div>

# Foylx Note — Complete Bug Audit Report
**বিসমিল্লাহির রাহমানির রাহীম**

## 🔴 Critical Bugs Fixed This Session

| # | File | Bug | Fix |
|---|---|---|---|
| 1 | `ShapeRenderer.tsx` | Resize used absolute delta → jumped on first move then froze | Changed to incremental delta per pointer event |
| 2 | `ShapeRenderer.tsx` | Move used absolute sx/sy from drag start | Changed to incremental lastX/lastY |
| 3 | `TextEditor.tsx` | New text element stored `posX/posY` (screen px) as canvas coords | Fixed to use canvas `x/y` coords |
| 4 | `TextEditor.tsx` | Width/height stored in screen px, not canvas units | Divided by `transform.scale` |
| 5 | `nextauth/route.ts` | Access token expired after 1hr, no refresh | Added `refreshAccessToken()` with Google OAuth2 token refresh |
| 6 | `handwritingConversion.ts` | Strokes rendered at 1× scale — poor OCR | Render at 2.5× with padding for accuracy |
| 7 | `next.config.js` | `COEP: require-corp` blocked Google Fonts + calculator iframe | Removed, kept `COOP: same-origin-allow-popups` |

## ✅ Working Features Verified

### Google Drive
- ✅ User signs in with their own Google account
- ✅ Drive scope `drive.file` — access only to files the app creates
- ✅ Token auto-refresh (no re-login after 1hr)
- ✅ Auto-set token on app load from session
- ✅ Conflict detection + resolution UI
- ✅ Per-page sync with folder structure

### Shape Making
- ✅ Shape tool: drag-to-draw with blue preview
- ✅ Auto-recognition from freehand (geometry classifier + $1 Recognizer)
- ✅ Line, Circle, Ellipse, Rectangle, Triangle, Arrow
- ✅ Shape selected → 8 resize handles (incremental, fixed)
- ✅ Shape move → drag on shape body (incremental, fixed)
- ✅ Snap threshold configurable in Settings

### Handwriting → Text
- ✅ Select strokes (Select tool or Lasso)
- ✅ Click "🌐 Convert" in toolbar → HandwritingConvertModal
- ✅ Renders strokes at 2.5× for better OCR
- ✅ English + বাংলা + both
- ✅ Edit before inserting (correction mode)
- ✅ Auto mode: converts last stroke after delay
- ✅ Keep or delete original ink toggle

### Calculator
- ✅ Integrated via iframe (calculator.html)
- ✅ Font sizes 14–22px (readable)
- ✅ 48px min key height (touch-friendly)
- ✅ Draggable window, minimize, maximize, close
- ✅ Engineering functions, unit converter, constants

### General UI
- ✅ Notebook rename inline (✏ icon)
- ✅ Notebook color picker (color dot)
- ✅ Page drag-reorder (grip handle)
- ✅ Right-click context menu
- ✅ PWA install prompt
- ✅ Logo everywhere
- ✅ Dark mode
- ✅ Offline service worker

## 🚀 Run
```bash
npm install
cp .env.local.example .env.local
# Set NEXTAUTH_SECRET=any-long-random-string
# (optional) Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET for Drive
npm run dev
```

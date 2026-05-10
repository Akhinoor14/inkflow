# InkFlow Studio — User Guide
**বিসমিল্লাহির রাহমানির রাহীম**

---

## 🖊 What is InkFlow Studio?

InkFlow Studio is a **local-first digital notebook** — meaning your notes are stored on your own device, never uploaded to any server unless you choose to sync. It works offline, completely free.

**Key features:**
- Pressure-sensitive handwriting (like real pen on paper)
- Built-in **fx-991EX style engineering calculator**
- Convert handwriting to text (OCR — English + বাংলা)
- Export to PDF, Word (DOCX), or PNG
- Google Drive sync (optional)
- Works as a website, desktop app (.exe), or Android app (.apk)

---

## 🚀 Getting Started

### Open the App
- **Web:** Go to your hosted URL (e.g. `https://inkflow.vercel.app`)
- **Desktop:** Double-click `InkFlow Studio` on your desktop
- **Android:** Tap the InkFlow icon

### First Launch
The app creates a default notebook automatically. You'll see:
- **Left sidebar** — your notebooks and pages
- **Top toolbar** — drawing tools
- **Main area** — the canvas where you write

---

## ✏️ Writing & Drawing

### Tools (keyboard shortcuts in brackets)

| Tool | Key | What it does |
|------|-----|--------------|
| **Pen** | `P` | Pressure-sensitive ink |
| **Highlighter** | `H` | Semi-transparent yellow highlight |
| **Eraser** | `E` | Erase strokes |
| **Select** | `V` | Click to select elements |
| **Lasso** | `L` | Draw around elements to select |
| **Text** | `T` | Click canvas to type |
| **Shapes** | — | Rectangle, circle, arrow, etc. |
| **Pan** | `Space` | Hold to pan around canvas |

### Drawing Tips
- **Pressure sensitivity** works with stylus/Apple Pencil automatically
- **Zoom in/out** — pinch gesture (touch) or `Ctrl + scroll wheel`
- **Pan** — middle mouse button, or Space + drag
- **Undo** — `Ctrl+Z` | **Redo** — `Ctrl+Shift+Z`
- **Select all** — `Ctrl+A`
- **Delete selected** — `Delete` or `Backspace`

### Shape Recognition
Draw a rectangle, circle, triangle, or arrow — the app **automatically snaps** it to a perfect shape if it recognizes it (70%+ confidence). If you don't want this, draw smaller or more freely.

---

## 📓 Notebooks & Pages

### Create a Notebook
Click the `+` button next to "Notebooks" in the sidebar. Each notebook gets a color.

### Add Pages
Click `+ Add page` at the bottom of any notebook's page list.

### Rename a Page
Click the page title in the top bar and type a new name.

### Change Background
Click the **grid icon** (⊞) in the top bar to switch between:
- Blank, Lined, Grid, Dotted, Isometric, Music Staff

---

## 🧮 Engineering Calculator

Click **Calculator** in the sidebar Apps section (or press `Alt+C`).

The calculator opens as a **floating window** you can drag anywhere.

### Calculator Tabs

#### KEYPAD — Standard calculation
Type expressions directly in the formula bar or use the buttons.

**Examples you can type:**
```
sin(30)                    → 0.5
sqrt(144)                  → 12
2^10                       → 1024
log(1000)                  → 3
fact(10)                   → 3628800
nCr(10, 3)                 → 120
5 nCr 2                    → 10
solve(x^2-4, x, 1)         → x = 2
stats(1,2,3,4,5,6)         → mean, SD, median…
100 km to m                → 100000 m
```

**Special functions:**
- `derive(expr, x_val)` — numerical derivative
- `integrate(expr, a, b)` — definite integral (Simpson's rule)
- `sigma(expr, from, to)` — summation Σ
- `quad(a,b,c)` — quadratic roots
- `mat([[1,2],[3,4]])` — matrix determinant + inverse

**All trig functions:** `sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, asinh, acosh, atanh, cot, sec, csc`

**Angle mode:** Click `DEG` badge (top-right of display) to cycle DEG → RAD → GRAD

**Memory:** `M+` adds to memory, `MR` recalls, `MC` clears

**SHIFT key** activates inverse functions (sin → sin⁻¹, log → 10ˣ, etc.)

**HYP key** activates hyperbolic functions

#### CONVERT — Unit Conversion (25+ categories)
1. Click a category (Length, Mass, Pressure, etc.)
2. Enter your value
3. Select "from" and "to" units
4. Click **⇅ SWAP** to reverse

**All results** shown at once below the tool.

**Categories include:**
Length, Mass, Temperature, Area, Volume, Time, Speed, Acceleration, Force, Pressure, Energy, Power, Torque, Frequency, Angle, Digital Storage, Viscosity, Heat Transfer, Thermal Conductivity, Flow Rate, Density, Electrical, Radioactivity, and more.

#### CONST — Physical & Math Constants
Search and browse 80+ constants. Click **USE** to insert the value into your calculation.

**Categories:** Universal, Electromagnetic, Atomic & Nuclear, Thermodynamics, Mechanics, Math, Materials, Electrical, Fluid.

#### ENG — Engineering Calculators
12 pre-built engineering tools:

| Tool | What it solves |
|------|---------------|
| ⚡ Ohm's Law | V, I, R, P — give any 2, get all 4 |
| 🔵 RC Circuit | Time constant τ, cutoff freq, V(t) |
| 💪 Beam Stress | Simply supported UDL: Mmax, deflection, σ |
| 🔧 Mohr's Circle | σ₁, σ₂, τmax, principal angle θp, von Mises |
| 🌊 Pipe Flow | Reynolds, friction factor, head loss, ΔP |
| 🌡️ Ideal Gas | PV=nRT — solve any one unknown |
| 📐 Triangle Solver | Any 3 knowns → full solution + area |
| 📊 Quadratic/Cubic | ax²+bx+c=0 roots (real and complex) |
| 💰 Finance TVM | PV, FV, PMT, NPER, effective rate |
| 📈 Statistics | Mean, median, SD, IQR, skewness, kurtosis |
| ⚡ 3-Phase Power | P, S, Q, phase voltage, PF angle |
| ⚙ Column Buckling | Euler Pcr, slenderness ratio, critical stress |

#### HISTORY
All past calculations saved automatically. Click any result to restore it.

---

## 📝 Text Editor

Click the **T (Text)** tool, then click anywhere on the canvas.

A rich text editor appears with:
- **Bold** `B` | *Italic* `I` | Underline `U` | Strikethrough `S`
- Headings H1, H2
- Bullet list, Numbered list, Checklist ☑
- Text color picker
- Font size selector

Press `Escape` or click outside to finish.

**Double-click** any existing text to edit it.

---

## 🔍 OCR — Convert Handwriting to Text

1. Use **Select** or **Lasso** tool to select handwritten strokes
2. Click **Scan icon** (⎙) in toolbar, or press `Ctrl+Shift+O`
3. Choose language: **English**, **বাংলা**, or **Both**
4. Click **Re-run OCR** if needed
5. Edit the recognized text in the text box
6. Click **Insert as Text Element** to place it on canvas, or **Copy**

---

## 🔎 Search

Press `Ctrl+F` or click the **Search icon** in toolbar.

Searches across **all notebooks**:
- Typed text content
- OCR-recognized handwriting
- Page titles

Click any result to jump to that page.

---

## 🎵 Audio Sync

Record audio while writing — then click any element to hear what was being said at that moment.

1. Click **🎤 Record audio** in the page header
2. Write normally while recording
3. Click **Stop**
4. Click **▶ Play** to review
5. *(Future)* Click any stroke → audio plays from that timestamp

---

## 📤 Export

Click **Export** button in the top bar.

| Format | Best for |
|--------|---------|
| **PDF** | Sharing, printing, archiving |
| **DOCX** | Editing in Microsoft Word |
| **PNG** | Screenshots, embedding in presentations |

You can export **current page** or the **entire notebook** (all pages).

---

## ☁️ Google Drive Sync

Click **Drive** in the sidebar Apps section.

1. Click **Connect Google Drive**
2. Sign in with Google (only accesses the "InkFlow Studio" folder)
3. Click **Sync Now** to upload your notebook

Your notes are stored in `Google Drive → InkFlow Studio → [Notebook Name]` as JSON files.

If you edit on two devices, the app detects **conflicts** and lets you choose which version to keep (per page).

---

## ⚙️ Settings

Click **Settings** in the sidebar or toolbar.

**General tab:**
- Dark/light mode
- Language (English / বাংলা)
- Auto-save interval (5–120 seconds)
- Show ruler, snap to grid

**Drawing tab:**
- Default tool and pen size
- Default background style
- Auto-adjust ink color in dark mode

**Shortcuts tab:** Full list of all keyboard shortcuts.

---

## ⌨️ All Keyboard Shortcuts

| Action | Shortcut |
|--------|---------|
| Pen | `P` |
| Highlighter | `H` |
| Eraser | `E` |
| Select | `V` |
| Lasso | `L` |
| Text | `T` |
| Pan | `Space` (hold) |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Shift+Z` |
| Save now | `Ctrl+S` |
| Select all | `Ctrl+A` |
| Delete selected | `Delete` |
| New page | `Ctrl+Enter` |
| Toggle sidebar | `Ctrl+\` |
| Reset zoom | `Ctrl+0` |
| Zoom in | `Ctrl+=` |
| Zoom out | `Ctrl+-` |
| OCR | `Ctrl+Shift+O` |
| Search | `Ctrl+F` |
| Toggle calculator | `Alt+C` |
| Escape / Close | `Escape` |
| Edit text | Double-click element |

---

## 💾 Where are my notes stored?

- **Primary storage:** Your device (browser IndexedDB / local files for desktop)
- **Cloud backup:** Google Drive (only if you connect it)
- **No account needed** for local use — notes never leave your device

---

## ❓ FAQ

**Q: Does it work offline?**
A: Yes. Once loaded, everything works without internet. Drive sync needs internet.

**Q: Is my data private?**
A: Yes. Notes stay on your device. Google Drive sync only happens when you click "Sync Now."

**Q: Can I use it on mobile?**
A: Yes — the web version works on mobile browsers. The Android APK is also available.

**Q: My handwriting wasn't recognized correctly by OCR.**
A: Try writing more clearly with larger letters. Select "Both" language mode for mixed English/বাংলা text.

**Q: How do I get my notes onto another device?**
A: Use Google Drive sync, or export as PDF/DOCX and transfer the file.

**Q: The calculator says "Math Error".**
A: Check your expression — common issues: missing closing parenthesis, dividing by zero, `log` of negative number, `asin` of value outside [-1, 1].

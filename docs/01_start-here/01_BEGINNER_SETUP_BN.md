# InkFlow Studio Beginner Setup (Bangla, Baby-Step Guide)

এই গাইড একদম নতুনদের জন্য।
তুমি যদি কিছুই না জানো, তবুও এই ফাইল দেখে project চালাতে পারবে।

---

## 0) এই গাইডে তুমি কী শিখবে

1. কিভাবে project local machine এ চালু করতে হয়
2. কোন website এ যেতে হবে
3. কোন command দিতে হবে
4. কোথায় কোন value paste করতে হবে
5. Google Drive sync / License / Deploy / EXE / APK কিভাবে করবে

---

## 1) শুরু করার আগে (One-time setup)

### 1.1 Node.js install আছে কিনা দেখো

1. VS Code খুলে project folder open করো
2. উপরে মেনু থেকে: Terminal -> New Terminal
3. নিচের command দাও:

```powershell
node -v
npm -v
```

Expected:
- node version দেখাবে (যেমন v18+, v20+, v25+)
- npm version দেখাবে (যেমন 9+, 10+, 11+)

যদি command না চলে:
1. https://nodejs.org এ যাও
2. LTS version install করো
3. PC restart দাও
4. আবার command run করো

---

## 2) Project local run (সবচেয়ে জরুরি অংশ)

### 2.1 সঠিক folder এ আছো কিনা দেখো

Terminal এ:

```powershell
Get-Location
```

Target path:

C:/Users/AKHINOOR/Downloads/inkflow-FINAL/inkflow

যদি অন্য path হয়:

```powershell
cd C:/Users/AKHINOOR/Downloads/inkflow-FINAL/inkflow
```

### 2.2 dependency install

```powershell
npm install
```

এটা 1-5 মিনিট লাগতে পারে (net speed অনুযায়ী)।

### 2.3 environment file প্রস্তুত

এই project এ `.env.local` লাগে।

এই command দিয়ে template থেকে copy করো (যদি আগে না করা থাকে):

```powershell
Copy-Item .env.local.example .env.local
```

### 2.4 secret generate

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output থেকে long random text কপি করো।

### 2.5 `.env.local` edit

1. Explorer panel থেকে `.env.local` open করো
2. কমপক্ষে এই 2টা line set করো:

```env
NEXTAUTH_SECRET=তোমার_random_secret
NEXTAUTH_URL=http://localhost:3000
```

Google/Supabase না করলেও app run করবে।

### 2.6 dev server চালাও

```powershell
npm run dev
```

Expected output:
- ready / started message
- localhost:3000 mention থাকবে

### 2.7 browser এ open

http://localhost:3000

যদি page আসে, local setup done.

---

## 3) যদি error আসে (Quick fixes)

### 3.1 "npm is not recognized"
- Node.js install/reinstall করো
- PC restart

### 3.2 "port 3000 already in use"

```powershell
netstat -ano | findstr :3000
```

PID kill:

```powershell
taskkill /PID <PID_NUMBER> /F
```

তারপর আবার `npm run dev`।

### 3.3 clean reinstall

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

---

## 4) Google Drive Sync setup (Optional)

যদি তুমি cloud sync চাও, এই section করো।

### 4.1 Google Cloud Console

1. যাও: https://console.cloud.google.com
2. New Project -> নাম দাও (InkFlow Studio)
3. APIs & Services -> Library
4. Enable:
   - Google Drive API
   - Google profile/auth related API (project requirement অনুযায়ী)

### 4.2 OAuth Credentials

1. APIs & Services -> Credentials
2. Create Credentials -> OAuth client ID
3. Application Type: Web application
4. Authorized redirect URIs এ add করো:
   - http://localhost:3000/api/auth/callback/google
   - (deploy করলে) https://your-domain.com/api/auth/callback/google

### 4.3 env তে key বসাও

`.env.local` এ:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Server restart:

```powershell
npm run dev
```

---

## 5) License + Activation setup (Optional, Supabase)

### 5.1 Supabase project

1. যাও: https://supabase.com
2. New Project create করো
3. Settings -> API তে যাও
4. Copy করো:
   - Project URL
   - anon public key

### 5.2 env update

`.env.local` এ বসাও:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 5.3 database table তৈরি

1. Supabase -> SQL Editor
2. [03_DEVELOPER_GUIDE.md](03_DEVELOPER_GUIDE.md) এর License section থেকে SQL copy করো
3. Run করো

---

## 6) Vercel deploy (Recommended for web)

### 6.1 account + cli

1. Vercel account: https://vercel.com
2. Terminal:

```powershell
npm install -g vercel
vercel login
```

### 6.2 প্রথম deploy

```powershell
vercel
```

CLI কিছু প্রশ্ন করবে, default/yes দিয়ে এগোতে পারো (project অনুযায়ী)।

### 6.3 environment variables add

1. Vercel dashboard -> তোমার project -> Settings -> Environment Variables
2. `.env.local` থেকে সব needed key add করো

### 6.4 production deploy

```powershell
vercel --prod
```

---

## 7) Desktop EXE build (Windows)

### 7.1 build command

```powershell
npm run electron:win
```

এটা internally Next build + electron builder run করবে।

### 7.2 output কোথায়

`dist-electron` folder এ `.exe` installer পাবে।

### 7.3 icon missing issue

`build-resources` folder এ icon file লাগতে পারে:
- icon.ico (Windows)

---

## 8) Android APK build

### 8.1 prerequisites
- Android Studio install
- Java 17+

### 8.2 commands

```powershell
npm run build
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

এরপর Android Studio থেকে Build APK / Signed APK করো।

---

## 9) আজকের কাজের short checklist

- [ ] `npm install`
- [ ] `.env.local` ready
- [ ] `NEXTAUTH_SECRET` set
- [ ] `npm run dev`
- [ ] browser এ `http://localhost:3000` open

Optional:
- [ ] Google OAuth setup
- [ ] Supabase setup
- [ ] Vercel deploy
- [ ] EXE build
- [ ] APK build

---

## 10) তুমি এখন কী করবে (exact next step)

এখন শুধু এই 3টা করো:

1. `.env.local` open করে `NEXTAUTH_SECRET` বসাও
2. `npm install` (যদি আগে না করে থাকো)
3. `npm run dev` দিয়ে `http://localhost:3000` open করো

এটাই minimum working path.

---

## 11) Copilot কী কী করে দিয়েছে

1. Node.js আছে কিনা verify করা হয়েছে
2. npm আছে কিনা verify করা হয়েছে
3. `.env.local` auto-create করার command run করা হয়েছে (template থেকে)

যা এখনও করা হয়নি:
1. তোমার real secret বসানো
2. তোমার Google/Supabase credentials বসানো
3. deploy/build commands run

---

## 12) Important safety note

`.env.local` কখনও GitHub এ push করবে না।
এখানে secret keys থাকে।

Git ignore check করতে পারো `.gitignore` এ `.env.local` আছে কিনা।

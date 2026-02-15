# AI Teacher — Personalised AI Teacher (NotebookLM-style)

A personalised AI teacher that **trains on your notes** and helps you learn with **notes and voice-assisted answers**. Users are split into **Free** and **Premium** tiers.

## Features

- **Train on your notes**: Upload notes; the AI uses only your material to answer (RAG).
- **Voice-assisted learning**: Listen to AI answers via text-to-speech (TTS).
- **Free vs Premium**:
  - **Free**: Simple notes, AI-generated voice notes, concise answers.
  - **Premium**: Explained notes, higher-quality voice, visual representations (Mermaid diagrams), and reference YouTube search links.

## Tech stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **Prisma** + **SQLite** (users, notes, message history)
- **OpenAI**: embeddings (RAG), chat (GPT-4o-mini), TTS

## Setup

1. **Install dependencies**

   ```bash
   cd ai-teacher-app
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL="file:./dev.db"`
   - `JWT_SECRET` — any long random string
   - `OPENAI_API_KEY` — your OpenAI API key (required for chat, embeddings, TTS)

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Sign up** (or log in).
2. **Add notes** via “Add note” (title + content). Notes are indexed for RAG.
3. **Ask questions** in the chat; answers are based only on your notes.
4. **Listen** to any answer with the “Listen” button (TTS).
5. **Premium (demo)**: Call `POST /api/auth/upgrade` (e.g. from browser console or a “Upgrade to Premium” button) to switch your account to premium and get explained answers, visuals, and YouTube refs.

## API overview

- `POST /api/auth/register` — register (email, password, optional name)
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current user
- `POST /api/auth/upgrade` — (demo) set tier to premium
- `GET /api/notes` — list notes
- `POST /api/notes` — create note (triggers RAG indexing)
- `GET /api/notes/[id]` — get one note
- `DELETE /api/notes/[id]` — delete note
- `POST /api/chat` — send message, get AI reply (RAG + tier-based behaviour)
- `POST /api/tts` — text-to-speech (body: `{ "text": "..." }`)
- `GET /api/youtube?q=...` — (premium) get YouTube search URL

## Premium behaviour

- **Chat**: System prompt asks for explained answers, Mermaid diagrams when useful, and `[YouTube: <search query>]` for references.
- **TTS**: Premium uses `nova` voice; free uses `alloy`.
- **YouTube**: Only premium users can use the YouTube reference link from the API; the UI shows the link only when `tier === "premium"`.

---

## Building the Android APK (Capacitor)

The Android app is a **WebView** that loads your deployed web app. You deploy the Next.js app first, then build the APK.

### Prerequisites

- **Node.js** and **npm** installed
- **Android Studio** installed ([developer.android.com/studio](https://developer.android.com/studio))
- **JDK 17** (Android Studio usually includes it)

### 1. Deploy the web app

Deploy this Next.js app so it has a public URL (the APK will load that URL).

**Option A: Vercel (recommended)**

1. Push the project to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY` (use Vercel Postgres or keep SQLite for demo; for production use a hosted DB).
4. Deploy. Note the URL, e.g. `https://ai-teacher-app-xxx.vercel.app`.

**Option B: Other hosts**

Deploy to Netlify, Railway, or your own server. You need a **HTTPS** URL.

### 2. Add Capacitor and Android (one-time)

From the project root:

```bash
npm install
npx cap add android
```

### 3. Point the app to your deployed URL

Set the URL the WebView will load (use your actual deployed URL):

**Windows (PowerShell):**

```powershell
$env:CAPACITOR_SERVER_URL="https://your-app.vercel.app"; npx cap sync android
```

**macOS/Linux:**

```bash
CAPACITOR_SERVER_URL=https://your-app.vercel.app npx cap sync android
```

Or add to `.env` (and keep it out of git if it’s secret):

```env
CAPACITOR_SERVER_URL=https://your-app.vercel.app
```

Then run:

```bash
npx cap sync android
```

### 4. Open in Android Studio and build APK

```bash
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync to finish.
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. When the build finishes, click **Locate** in the notification to open the folder containing the APK.

The APK path is usually:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

For a **release** APK (e.g. for Play Store): **Build → Generate Signed Bundle / APK** and follow the wizard (you’ll need a keystore).

### 5. Get an “APK link”

- **Local**: The APK is only on your machine. Share the file (e.g. `app-debug.apk`) via USB, cloud drive, or email.
- **Download link**: Upload `app-debug.apk` to Google Drive, Dropbox, or a file host and share the download link.
- **Play Store**: For a public “APK link” you can use Google Play (release build + store listing).

### NPM scripts

| Script | Description |
|--------|-------------|
| `npm run cap:add:android` | Add Android platform (one-time) |
| `npm run cap:sync` | Copy config and web assets into the Android project |
| `npm run cap:open:android` | Open the Android project in Android Studio |
| `npm run cap:build:android` | Sync then open Android Studio |

After changing the deployed URL, run `npx cap sync android` again (or `CAPACITOR_SERVER_URL=... npx cap sync android`).

---

## License

MIT
"# AI_Tutor-app" 
"# AI_Tutor-app" 

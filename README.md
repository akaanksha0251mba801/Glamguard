# GlamGuard — Personalized Beauty Rescue Assistant

GlamGuard is a situation-based beauty assistant designed for young women (18–30) in Kolkata. Users describe their occasion, beauty concern, available time, current environment, and products they already own—and GlamGuard generates a tailored, time-guaranteed **Beauty Rescue Plan** powered by Gemini AI and backed by Firebase Authentication and Cloud Firestore.

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router
- **Backend / API:** Node.js Express (`server.ts`) for local/AI Studio preview + Vercel Serverless Functions (`/api/*.ts`) for production
- **AI Engine:** Google Gemini (`@google/genai`, `gemini-4-hydrogen`) running strictly server-side
- **Database & Auth:** Firebase Authentication & Cloud Firestore

---

## Deploying with Google AI Studio → GitHub → Vercel

### Step 1: Export to GitHub (Repository: `GlamGuard`)

1. In Google AI Studio, click **Export / Save to GitHub** and connect your GitHub account.
2. Create or choose a repository named **`GlamGuard`**.
3. Confirm that `.env` files are **not** committed (`.gitignore` already excludes `.env*` while keeping `.env.example`).

### Step 2: Enable Email/Password Login in Firebase Console

Google Sign-In is pre-configured, and Email/Password login takes 3 clicks to turn on:

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project (`gen-lang-client-0159947787`).
2. In the left menu, click **Build → Authentication → Sign-in method**.
3. Click **Add new provider** (or select **Email/Password**), toggle **Enable** on, and click **Save**.

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New → Project** and import your **`GlamGuard`** repository.
3. Keep the default **Vite** build settings (`npm run build`, output directory `dist`).
4. Expand **Environment Variables** and add:
   - `GEMINI_API_KEY` = your Gemini API key from Google AI Studio
5. Click **Deploy**.

### Step 4: Authorize Your Vercel Domain in Firebase

After Vercel gives you your live URL (for example `https://glamguard.vercel.app`):

1. Open your project in the [Firebase Console](https://console.firebase.google.com/).
2. Go to **Build → Authentication → Settings → Authorized domains**.
3. Click **Add domain**, paste your Vercel domain (e.g., `glamguard.vercel.app`), and click **Add**.
4. In Vercel, go to **Deployments → Redeploy** if you changed any environment variables.

### Step 5: Verify Firestore Security Rules

- Your security rules live in `firestore.rules` and strictly restrict every user's profile, saved plans, feedback, and pricing responses so only the signed-in owner (`request.auth.uid == userId`) can access their own records.

---

## Local Development

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY inside .env
npm run dev
```

Open `http://localhost:3000`.

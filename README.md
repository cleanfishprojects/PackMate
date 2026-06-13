# PackMate 🧳

Real-time family packing app. Built with Next.js 14, Tailwind CSS, Framer Motion, and Firebase Firestore.

## Setup (5 steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.local.example .env.local
```
Open `.env.local` and fill in:
- **Firebase**: Create a project at [console.firebase.google.com](https://console.firebase.google.com) → Project settings → Your apps → Web app → copy the config values.
- **OpenWeatherMap**: Get a free key at [openweathermap.org/api](https://openweathermap.org/api).

### 3. Set up Firestore
In the Firebase console:
1. Go to **Firestore Database** → Create database (start in test mode for now).
2. Create these collections (they auto-create when data is written, but you can create them manually): `users`, `trips`, `packingLists`.

Firestore security rules for production (paste under Rules tab):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // tighten before going live
    }
  }
}
```

### 4. Run locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. In Vercel's **Environment Variables** section, add all the variables from `.env.local`.
4. Click **Deploy**.

## How It Works

| Profile | Landing at | Experience |
|---------|-----------|------------|
| Ben | `/ben` | Admin dashboard + Appreciation Engine |
| Jessica | `/jessica` | Admin dashboard (no affirmations) |
| Luke | `/luke` | Kid packing view (3-column grid) |
| Thomas | `/thomas` | Kid packing view (2-column, larger targets) |

### Flow
1. Ben or Jessica logs in → creates a trip (destination, dates, activities).
2. Weather data auto-fetches; relevant items are injected into all lists.
3. Admin reviews each member's list, adjusts quantities.
4. Admin hits **Push** → lists change from `draft` → `approved` in Firestore.
5. Kids see their list appear instantly (real-time Firestore listener).
6. Kids tap cards to pack items. 100% → confetti explosion 🎉.

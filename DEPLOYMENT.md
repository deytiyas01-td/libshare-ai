# LibShare AI — Complete Deployment & Setup Guide
### CodeVerse India National-Level Hackathon
**Problem Statement:** “Unlock Underused Equipment and Spaces”

---

## Part 1: Instant Local Demonstration (Recommended for Judges)

LibShare AI has been architected to run immediately with zero external dependencies using an embedded SQLite database and local FastAPI + Vite development servers.

### 1. Start the Backend
Open a terminal in `backend/`:
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*The database automatically creates and seeds demo schools, accounts, resources, and active QR tokens.*

### 2. Start the Frontend
Open a second terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Part 2: Connecting Supabase (Cloud PostgreSQL)

If you wish to use Supabase as the production database:

### Step 1: Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com).
2. Click **"New Project"**.
3. Choose an Organization, enter project name: `libshare-ai`.
4. Set a strong Database Password (store this safely).
5. Choose region (e.g. `South Asia (Mumbai)` for low latency in India).
6. Click **"Create new project"**.

### Step 2: Run the SQL Migration Schema
1. In your Supabase project dashboard, on the left navigation sidebar, click on **SQL Editor** (icon looking like `>_`).
2. Click **"New Query"**.
3. Open `supabase_schema.sql` from the project repository.
4. Copy its entire contents and paste into the Supabase SQL Editor.
5. Click **"Run"** (bottom right or top bar).
6. Verify in the **Table Editor** that `schools`, `profiles`, `resources`, `bookings`, `booking_items`, `condition_reports`, and `school_restrictions` appear.

### Step 3: Copy Your Database Connection String
1. In Supabase, click **Project Settings** (gear icon at the bottom of the left sidebar).
2. Click on **Database**.
3. Scroll down to **Connection strings** and select **URI** (or **Session Pooler**).
4. Copy the connection string:
   `postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
5. Replace `[PASSWORD]` with your real database password.

### Step 4: Configure the Backend Environment
In `backend/.env`:
```env
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=libshare-super-secret-jwt-key-codeverse-india-2026
```

---

## Part 3: Deploying Backend to Render

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "LibShare AI — Hackathon release"
   git remote add origin https://github.com/YOUR_USERNAME/libshare-ai.git
   git push -u origin main
   ```
2. Log in to [render.com](https://render.com).
3. Click **"New +"** -> **"Web Service"**.
4. Connect your GitHub repository.
5. Configure the following fields:
   - **Name:** `libshare-ai-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase connection string (or leave blank to use embedded SQLite)
   - `JWT_SECRET`: `your-random-jwt-secret-key`
7. Click **"Create Web Service"**.
8. Copy the deployed backend URL (e.g. `https://libshare-ai-backend.onrender.com`).

---

## Part 4: Deploying Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository.
4. In the configuration screen:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://libshare-ai-backend.onrender.com/api` (or configure Vercel rewrites in `vercel.json`).
6. Click **"Deploy"**.
7. Once deployed, open the live link to test all features.

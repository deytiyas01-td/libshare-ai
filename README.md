# LibShare AI — Smart Multi-School Library & Educational Resource Sharing Platform
### CodeVerse India National-Level Hackathon
**Problem Statement:** “Unlock Underused Equipment and Spaces”  
**Tagline:** *Share Knowledge. Share Resources. Empower Every School.*

---

## 🏆 Project Overview

Most educational institutions face a profound paradox: while one school struggles with inadequate laboratory equipment, high-performance computing devices, and specialized academic literature, a neighboring school often has underutilized science apparatus, vacant multimedia rooms, and idle STEM kits.

**LibShare AI** is a full-stack, secure, multi-institutional resource-sharing platform built to unlock surplus educational infrastructure. Rather than functioning as a standard single-school library catalogue, LibShare AI creates a federated inter-school sharing network that supports:

1. **Independent School Portals:** School A, School B, and School C each retain exclusive sovereignty over their inventory, custom restrictions, student verifications, and approvals.
2. **Multi-Resource Cart Routing:** Students can compile resources from multiple institutions into a single borrowing session. The backend automatically partitions the request and routes items strictly to their respective owning schools.
3. **Cryptographic QR Handover & Return:** Contactless, tamper-resistant QR passes with physical condition inspection at collection and return to eliminate damage disputes.
4. **Scikit-Learn TF-IDF AI Engine:** Semantic affinity vector matching across curriculum descriptions, idle asset underutilization detection, and velocity anomaly advisory alerts.

---

## 🔑 Public Hackathon Demonstration Credentials

For ease of evaluation, pre-configured demo credentials are provided:

| Role / Portal | Account / Identifier | Demo Password | Purpose |
| :--- | :--- | :--- | :--- |
| **School A Portal** | Greenwood High School (`school-a`) | `WeCodeCoders1` | Approve physics lab apparatus & laptops |
| **School B Portal** | St. Xavier Academy (`school-b`) | `WeCodeCoders2` | Manage astronomy telescope & coding units |
| **School C Portal** | Delhi Model Sr. Sec. (`school-c`) | `WeCodeCoders3` | Manage spectrophotometers & podcast studio |
| **Verified Student** | `student.arjun@demo.edu` | `StudentDemo123` | Class 11 student with verified credentials |
| **Pending Student** | `student.priya@demo.edu` | `StudentDemo123` | Demonstrates pending ID approval workflow |

*Note: In the Sign-In UI, click the **"⚡ 1-Click Quick Demo Login"** buttons to populate credentials automatically.*

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Setup Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*The database automatically creates and seeds demo schools, accounts, resources, and active QR tokens.*

### 2. Setup & Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔬 Core System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               React + Vite + Tailwind CSS Frontend              │
│  (Marketplace, Cart Session, QR Passes, Recharts Dashboards)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ JSON API (HTTP/JWT)
┌───────────────────────────────▼─────────────────────────────────┐
│                   FastAPI Python REST Backend                   │
│  - Multi-School Request Router      - QR Token Engine           │
│  - Role-Based Access Control        - Condition Inspection Logs │
│  - Audit Logs & Isolation Guards    - Real-Time Notifications   │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
┌───────────────▼──────────────┐   ┌──────────────▼───────────────┐
│     Scikit-Learn AI Engine   │   │     Relational Database      │
│  - TF-IDF Vectorizer         │   │  - SQLite (Zero-Config Demo) │
│  - Cosine Similarity (Curric)│   │  - Supabase PostgreSQL       │
│  - Underutilization Detector │   │  - 9 Structured Tables       │
│  - Velocity Anomaly Advisory │   │    with Isolation Keys       │
└──────────────────────────────┘   └──────────────────────────────┘
```

---

## 🛠️ Feature Implementation Matrix

| Requirement | Implementation Details | Status |
| :--- | :--- | :--- |
| **Four Distinct Portals** | Independent dashboards for School A, School B, School C, and Student Portal | ✅ Fully Implemented |
| **Student Registration** | Full validation, age checks, School ID/admission document preview | ✅ Fully Implemented |
| **Verification Workflow** | Pending → Verified → Rejected; Unverified students blocked from checkout | ✅ Fully Implemented |
| **Resource Marketplace** | 5 categories, multi-school discovery, search by title, author, subject, genre | ✅ Fully Implemented |
| **Multi-Resource Cart** | Cross-school cart partitioned per owning school with zero notification cross-leak | ✅ Fully Implemented |
| **QR Handover Desk** | Cryptographic single-use token with live camera scan + manual token fallback | ✅ Fully Implemented |
| **Condition Inspection** | Pre-collection & post-return physical ratings, damage notes, missing items | ✅ Fully Implemented |
| **TF-IDF AI Recommendations** | Semantic vector similarity over curriculum descriptions and keywords | ✅ Fully Implemented |
| **Underused Asset Detection**| Idle resource scoring recommending cross-school loan promotion | ✅ Fully Implemented |
| **Interactive Analytics** | Category distribution, sharing timeline, school-specific utilization metrics | ✅ Fully Implemented |
| **In-App Notifications** | Role-filtered alerts for approvals, verifications, collections, returns | ✅ Fully Implemented |

---

## 🧪 12-Step Judge Verification Walkthrough

1. **Visit Landing Page (`/`):** Observe the 4 distinct portal entry cards and hackathon credentials.
2. **Explore Marketplace (`/marketplace`):** Filter by category (e.g. *Science laboratory equipment*) or school.
3. **Inspect AI Affinity:** Notice the Scikit-Learn TF-IDF recommended items with cosine similarity scores.
4. **Login as Verified Student (Arjun):** Click *1-Click Student (Arjun)*. Status shows **Verified**.
5. **Add Cross-School Items to Cart:** Add 1 item from School A and 1 item from School B.
6. **Submit Multi-Resource Session (`/cart`):** Notice the system confirms independent routing to School A and School B.
7. **Switch to School A Portal (`/school/school-a`):** Sign in with `WeCodeCoders1`. School A sees *only* its item in the incoming queue!
8. **Approve Request:** Click **Approve**. Status transitions to *Ready for Collection*.
9. **Show QR Pass (`/student/my-bookings`):** Open the student station to view the cryptographic Collection QR Pass.
10. **Staff Handover Scan (`/school/school-a`):** Open the QR Handover Station, enter the sample token, record condition ("Excellent"), and click **Confirm Handover**.
11. **Staff Return Scan:** Switch mode to **Return Check-in**, record return condition, and complete return. Inventory is automatically restored!
12. **Analytics & AI Dashboard (`/analytics`):** Review cluster metrics, underutilized asset flags, and AI-generated cluster summary.

---

## 🛡️ Security & Privacy Architecture

- **School Isolation:** School staff cannot inspect or modify resources, restrictions, or requests belonging to another institution.
- **Student Privacy:** QR tokens contain pseudorandom cryptographic hashes (`QR-XXXX`) and do not embed raw student emails or passwords.
- **Human-in-the-Loop Discipline:** AI suggestions serve as advisory decision support. No automated penalties or student rejections occur without staff coordinator review.

---

## 🔮 Future Scope

- **Inter-School IoT Lockers:** Automated smart parcel lockers on campus perimeters for after-hours contactless pickups.
- **Transit Routing Optimization:** AI route clustering for inter-school courier vans moving shared batch laboratory equipment.
- **Curriculum Schedule Sync:** Integration with academic timetables to anticipate equipment demand weeks in advance.

---

© 2026 LibShare AI Team — CodeVerse India National-Level Hackathon

# College Attendance Management System

A production-grade, responsive, and minimal Full-Stack College Attendance Management System built with **React.js (Vite)**, **Tailwind CSS**, **Node.js (Express.js)**, **MongoDB Atlas**, and **JWT Authentication**.

---

## 🌟 Default Accounts & Credentials

The system comes pre-configured with the following active accounts:

| Role | Email / Identifier | Password | Description & Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@college.edu` | `admin123` | Head Administrator (Can create & manage additional teacher accounts) |
| **Faculty / Teacher** | `teacher@college.edu` | `teacher123` | Prof. Robert Vance (HOD & Professor, CSE Dept) |
| **Faculty / Teacher 2** | `sarah.faculty@college.edu` | `teacher123` | Dr. Sarah Connor (Assistant Professor) |
| **Student 1 (Green)** | `student1@college.edu` / `CS202401` | `student123` | Aarav Sharma (High Attendance: **≥ 85%**, Green Tier) |
| **Student 2 (Yellow)** | `student2@college.edu` / `CS202402` | `student123` | Priya Patel (Borderline: **75–84%**, Yellow Tier) |
| **Student 3 (Red)** | `student3@college.edu` / `CS202403` | `student123` | Rohan Gupta (Shortage / Defaulter: **< 75%**, Red Tier) |

---

## 🔐 Authentication & Account Management Architecture

1. **No Public Registration:** Self-registration is disabled for security and institution compliance.
2. **Initial Teacher / Admin Creation:** Initial accounts are created securely through the backend CLI script:
   ```bash
   # Create default teacher account
   npm run setup:teacher

   # Or create custom admin/teacher credentials:
   cd server && node src/scripts/setupTeacher.js --name "Prof. John Doe" --email "john@college.edu" --password "securePass123" --role teacher
   ```
3. **Admin-Only Teacher Provisioning:** Only authenticated administrators (`role === 'admin'`) can create additional teacher accounts via the Faculty Accounts portal or `POST /api/teachers`. Regular teachers are restricted (`403 Forbidden`).
4. **Teacher-Managed Student Enrollment:** Teachers create student accounts from the Student Management page by providing:
   - Student Full Name
   - Register Number (e.g. `CS202401`)
   - College Email
   - Initial Password
   - Class, Semester, and Department
5. **Instant Student Login:** Student login credentials are automatically generated upon creation. Students can immediately log in using their email or Register Number and initial password.
6. **Independent Password Management:** Students can independently change their password at any time from their **Profile & Security** page.
7. **Security Stack:** All passwords are salted and hashed with `bcryptjs`. Stateless `JWT` tokens enforce role-based access control (RBAC) on all routes.

---

## 🚀 Key Features

### 1. 👨‍🏫 Teacher / Faculty Dashboard
- **Comprehensive Analytics:** Total enrolled students, total subjects, today's present, today's absent, 7-day attendance trend bar chart, and institution-wide attendance rate.
- **7-Step Attendance Marking Workflow:**
  1. Select Department
  2. Select Semester & Class Section
  3. Select Subject
  4. Select Date
  5. Display student roster
  6. Mark Present / Absent (individual quick-toggles)
  7. Save attendance
- **Smart Attendance Features:**
  - **"Mark All Present"** & **"Mark All Absent"** bulk buttons.
  - **Duplicate Prevention:** Compound unique index `{ subject, classSection, dateString }` prevents duplicate entries in the database.
  - **Edit Attendance Mode:** If attendance was already submitted for a class/subject/date, the system detects it, loads existing student statuses, and switches to Edit Mode to safely update records.
- **Attendance History & Session Audit:**
  - Searchable and filterable by Department, Class, Subject, and Date Range.
  - Inspect detailed student-by-student marks for any historical session.
  - Delete or modify past sessions with confirmation.
- **Student Management (CRUD):**
  - Add, edit, and deactivate student accounts.
  - Assign Roll Number, Department, Semester, Class Section, and Parent Contact.
- **Curriculum & Academic Structure Management:**
  - Manage Subjects, Course Codes, Semesters, and Credit Allocations.
  - Manage Departments and Class Sections (e.g. `CSE-5A`, `CSE-5B`, `IT-5A`).
- **Reports & Official CSV Export:**
  - Summary audit reports with overall percentage, attended/total classes, and eligibility status.
  - **CSV Export:** One-click download of structured `.csv` reports.
  - **Printable Layout:** Clean `@media print` stylesheets for one-click printing without navigation clutter.
- **Announcements & Notifications:**
  - Post alerts, schedule updates, or shortage warnings to students and faculty.

---

### 2. 🎓 Student Dashboard & Portal
- **Overall Attendance Gauge:** Instant visualization of semester attendance percentage.
- **Color Coding System:**
  - 🟢 **Green (≥ 85%):** Good standing / Exam Eligible.
  - 🟡 **Yellow (75–84%):** Satisfactory / Borderline.
  - 🔴 **Red (< 75%):** Attendance Shortage / Exam Defaulter Alert.
- **Subject-Wise Breakdown:**
  - Individual progress bars and attendance metrics per subject.
  - Expandable session log showing exact dates attended vs missed.
- **Monthly Attendance Calendar:**
  - Interactive monthly calendar grid.
  - Visual color chips (Green = Present, Red = Absent) for every class date.
  - Click any day on the calendar to view full subject-by-subject attendance details.
- **Attendance Target Calculator:**
  - Projections for mandatory **75%**, **80%**, **85%**, and **90%** targets.
  - **Action Required Calculation:** If attendance is below target:
    $$\text{Needed Consecutive Classes} = \left\lceil \frac{\text{Target} \times \text{Total} - 100 \times \text{Present}}{100 - \text{Target}} \right\rceil$$
  - **Safety Margin Calculation:** If attendance is above target:
    $$\text{Classes You Can Afford to Miss} = \left\lfloor \frac{100 \times \text{Present} - \text{Target} \times \text{Total}}{\text{Target}} \right\rfloor$$
  - **Interactive Custom Target Simulator:** Test any arbitrary percentage (e.g., 82%) in real-time.
- **Profile & Security:**
  - View details and update contact numbers.
  - Secure Change Password tool with bcrypt verification.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React.js (v18) with Vite
  - Tailwind CSS for minimal, premium styling
  - Lucide React for consistent icons
  - React Router DOM (v6) for protected routing
  - Axios with JWT request interceptors
- **Backend:**
  - Node.js & Express.js REST API
  - MongoDB Atlas (with Mongoose ODM)
  - `mongodb-memory-server` seamless fallback (ensures zero-config dev boot if Atlas is unreachable)
  - JSON Web Tokens (JWT) for authentication
  - bcryptjs for password hashing
  - CORS and centralized error handling middleware

---

## 📁 Project Structure

```
attendance/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # Axios client with auth interceptors
│   │   ├── components/
│   │   │   ├── common/         # StatCards, ProgressBars, Badges, Modals, Spinners
│   │   │   └── layout/         # Responsive Sidebar, Navbar, and DashboardLayout
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── pages/
│   │   │   ├── teacher/        # Teacher Dashboard, Mark Attendance, History, Students, Subjects, Reports
│   │   │   ├── student/        # Student Dashboard, Subjects, Calendar, Target Calculator
│   │   │   ├── Login.jsx       # Multi-role login with demo pills
│   │   │   └── Profile.jsx     # Profile & Change Password
│   │   ├── utils/              # Color standards, formulas, CSV helpers
│   │   ├── App.jsx             # Protected router configuration
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json             # Vercel SPA deployment configuration
├── server/                     # Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/             # Database connection (Atlas + Memory fallback)
│   │   ├── controllers/        # Attendance, Academic, Student, Report, Notification controllers
│   │   ├── middleware/         # JWT Authenticate & Role Authorize middleware
│   │   ├── models/             # Mongoose Schemas (User, Attendance, Subject, ClassSection, Department)
│   │   ├── routes/             # Express API routes
│   │   ├── seed/               # Realistic database seeder
│   │   └── server.js           # Server entry point & static SPA serving
│   ├── .env                    # Environment variables (MongoDB Atlas URI, JWT Secret)
│   ├── .env.example
│   └── package.json
├── render.yaml                 # Render cloud deployment blueprint
├── package.json                # Root scripts for multi-package management
└── README.md
```

---

## ⚡ Local Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**

### 2. Clone and Install Dependencies
From the repository root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration
Inspect or edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/attendance_db?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkey_for_college_attendance_system_2026
NODE_ENV=development
```
> **Note:** If `MONGODB_URI` is left blank, the server automatically starts a local in-memory MongoDB instance (`mongodb-memory-server`) with zero manual setup required.

### 4. Seed Demo Data
To populate the database with realistic sample departments, classes, faculty, students, and 20 days of historical attendance:
```bash
cd server
npm run seed
```

### 5. Start Development Servers
In two separate terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🚢 Deployment Guide

### Option A: Frontend on Vercel + Backend on Render

#### 1. Backend on Render
1. Push this repository to GitHub.
2. Log in to [Render](https://render.com) and click **New > Web Service**.
3. Select your repository:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `NODE_ENV`: `production`
5. Deploy the service and note your backend URL (e.g., `https://college-attendance-api.onrender.com`).

#### 2. Frontend on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Select your repository:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://college-attendance-api.onrender.com/api`
4. The included `client/vercel.json` ensures all client-side routes (e.g. `/student/dashboard`) resolve properly.

---

### Option B: Unified Full-Stack Service on Render
The backend Express server is already configured to automatically serve the compiled frontend (`client/dist`) in production:
1. In `render.yaml`, the root project can build both:
   ```bash
   npm run build:client && cd server && npm install
   ```
2. Start command: `node server/src/server.js`.
3. Express serves the frontend and APIs from a single URL.

---

## 🔒 Security & Data Validation
- **Role-Based Access Control (RBAC):** Middleware validates roles (`teacher`, `student`, `admin`) on every protected endpoint.
- **Tenant Isolation:** Students can only view their own attendance metrics (`req.user._id`), preventing unauthorized inspection.
- **Password Security:** Salted hashing with `bcryptjs` (passwords are stripped from all API outputs).
- **Duplicate Prevention:** Unique compound indices enforce data consistency across subjects, classes, and dates.

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).

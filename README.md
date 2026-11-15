# Hostel Maintenance Request Portal

A full-stack, enterprise-grade web application built to streamline hostel maintenance, issue tracking, and repair allocations across college and university dormitories.

---

## 🚀 Technology Stack

* **Frontend**: React.js 18 (Vite), Tailwind CSS 3, React Router v6, Axios, Lucide React Icons
* **Backend**: Python 3.12+, Flask 3.0, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, PyMySQL, Werkzeug
* **Database**: MySQL 8.0+ (with 5 strictly normalized tables: `Users`, `Categories`, `Complaints`, `Complaint_Images`, `Complaint_Logs`)
* **Security**: Password hashing (scrypt / pbkdf2), JWT Authentication with RBAC, MIME-type and size-capped image validation

---

## 👥 User Roles & Capabilities

### 1. 🎓 Student
* Register student account with hostel block and room number.
* Lodge maintenance complaints with category selection, priority rating, and descriptions.
* Upload photo evidence (up to 3 images, max 5MB).
* Track real-time progress (`Pending` → `Assigned` → `In_Progress` → `Resolved` / `Rejected`).
* View full audit history timeline and view resolution photos uploaded by maintenance staff.

### 2. 🛠️ Maintenance Staff
* View personal queue of assigned repair tasks.
* Filter tasks by status (`Assigned`, `In_Progress`, `Resolved`).
* Acknowledge and transition status to `In_Progress`.
* Add resolution notes and upload resolution proof photos.
* Mark tasks as `Resolved`.

### 3. 🛡️ Admin / Warden
* Comprehensive KPI dashboard: Total Complaints, Pending Allocation, In Progress, Resolution Rate %.
* Visual breakdown of complaints by category and priority.
* Assign / re-assign pending complaints to specific maintenance staff with priority overrides.
* Directly manage complaint statuses (Approve, Reject with reasons, or Reopen).
* Provision new maintenance staff accounts.
* Monitor staff workload (active tasks vs completed tasks).
* Export and print analytical reports.

---

## 📁 Project Structure

```
hostem-maintenance-portal/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy models (User, Category, Complaint, ComplaintImage, ComplaintLog)
│   │   ├── routes/           # Blueprints: auth, complaints, staff, admin, analytics
│   │   ├── services/         # Business logic: auth, complaint lifecycle, secure file uploads
│   │   ├── utils/            # Decorators (@role_required), standardized JSON responses, constants
│   │   ├── __init__.py       # App factory (create_app)
│   │   └── extensions.py     # SQLAlchemy, JWTManager, CORS
│   ├── uploads/              # Local storage for complaint & resolution photos
│   ├── tests/                # Automated integration test suite
│   ├── config.py             # Environment configurations
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client with JWT interceptor & API modules
│   │   ├── components/       # Common design system (Modal, Badges, StatCards, Layouts)
│   │   ├── context/          # AuthContext (JWT & user state persistence)
│   │   ├── hooks/            # useAuth hook
│   │   ├── pages/            # Role-specific views (Student, Staff, Admin, Auth)
│   │   ├── routes/           # Protected routes with role authorization guards
│   │   ├── utils/            # Status & priority constants, date formatters
│   │   ├── App.jsx           # Main application root
│   │   └── main.jsx          # Mount entry
│   ├── tailwind.config.js    # Tailwind theme configuration
│   └── vite.config.js        # Vite bundler & API reverse proxy configuration
│
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup

1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the Python virtual environment:
   * **Windows**:
     ```powershell
     .venv\Scripts\activate
     ```
   * **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```
3. Configure your MySQL credentials in `.env`:
   ```env
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=hostel_maintenance_db
   DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/hostel_maintenance_db
   ```
   *(Note: For offline testing without MySQL running, set `USE_SQLITE=true`)*

4. Initialize database tables and seed default categories & demo accounts:
   ```bash
   python -m flask --app run.py init-db
   ```

5. Run the Flask development server:
   ```bash
   python run.py
   ```
   *API will run at: `http://localhost:5000`*

---

### 2. Frontend Setup

1. Open a terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend portal will run at: `http://localhost:3000`*

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Pre-configured Access |
| :--- | :--- | :--- | :--- |
| **Admin / Warden** | `admin@hostel.com` | `Admin@123` | Full administrative control, analytics, assignments |
| **Staff Member** | `staff@hostel.com` | `Staff@123` | Task queue, status updates, resolution photo uploads |
| **Student** | Self-register on `/register` or use your registered student account | Full complaint lodge, track, and review flow |

*(The login screen also includes convenient **one-click demo login buttons** for instant testing).*

---

## 🧪 Automated Testing

To run the backend integration and security test suite:
```bash
cd backend
.venv\Scripts\python.exe -m unittest tests/test_api.py
```
To verify the frontend build:
```bash
cd frontend
npm run build
```

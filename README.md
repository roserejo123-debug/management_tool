# 📋 TaskFlow — Project Management Tool

A simplified project management tool built with the **MERN Stack** (MongoDB, Express, React, Node.js).

## ✨ Features

### 🔐 Authentication
- User registration and login with JWT
- Password hashing with bcrypt
- Forgot password & reset via email
- Protected routes

### 📁 Projects
- Create, view, update, delete projects
- Set project status: Active / Completed / Archived
- Set project deadlines
- Search and filter projects

### ✅ Tasks
- Create tasks within projects
- Set task status: To Do / In Progress / Done
- Set task priority: Low / Medium / High
- Set due dates
- Task board view with 3 status columns
- Edit and delete tasks

### 📊 Dashboard
- Total projects and tasks overview
- Completed vs pending task counts
- Recent projects and tasks
- Quick action cards

---

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, Redux Toolkit, React Router, Vite |
| Backend    | Node.js, Express 5 |
| Database   | MongoDB (Mongoose) |
| Auth       | JWT, bcryptjs |
| Styling    | Vanilla CSS (Dark theme, glassmorphism) |

---

## 📂 Project Structure

```
capstone/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── common/         # ProtectedRoute
│   │   │   └── layout/         # Navbar
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── projects/       # ProjectsPage, ProjectDetailPage
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── redux/
│   │   │   ├── slices/         # authSlice, projectSlice, taskSlice
│   │   │   └── store.js
│   │   └── utils/              # axiosInstance
│   └── index.html
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # db.js
│   │   ├── controllers/        # auth, project, task, dashboard, user
│   │   ├── middleware/          # authMiddleware, validateMiddleware
│   │   ├── models/             # User, Project, Task
│   │   ├── routes/             # auth, project, task, dashboard, user
│   │   └── utils/              # sendEmail
│   ├── index.js
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd capstone
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env    # Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open in browser
Visit `http://localhost:5173`

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiry (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS |
| `EMAIL_USER` | Gmail for password reset |
| `EMAIL_PASS` | Gmail app password |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project with tasks |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project + tasks |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | Get project tasks |
| POST | `/api/projects/:projectId/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get dashboard stats |

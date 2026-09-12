# ⚡ Stride — Make progress, everyday

A polished, human-designed productivity and task tracker application built with a modern React + TypeScript frontend, an Express + TypeScript REST API backend, an SQLite relational database with foreign key constraints, Neon Postgres integration, JWT-based authentication, and a complete Jest/Supertest test suite.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Vanilla CSS Design System with custom HSL tokens, Linear/Notion editorial aesthetics, and responsive layout
- **Icons**: Lucide React
- **Views**: Dashboard, Task List (with Bulk Actions), Kanban Board, Calendar, Analytics & Velocity, Team Directory, Tag Manager, Settings

### Backend
- **Server**: Node.js + Express + TypeScript
- **Database**: SQLite via `better-sqlite3` in WAL mode & Cloud Postgres on Neon
- **Security**: Password hashing via `bcrypt` (10 rounds), stateless session authentication via `jsonwebtoken` (JWT)
- **Validation**: Schema-level input sanitization and centralized error handling

### Testing & Tooling
- **Testing Framework**: Jest with `ts-jest` and `supertest` for end-to-end REST API testing
- **Cloud Database**: Neon Cloud Postgres (`sweet-star-76003793`)

---

## 🗄️ Relational Database Schema

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    initials TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4F46E5',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Tasks table with Foreign Keys
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('todo', 'in-progress', 'done')),
    priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')),
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## 📡 REST API Documentation

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |
| `GET` | `/api/auth/users` | List all workspace users for assignment | Bearer Token |

### 📋 Task Management (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | Get filtered tasks (`status`, `priority`, `search`, `sortBy`) | Bearer Token |
| `GET` | `/api/tasks/stats` | Get sprint velocity and completion statistics | Bearer Token |
| `GET` | `/api/tasks/:id` | Get single task details | Bearer Token |
| `POST` | `/api/tasks` | Create task (auto-generates task key) | Bearer Token |
| `PUT` | `/api/tasks/:id` | Update task details / lifecycle | Bearer Token |
| `DELETE` | `/api/tasks/:id` | Delete task | Bearer Token |
| `POST` | `/api/tasks/bulk-delete` | Batch delete selected tasks | Bearer Token |

---

## 🧪 Testing Suite

Run the full automated test suite (17 tests covering auth validation, JWT verification, and task CRUD lifecycle):

```bash
npm test
```

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations & Seed
```bash
npm run server:seed
```
*Preloaded demo credentials:*
- **Email:** `akshat@taskflow.dev`
- **Password:** `password123`

### 3. Run Development Servers
To run both the Frontend client and Backend API concurrently:
```bash
npm run dev:all
```
- Frontend will be available at: `http://localhost:5173`
- Backend API will be available at: `http://localhost:5000`

### 4. Build for Production
```bash
npm run build          # Client production build
npm run server:build   # Server TypeScript compilation
```

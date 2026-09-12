<div align="center">

# ⚡ Stride - Make progress, everyday

**A high-performance, full-stack productivity workspace engineered with React 19, TypeScript, Express, SQLite, Neon Cloud Postgres, and JWT security.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Neon Postgres](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](#-license)

<br />

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Database Schema](#-database-architecture) • [API Reference](#-api-documentation) • [Getting Started](#-getting-started) • [Testing](#-testing-suite) • [Security](#-security--data-integrity)

</div>

---

## 📖 Overview

**TaskFlow** is a modern, human-crafted task tracker and sprint management application designed for individuals and fast-moving teams. Inspired by the editorial aesthetics of Linear and Notion, TaskFlow delivers an ultra-smooth user experience with instant responsive interactions, custom HSL design tokens, glassmorphism, comprehensive filter matrices, interactive Kanban drag-and-drop workflows, sprint velocity analytics, calendar schedule tracking, and robust multi-user task delegation.

The architecture combines a blazing-fast **React 19 single-page application** powered by Vite with a strict **TypeScript Express REST backend**, featuring a dual-database architecture with high-performance local SQLite (WAL mode) and Cloud Postgres via Neon.

---

## ✨ Key Features

### 🗂️ Versatile Task Workspaces
- **📊 Executive Dashboard**: Real-time KPI metric cards (Total Tasks, In Progress, Completed, Due Soon), velocity progress bars, priority distribution charts, and upcoming deadline tracking.
- **📋 Structured Task Table**: High-density table view with sortable columns, multi-select checkboxes, and bulk action toolbars (batch deletion, bulk status transitions).
- **📌 Interactive Kanban Board**: Visual workflow board (`To Do`, `In Progress`, `Done`) with inline card creation, priority tags, due date alerts, and assignee badges.
- **📅 Calendar View**: Monthly grid rendering task milestones directly onto their due dates with overdue highlights.
- **📈 Analytics & Velocity**: Sprint completion rate meters, task distribution breakdowns, and team workload insights.
- **👥 Team Directory**: Workspace team member directory with assigned task counts and role badges.
- **🏷️ Taxonomy & Tag Management**: Dynamic color-coded tags for custom multi-dimensional filtering.
- **⚙️ Workspace Preferences**: Dark/light mode theme engine, notification settings, and user profile management.

### 🔐 Enterprise-Grade Authentication & Safety
- **Stateless JWT Authentication**: Secure Bearer token workflow with configurable token expiration (`1h`).
- **Cryptographic Password Hashing**: Passwords hashed with `bcryptjs` (10 salt rounds).
- **Protected REST API Routes**: Middleware guarding private routes and ensuring user isolation.
- **SQL Injection Prevention**: 100% parameterized queries via `better-sqlite3`.
- **Security Hardening**: Integrated HTTP security headers via `Helmet` and restrictive `CORS` policies.

---

## 🛠️ Tech Stack

### Frontend Client
| Technology | Description |
|---|---|
| **React 19** | Latest modern UI library with Hooks and Concurrent rendering |
| **TypeScript** | Strict compile-time type safety across all components and models |
| **Vite 8** | Next-generation frontend build tool and ultra-fast HMR dev server |
| **Vanilla CSS Design System** | Bespoke design system utilizing HSL variables, fluid animations, and dark/light themes |
| **Lucide Icons** | Crisp, scalable icon library |

### Backend API & Database
| Technology | Description |
|---|---|
| **Node.js + Express 5** | High-performance modular REST API server |
| **better-sqlite3** | Ultra-fast synchronous SQLite driver configured in Write-Ahead Logging (`WAL`) mode |
| **Neon Cloud Postgres** | Serverless Postgres integration for cloud data storage |
| **JSON Web Tokens (`jsonwebtoken`)** | Signed token generation and verification for stateless sessions |
| **Bcrypt.js** | Industry-standard password hashing algorithm |
| **Helmet & Morgan** | HTTP security header hardening and request logging |

### Tooling & QA
| Technology | Description |
|---|---|
| **Jest & ts-jest** | Automated test runner with full TypeScript support |
| **Supertest** | High-level HTTP assertions for end-to-end API integration tests |
| **Oxlint** | High-speed JavaScript/TypeScript linter |
| **TSX** | TypeScript execution engine with watch mode for backend development |

---

## 🗄️ Database Architecture

TaskFlow uses a normalized relational schema with foreign key integrity and automated cascade rules.

```
  ┌─────────────────────────────────┐
  │              USERS              │
  ├─────────────────────────────────┤
  │ id (PK, TEXT)                   │
  │ name (TEXT)                     │
  │ email (TEXT, UNIQUE)            │
  │ password_hash (TEXT)            │
  │ initials (TEXT)                 │
  │ color (TEXT)                    │
  │ created_at / updated_at (TEXT)  │
  └───────────────┬─────────────────┘
                  │ 1
                  │
                  │ *
  ┌───────────────┴─────────────────┐
  │              TASKS              │
  ├─────────────────────────────────┤
  │ id (PK, TEXT)                   │
  │ key (TEXT, UNIQUE)              │ ──> e.g. "TASK-101"
  │ title (TEXT)                    │
  │ description (TEXT)              │
  │ status (TEXT: todo/in-prog/done)│
  │ priority (TEXT: high/med/low)   │
  │ assignee_id (FK -> users.id)    │ ──> ON DELETE SET NULL
  │ created_by (FK -> users.id)     │ ──> ON DELETE CASCADE
  │ due_date (TEXT)                 │
  │ tags (TEXT: JSON Array)         │
  │ created_at / updated_at (TEXT)  │
  └─────────────────────────────────┘
```

### SQL Table Definitions
```sql
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

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### 🔐 Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | No | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Authenticate & get JWT token | No | `{ email, password }` |
| `GET` | `/api/auth/me` | Fetch active user profile | `Bearer <token>` | *None* |
| `GET` | `/api/auth/users` | List users for task assignment | `Bearer <token>` | *None* |

### 📋 Task Management Endpoints (`/api/tasks`)

| Method | Endpoint | Description | Auth Required | Query / Request Body |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Get filtered tasks | `Bearer <token>` | Query: `status`, `priority`, `search`, `sortBy` |
| `GET` | `/api/tasks/stats` | Get sprint velocity & metrics | `Bearer <token>` | *None* |
| `GET` | `/api/tasks/:id` | Get single task by ID | `Bearer <token>` | *None* |
| `POST` | `/api/tasks` | Create a new task | `Bearer <token>` | `{ title, description?, status, priority, assignee_id?, due_date?, tags? }` |
| `PUT` | `/api/tasks/:id` | Update task fields | `Bearer <token>` | Partial `{ title, description, status, priority, assignee_id, due_date, tags }` |
| `DELETE` | `/api/tasks/:id` | Delete task by ID | `Bearer <token>` | *None* |
| `POST` | `/api/tasks/bulk-delete` | Batch delete tasks | `Bearer <token>` | `{ ids: string[] }` |

### 🩺 Health Check (`/api/health`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status & uptime | No |

---

## 📁 Project Structure

```text
task-tracker/
├── public/                     # Static assets, SVG icons, favicons
├── server/                     # Backend API application
│   ├── data/                   # SQLite database file storage (taskflow.db)
│   ├── src/
│   │   ├── config/             # Environment configuration (env.ts)
│   │   ├── controllers/        # REST route handlers (authController, taskController)
│   │   ├── db/                 # Database initialization, schema, migrations & seed
│   │   ├── middleware/         # Auth guard, error handlers, not-found handlers
│   │   ├── routes/             # Express route routers (auth, task, health)
│   │   ├── utils/              # Token generation, password hashing utils
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server listener
│   ├── tests/                  # Jest + Supertest REST API test suites
│   └── tsconfig.json           # Server TypeScript configuration
├── src/                        # Frontend React client
│   ├── assets/                 # Brand graphics and logos
│   ├── components/             # Reusable UI & feature components
│   │   ├── auth/               # Login / Signup modal & forms
│   │   ├── dashboard/          # Metric cards, velocity and priority charts
│   │   ├── layout/             # Top navbar, responsive sidebar, shell layout
│   │   ├── tasks/              # Kanban board, Task table, Task modal, Filter bar
│   │   └── ui/                 # Buttons, Badges, Toasts, Avatars, Empty states
│   ├── context/                # Global React Context state (AppContext.tsx)
│   ├── data/                   # Mock and fallback seed datasets
│   ├── pages/                  # Page views (Dashboard, Board, Calendar, Analytics, etc.)
│   ├── services/               # REST API client services (api.ts)
│   ├── types/                  # Shared TypeScript interfaces & models
│   ├── utils/                  # Helper functions, formatters, date utilities
│   ├── App.tsx                 # Root application routing & view switcher
│   ├── index.css               # Global design tokens, themes & CSS reset
│   └── main.tsx                # Client entry point
├── .env.example                # Sample environment variables template
├── jest.config.cjs             # Jest testing configuration
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # Root project TypeScript references
├── tsconfig.app.json           # Client Vite TypeScript configuration
├── tsconfig.node.json          # Node tools TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/task-tracker.git
cd task-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h
DB_TYPE=sqlite
DB_PATH=./server/data/taskflow.db
```

### 4. Run Development Servers

Open two terminal tabs to run both client and server concurrently:

#### Terminal 1 — Backend API:
```bash
npm run server:dev
```
*The Express REST API will start on `http://localhost:5000`.*

#### Terminal 2 — Frontend Client:
```bash
npm run dev
```
*The Vite development server will start on `http://localhost:5173`.*

---

## 👤 Default Demo Credentials

The database automatically initializes and seeds demo workspace accounts on first startup:

| Account | Email | Password | Role |
|---|---|---|---|
| **Akshat Shukla** | `akshat@taskflow.dev` | `password123` | Admin / Lead |
| **Sarah Chen** | `sarah@taskflow.dev` | `password123` | Senior Engineer |
| **Marcus Johnson** | `marcus@taskflow.dev` | `password123` | Product Designer |

---

## 🧪 Testing Suite

TaskFlow includes an automated integration test suite utilizing **Jest** and **Supertest** to validate all authentication flows and task CRUD lifecycles.

```bash
# Run all automated test suites
npm test
```

### Test Coverage Highlights:
- ✅ **Authentication**: User signup, duplicate email rejection, password strength validation, valid login JWT generation, invalid credential rejection, authenticated `/api/auth/me` profile retrieval.
- ✅ **Task Management**: Auth token guard enforcement, task creation and auto-key generation, input validation, detail retrieval, lifecycle updates (status/priority), deletion persistence, and sprint statistics aggregation.

---

## 🛡️ Security & Data Integrity

- **Password Security**: Uses `bcryptjs` with 10 salt rounds to hash credentials before storage.
- **Stateless Verification**: JWT validation occurs on every protected API endpoint via centralized `authMiddleware`.
- **Injection Safety**: Parameterized queries guarantee protection against SQL injection vulnerabilities.
- **CORS & Headers**: Strict CORS origin whitelisting (`CLIENT_ORIGIN`) and Helmet security headers prevent cross-site scripting and unauthorized embedding.
- **Relational Integrity**: SQLite foreign key support (`PRAGMA foreign_keys = ON`) guarantees referential integrity between users and tasks.

---

## 📦 Production Build

To compile both client and backend for production deployment:

```bash
# Build the client bundle with Vite
npm run build

# Compile the server TypeScript code
npm run server:build

# Start the compiled production server
npm run server:start
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Crafted with ❤️ by <a href="https://github.com/akshat-shukla">Akshat Shukla</a>
</div>

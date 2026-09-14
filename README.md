<div align="center">

# ⚡ Stride — Make progress, everyday

**A high-performance, full-stack productivity & sprint management platform engineered with React 19, TypeScript, Express, SQLite, Neon Cloud Postgres, Real Email Delivery, and Multi-Tenant Team Workspaces.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-strideeee.netlify.app-4F46E5?style=for-the-badge&logo=netlify)](https://strideeee.netlify.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Cloud%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tests](https://img.shields.io/badge/Tests-28%20Passed-brightgreen?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#-license)

<br />

[Live Demo](https://strideeee.netlify.app) • [Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Database Architecture](#-database-architecture) • [API Reference](#-api-documentation) • [Email Engine](#-real-life-email-dispatch-engine) • [Getting Started](#-getting-started) • [Testing](#-testing-suite) • [Security](#-security--data-integrity)

</div>

---

## 📖 Overview

**Stride** is a modern sprint management and team collaboration workspace designed for individuals and fast-moving teams. Inspired by the editorial aesthetics of Linear and Notion, Stride delivers an ultra-smooth user experience with instant responsive interactions, custom HSL design tokens, glassmorphism, comprehensive filter matrices, interactive Kanban drag-and-drop workflows, sprint velocity analytics, calendar schedule tracking, multi-tenant team workspaces, and real-life email invitations.

The platform is deployed live on Netlify with serverless functions and utilizes a **dual-database architecture** supporting local SQLite with Write-Ahead Logging (`WAL`) for lightning-fast local development and **Neon Cloud Postgres** for serverless production scale.

---

## ✨ Key Features

### 👥 Multi-Tenant Team Workspaces
- **🗂️ Card-Wise Workspace Navigation**: Visual, interactive workspace cards. Click any workspace card to enter it immediately with **0ms instant cache hydration**.
- **🔒 Complete Data Isolation**: Every task, member roster, and invitation is strictly scoped to its active team workspace (`x-team-id` header).
- **🛡️ Role-Based Access Control (RBAC)**: Supports `owner`, `admin`, and `member` roles with permission gates.
- **🗑️ Owner Workspace Deletion**: Team owners can permanently delete workspaces with automatic cascade cleanup of tasks, members, and invitations, safeguarded by a confirmation modal.

### 📧 Real-Life Email Delivery Engine (IRL)
- **✉️ Branded HTML Templates**: Responsive email templates sent directly to collaborators with 1-click tokenized join links (`/join?token=...`).
- **🚀 Dual-Engine Delivery**:
  - **Gmail SMTP**: Direct email dispatch to any recipient worldwide without requiring custom domain verification.
  - **Resend REST API**: High-throughput REST delivery with automated error reporting and sandbox feedback.
- **⏱️ Secure Token Lifecycles**: Cryptographically secure 48-character invite tokens with 7-day expiration and automatic acceptance.

### 🗂️ Sprint & Task Management Views
- **📊 Executive Dashboard**: Real-time KPI metrics (Total Tasks, In Progress, Completed, Due Soon), velocity progress bars, and priority distribution charts.
- **📋 Structured Task Table**: High-density table view with sortable columns, multi-select checkboxes, and bulk action toolbars (batch deletion, bulk status updates).
- **📌 Interactive Kanban Board**: Visual workflow board (`To Do`, `In Progress`, `Done`) with priority badges, assignee tags, and due date alerts.
- **📅 Interactive Calendar**: Monthly calendar grid mapping tasks directly to their deadlines with overdue badges.
- **📈 Analytics & Velocity**: Sprint completion rate meters, task distribution breakdowns, and team workload insights.
- **🏷️ Dynamic Tags**: Color-coded taxonomy tags for multi-dimensional filtering and search.

### 🔐 Authentication & Form Security
- **Stateless JWT Authentication**: Secure Bearer token workflow with configurable expiration (`1h`).
- **Cryptographic Password Hashing**: Passwords hashed with `bcryptjs` (10 salt rounds).
- **Password Preview & Strength Indicator**: Interactive show/hide toggle and real-time password strength meter.
- **Granular Error Handling**: Clear user feedback for invalid credentials, duplicate registrations, and expired sessions.

---

## 🛠️ Tech Stack

### Frontend Client
| Technology | Description |
|---|---|
| **React 19** | Latest UI library with Concurrent rendering and modern Hooks |
| **TypeScript** | Strict compile-time type safety across all components and models |
| **Vite 8** | Ultra-fast frontend build tool and hot-module replacement (HMR) |
| **Vanilla CSS Design System** | Custom HSL design tokens, micro-animations, glassmorphism, and responsive layout |
| **Context API + SWR Cache** | Global state management with 0ms in-memory workspace caching |

### Backend API & Serverless
| Technology | Description |
|---|---|
| **Node.js + Express 5** | High-performance modular REST API server |
| **Serverless HTTP** | Netlify serverless function wrapper (`netlify/functions/api.ts`) |
| **better-sqlite3** | Synchronous SQLite driver configured in Write-Ahead Logging (`WAL`) mode |
| **Neon Serverless Postgres** | Cloud database with connection pooling and branching |
| **Nodemailer** | SMTP transport engine for Gmail and custom mail servers |
| **Resend API** | Modern cloud email delivery integration |
| **JSON Web Tokens (`jsonwebtoken`)** | Signed token verification for stateless authentication |
| **Bcrypt.js** | Password hashing algorithm with salt rounds |
| **Helmet & Morgan** | HTTP security headers and structured request logging |

### Tooling & Quality Assurance
| Technology | Description |
|---|---|
| **Jest & ts-jest** | Automated test runner with 28 integration test suites |
| **Supertest** | HTTP assertions for end-to-end REST API verification |
| **Oxlint** | High-speed JavaScript & TypeScript linter |
| **TSX** | TypeScript execution engine with live watch mode |

---

## 🗄️ Database Architecture

Stride features a normalized relational schema with foreign key integrity and automated cascade rules, operational on both **SQLite** and **Neon Cloud Postgres**.

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
                  ├───────────────────────────────┐
                  │ 1                             │ 1
                  │ *                             │ *
  ┌───────────────┴─────────────────┐    ┌────────┴────────────────────────┐
  │              TEAMS              │    │          TEAM_MEMBERS           │
  ├─────────────────────────────────┤    ├─────────────────────────────────┤
  │ id (PK, TEXT)                   │    │ id (PK, TEXT)                   │
  │ name (TEXT)                     │<───┤ team_id (FK -> teams.id)        │
  │ slug (TEXT)                     │    │ user_id (FK -> users.id)        │
  │ created_by (FK -> users.id)     │    │ role (owner/admin/member)       │
  │ created_at / updated_at (TEXT)  │    │ joined_at (TEXT)                │
  └───────────────┬─────────────────┘    └─────────────────────────────────┘
                  │ 1
                  │
                  ├───────────────────────────────┐
                  │ *                             │ *
  ┌───────────────┴─────────────────┐    ┌────────┴────────────────────────┐
  │              TASKS              │    │         TEAM_INVITATIONS        │
  ├─────────────────────────────────┤    ├─────────────────────────────────┤
  │ id (PK, TEXT)                   │    │ id (PK, TEXT)                   │
  │ key (TEXT, UNIQUE)              │    │ team_id (FK -> teams.id)        │
  │ team_id (FK -> teams.id)        │    │ email (TEXT)                    │
  │ title (TEXT)                    │    │ role (member/admin)             │
  │ description (TEXT)              │    │ token (TEXT, UNIQUE)            │
  │ status (todo/in-progress/done)  │    │ status (pending/accepted/rev)   │
  │ priority (high/medium/low)      │    │ created_by (FK -> users.id)     │
  │ assignee_id (FK -> users.id)    │    │ expires_at (TEXT)               │
  │ created_by (FK -> users.id)     │    │ created_at (TEXT)               │
  │ due_date (TEXT)                 │    └─────────────────────────────────┘
  │ tags (TEXT: JSON Array)         │
  │ created_at / updated_at (TEXT)  │
  └─────────────────────────────────┘
```

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api` (Local) or `https://strideeee.netlify.app/api` (Production)

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user account | No | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Authenticate & obtain JWT | No | `{ email, password }` |
| `GET` | `/api/auth/me` | Fetch active profile & teams | `Bearer <token>` | *None* |
| `GET` | `/api/auth/users` | List users for task assignment | `Bearer <token>` | *None* |

### 👥 Teams & Workspaces (`/api/teams`)
| Method | Endpoint | Description | Auth Required | Request Body / Query |
|---|---|---|---|---|
| `GET` | `/api/teams` | List user's workspaces | `Bearer <token>` | *None* |
| `POST` | `/api/teams` | Create a new team workspace | `Bearer <token>` | `{ name }` |
| `DELETE` | `/api/teams/:id` | Delete team workspace (Owner only) | `Bearer <token>` | *None* |
| `GET` | `/api/teams/:id/members` | Get workspace members | `Bearer <token>` | *None* |
| `DELETE` | `/api/teams/:id/members/:userId` | Remove member from workspace | `Bearer <token>` | *None* |
| `POST` | `/api/teams/:id/invite` | Dispatch email invitation | `Bearer <token>` | `{ email, role }` |
| `GET` | `/api/teams/:id/invitations` | Get pending workspace invites | `Bearer <token>` | *None* |
| `GET` | `/api/teams/invite/:token` | Inspect invitation details | No | *None* |
| `POST` | `/api/teams/invite/:token/accept`| Accept invitation & join team | `Bearer <token>` | *None* |

### 📋 Task Management (`/api/tasks`)
| Method | Endpoint | Description | Auth Required | Header / Body |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Get workspace tasks | `Bearer <token>` | `x-team-id: <teamId>` |
| `GET` | `/api/tasks/stats` | Sprint analytics & metrics | `Bearer <token>` | `x-team-id: <teamId>` |
| `GET` | `/api/tasks/:id` | Get single task by ID | `Bearer <token>` | `x-team-id: <teamId>` |
| `POST` | `/api/tasks` | Create task in workspace | `Bearer <token>` | `{ title, description?, status, priority, assignee_id?, due_date?, tags? }` |
| `PUT` | `/api/tasks/:id` | Update task details | `Bearer <token>` | Partial task update payload |
| `DELETE` | `/api/tasks/:id` | Delete single task | `Bearer <token>` | *None* |
| `POST` | `/api/tasks/bulk-delete` | Batch delete selected tasks | `Bearer <token>` | `{ ids: string[] }` |

### 🩺 Health Check (`/api/health`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health status and uptime | No |

---

## 📧 Real-Life Email Dispatch Engine

Stride supports two enterprise email delivery strategies:

### Option A: Gmail SMTP (Default & Zero Setup)
Send real invitation emails to **any recipient address** without requiring a custom domain name:
```env
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_letter_app_password
EMAIL_FROM="Stride <your_email@gmail.com>"
```

### Option B: Resend REST API (Custom Domain)
Send high-volume transactional emails via Resend:
```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM="Stride <invites@yourdomain.com>"
```

---

## 📁 Project Structure

```text
task-tracker/
├── netlify/                    # Netlify serverless functions
│   └── functions/
│       └── api.ts              # Express API serverless handler
├── public/                     # Static assets and favicons
├── server/                     # Backend API application
│   ├── data/                   # Local SQLite database files (taskflow.db)
│   ├── src/
│   │   ├── config/             # Environment variables (env.ts)
│   │   ├── controllers/        # REST handlers (auth, tasks, teams)
│   │   ├── db/                 # Database initialization, schemas & migrations
│   │   ├── middleware/         # JWT auth guards & error handlers
│   │   ├── routes/             # Express routers (authRoutes, taskRoutes, teamRoutes)
│   │   ├── services/           # Production email engine (emailService.ts)
│   │   ├── utils/              # Token generation & password hashing
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Standalone HTTP server
│   ├── tests/                  # Jest + Supertest REST API test suites
│   └── tsconfig.json           # Server TypeScript configuration
├── src/                        # Frontend React client
│   ├── assets/                 # Brand graphics and icons
│   ├── components/             # Reusable UI & layout components
│   │   ├── auth/               # Login / Signup forms & password preview
│   │   ├── dashboard/          # Metric cards, velocity and priority charts
│   │   ├── layout/             # Top navbar, workspace switcher modal, sidebar
│   │   ├── tasks/              # Kanban board, task table, modal, filter bar
│   │   └── ui/                 # Buttons, Badges, Toasts, Avatars
│   ├── context/                # Global React Context with SWR cache (AppContext.tsx)
│   ├── pages/                  # Page views (Dashboard, Board, Calendar, Team, etc.)
│   ├── services/               # Frontend API client (api.ts)
│   ├── types/                  # TypeScript interfaces & models
│   ├── utils/                  # Helper utilities and formatters
│   ├── App.tsx                 # Root application router
│   ├── index.css               # Design system tokens and global reset
│   └── main.tsx                # Client entry point
├── netlify.toml                # Netlify deployment & redirect config
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # Root TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/axatshukla/Stride.git
cd Stride
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create your local `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Configure your `.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=stride_super_secret_jwt_key_2026
JWT_EXPIRES_IN=1h

# Database Configuration
DB_TYPE=sqlite
DB_PATH=./server/data/taskflow.db

# Real Email Delivery (Gmail SMTP)
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
EMAIL_FROM="Stride <your_email@gmail.com>"
```

### 4. Run Development Servers
Run both client and server concurrently:
```bash
npm run dev
```
- Client runs on `http://localhost:5173`
- Backend API runs on `http://localhost:5000`

---

## 🧪 Testing Suite

Stride includes a comprehensive integration test suite covering 28 automated test assertions across authentication, task management, and multi-tenant team workflows.

```bash
# Run all automated test suites
npm test
```

### Test Coverage Highlights:
- ✅ **Authentication**: User registration, password validation, duplicate rejection, login JWT issuance, invalid password rejection, profile retrieval.
- ✅ **Task Management**: Auth token guard, task creation with auto-increment keys, lifecycle transitions, filtering matrices, sprint statistics calculation.
- ✅ **Team Workspaces & Invites**: Team creation, member listings, email invitation dispatch with secure tokens, public invite lookup, invitation acceptance, data isolation between teams, and owner-only workspace deletion.

---

## 🛡️ Security & Data Integrity

- **Bcrypt Password Hashing**: Passwords are cryptographically salted and hashed before persistence.
- **JWT Authorization Guards**: Protected routes enforce valid Bearer tokens and verify session validity.
- **Multi-Tenant Scoping**: All task queries enforce team boundary isolation via `x-team-id` headers.
- **SQL Injection Prevention**: 100% parameterized queries via `better-sqlite3` and Neon tagged template literals.
- **HTTP Security Hardening**: Secured with `Helmet` security headers and restrictive CORS policies.

---

## 📦 Production Deployment

### Netlify Deployment
Stride is configured for 1-click Netlify deployment with automatic serverless functions:
```bash
# Build the client bundle with Vite
npm run build
```
In your Netlify Site Configuration:
1. Set Build Command: `npm ci && npm run build`
2. Set Publish Directory: `dist`
3. Set Functions Directory: `netlify/functions`
4. Add environment variables: `SMTP_USER`, `SMTP_PASS`, `JWT_SECRET`, `DATABASE_URL` (for Neon Postgres).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Crafted with ❤️ by <a href="https://github.com/axatshukla">Akshat Shukla</a>
</div>

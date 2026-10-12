# ⚡ JARVIS API — Backend REST Engine & Automated Notification Daemon

> **Live Repositories:** [Backend API](https://github.com/ZoZoGami/Jarvis-server) | [Client Frontend](https://github.com/ZoZoGami/Jarvis-client)

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=json-web-tokens)](https://jwt.io/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-SMTP-22B573?logo=nodemailer)](https://nodemailer.com/)
[![node-cron](https://img.shields.io/badge/node--cron-Task_Scheduler-003545)](https://github.com/node-cron/node-cron)

The backend engine powering the **JARVIS Productivity Command Center**. Built with **Express 5**, **Node.js**, and **MongoDB Atlas**, this service delivers RESTful endpoints for multi-tenant task and schedule management, combined with an automated background worker that monitors reminder due dates and dispatches email notifications via SMTP.

---

## 🚀 What Does the JARVIS Backend Do? (At a Glance)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   JARVIS SERVER CORE                                   │
├──────────────────────────────────┬─────────────────────────────────────────────────────┤
│ 🌐 RESTFUL API SERVICES          │ ⏰ BACKGROUND CRON DAEMON                           │
│ • User Isolation & Multi-Tenancy │ • Automated Polling Every 60 Seconds                │
│ • Full CRUD for Priority Tasks   │ • Finds Reminders Due in <= 5 Minutes               │
│ • 7-Day Timetable Matrix Storage │ • Auto-dispatches HTML Email via Gmail SMTP         │
│ • Course-Grouped Resource Links  │ • Flags Completed Notifications to Prevent Dups     │
├──────────────────────────────────┴─────────────────────────────────────────────────────┤
│ 🔐 DUAL-LAYER SECURITY & DATABASE CLOUD ARCHITECTURE                                   │
│ • JWT Authorization Headers (`Bearer <token>`) & Expired Token Rejection               │
│ • Connection-Pooled MongoDB Atlas Client (Singleton Pattern with Graceful Shutdown)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Services & How They Work

### 1. 📧 Background Email Reminder Daemon (`scheduled/reminderJobs.js`)
* **How it works:** A background daemon scheduled via `node-cron` runs every minute (`*/1 * * * *`).
* **Detection Logic:** Queries the MongoDB `reminders` collection for unnotified documents with timestamps within the next 5 minutes:
  ```javascript
  { datetime: { $lte: new Date(now.getTime() + 5 * 60000) }, completed: false, notified: { $ne: true } }
  ```
* **HTML Email Delivery:** Automatically connects to Gmail SMTP via Nodemailer and delivers a branded notification email to the user's registered inbox.
* **Idempotency:** Marks `notified: true` upon successful dispatch so emails are never duplicated.

### 2. 📅 Routine Persistence Engine (`controllers/routineController.js`)
* **How it works:** Stores 7-day class routines across 7 university time slots per day.
* **Auto-Merge Upsert:** When a student edits any cell in their timetable, the server updates or creates the user's weekly routine document in MongoDB.

### 3. ✍️ Multi-Tenant Task Management (`controllers/todoController.js`)
* **How it works:** User-scoped CRUD endpoints (`/api/todos/user/:email`) ensuring students only retrieve, create, modify, and delete their own tasks.
* **Priority Fields:** Supports `high`, `medium`, and `low` tags with automatic timestamps (`createdAt`, `updatedAt`).

### 4. 📁 Academic Course Link Aggregator (`controllers/academicLinkController.js`)
* **How it works:** Manages course-specific study resources (Google Drive folders, GitHub repos, Zoom links) organized by university course code.

---

## 🛠️ Complete Tech Stack

| Component | Technology | Purpose |
|---|---|---|
| **Runtime** | **Node.js 18+** | High-performance asynchronous JavaScript engine |
| **Framework** | **Express.js 5.x** | RESTful routing, middleware pipelines, error handling |
| **Database** | **MongoDB Atlas (v6 Native Driver)** | Cloud NoSQL persistence with connection pooling |
| **Task Scheduling** | **node-cron** | Minute-by-minute background task execution |
| **Email Protocol** | **Nodemailer** | SMTP transport for automated reminder delivery |
| **Security & Auth** | **JWT (`jsonwebtoken`)**, **bcryptjs** | Stateless token verification & password hashing |
| **Cross-Origin** | **cors** | Domain-whitelisted HTTP origin policy |
| **Configuration** | **dotenv** | Environment-based configuration management |

---

## 🔌 Complete REST API Reference

### 1. Todos (`/api/todos`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/todos/user/:email` | Retrieve all tasks for authenticated user |
| `POST` | `/api/todos` | Create a new task (`title`, `todo`, `priority`, `email`) |
| `PATCH` | `/api/todos/:id` | Update task title, description, priority, or completion |
| `DELETE` | `/api/todos/:id` | Delete task by MongoDB `_id` |

### 2. Class Routines (`/api/routines`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/routines/user/:email` | Retrieve user's 7-day weekly class timetable |
| `POST` | `/api/routines` | Save or update full timetable matrix |

### 3. Reminders (`/api/reminders`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reminders/user/:email` | Fetch all scheduled reminders for user |
| `POST` | `/api/reminders` | Create reminder (`title`, `description`, `datetime`, `type`, `email`) |
| `PATCH` | `/api/reminders/:id` | Toggle completion status |
| `DELETE` | `/api/reminders/:id` | Remove reminder |

### 4. Academic Resources (`/api/academic-links`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/academic-links/user/:email` | Fetch all course links grouped by course code |
| `POST` | `/api/academic-links` | Add a new course resource link |
| `DELETE` | `/api/academic-links/:id` | Remove resource link |

---

## ⚙️ Quick Start (Local Setup)

### 1. Clone & Install
```bash
git clone https://github.com/ZoZoGami/Jarvis-server.git
cd Jarvis-server
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/jarvis?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Gmail SMTP for Automated Reminders
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Run Server
```bash
# Development (with nodemon auto-restart)
npm run dev

# Production
npm start
```
Server boots at `http://localhost:5000`. Test health status at `http://localhost:5000/health`.

---

## 👤 Author

**Fayez Ahmad Protik**
* Backend Architecture & RESTful API Design
* Background Task Workers & Email Automation (node-cron, Nodemailer)
* Database Modeling & Cloud Deployment (MongoDB Atlas)

---

## 📄 License
This project is open-source and available under the **MIT License**.

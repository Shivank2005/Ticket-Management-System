<div align="center">
  
# 🎫 AI-Powered Ticket Support Management System
  
**A Production-Grade, Full-Stack Real-Time Support Desk built with FastAPI, React, and WebSockets.**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 📖 Overview

The **AI-Powered Ticket Support Management System** is a modern, highly scalable helpdesk solution designed to streamline customer support. Moving beyond simple CRUD functionality, this application leverages **Real-Time WebSockets** for live collaboration and **Artificial Intelligence (LLMs)** to automate ticket categorization and draft responses. 

Designed with a premium "Glassmorphism" UI and robust Role-Based Access Control (RBAC), it provides a secure and seamless experience for End-Users, Support Agents, and Administrators.

---

## ✨ Key Features

- **🔴 Live Real-Time Architecture:** Powered by WebSockets, the platform features instant UI updates. Ticket modifications, live typing indicators, and agent online/offline statuses sync instantly across all clients without refreshing.
- **🤖 AI-Assisted Workflows:** Integrates Large Language Models (LLMs) to automatically categorize incoming tickets and generate draft responses, drastically reducing agent resolution time.
- **🛡️ Role-Based Access Control (RBAC):** Secure JWT authentication with three distinct tiers:
  - **Administrators:** Full system control, user management, and agent creation.
  - **Agents:** Dedicated Kanban dashboard for managing and resolving assigned tickets.
  - **Users:** Clean, intuitive interface for submitting and tracking support requests.
- **📋 Interactive Kanban Board:** Agents can drag-and-drop tickets across different statuses (Open, In Progress, Resolved) for effortless workflow management.
- **🎨 Premium UI/UX:** Built with React and Vite, featuring dynamic dark mode, smooth micro-animations, glowing gradients, and responsive layouts.
- **⚙️ Profile & Settings Management:** Secure in-app password updates and email modifications.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Vite (Build Tool)
- CSS3 (Vanilla CSS with CSS Variables for Theme Management)
- WebSockets API

**Backend:**
- Python 3
- FastAPI (Asynchronous Web Framework)
- MongoDB & Motor (Async NoSQL Database)
- PyJWT (Authentication)
- Uvicorn (ASGI Server)

---

## 🚀 Live Demo Credentials

Want to explore the application without signing up? Use the following dummy credentials to explore the different Role Dashboards:

### 👑 Administrator Account
- **Portal:** `/staff`
- **Username:** `admin_demo`
- **Password:** `AdminSecure123!`
- **Capabilities:** View all tickets, manage users, create new agent accounts, view analytics.

### 🎧 Support Agent Account
- **Portal:** `/staff`
- **Username:** `agent_demo`
- **Password:** `AgentSecure123!`
- **Capabilities:** Access the Kanban board, reply to tickets, utilize AI features, change ticket statuses.

### 👤 End-User Account
- **Portal:** `/` (Main Login)
- **Username:** `user_demo`
- **Password:** `UserSecure123!`
- **Capabilities:** Submit tickets, view personal ticket history, reply to agents.

---

## 💻 Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
- Node.js (v16+)
- Python (3.10+)
- MongoDB (Local or Atlas Cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ticket-management-system.git
cd ticket-management-system
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=generate_a_secure_random_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8090
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The application will now be running on `http://localhost:5173`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/yourusername/ticket-management-system/issues).

## 📝 License

This project is licensed under the MIT License.

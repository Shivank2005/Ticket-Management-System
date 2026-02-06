# Ticket Management System

A full-stack **Support Ticket Management System** designed to streamline issue submission, tracking, and resolution.  
Built with a modern, scalable tech stack using **FastAPI**, **React**, **MongoDB**, **Redis**, **RabbitMQ**, and **Docker**.

---

## Features

- **Secure Authentication & Authorization**
  - JWT-based authentication
  - Password hashing
  - Role-based access control (Admin / Agent / User)

- **Ticket Management**
  - Create, update, view, and resolve support tickets
  - Status tracking (Open, In-Progress, Resolved, Closed)

- **High Performance Backend**
  - FastAPI for asynchronous, high-speed APIs
  - MongoDB for flexible NoSQL ticket storage

- **Caching with Redis**
  - Optimized repeated database queries
  - Reduced latency and improved response times

- 📧 **Asynchronous Email Processing**
  - Password reset emails
  - Ticket creation & update notifications
  - Powered by RabbitMQ for non-blocking background tasks

- **Dockerized Deployment**
  - Fully containerized frontend, backend, and services
  - Consistent and easy setup across environments

---

## 🛠 Tech Stack

### Frontend
- React
- Axios
- Modern UI components

### Backend
- FastAPI
- JWT Authentication
- Pydantic
- Python AsyncIO

### Databases & Messaging
- MongoDB
- Redis
- RabbitMQ

### DevOps
- Docker
- Docker Compose

---

## Project Structure

## 📂 Project Structure

```text
ticket-management-system/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md


---

## Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend development)
- Python 3.9+

### Run with Docker
```bash
docker-compose up --build

Frontend: http://localhost:3000
Backend API: http://localhost:8000



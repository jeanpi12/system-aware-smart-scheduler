# System-Aware Smart Scheduler

A full-stack scheduling platform inspired by operating-system CPU scheduling concepts.  
This application allows users to create and manage tasks, generate schedules using multiple algorithms, compare scheduling strategies, and visualize execution blocks through a modern React frontend backed by FastAPI and PostgreSQL.

## Overview

System-Aware Smart Scheduler was built to go beyond a simple to-do app. Instead of only storing tasks, it applies scheduling strategies inspired by operating systems to determine execution order and evaluate outcomes.

The project supports:

- user authentication with JWT-based login
- task creation, editing, deletion, filtering, and sorting
- persistent PostgreSQL storage
- multiple scheduling algorithms
- live schedule comparison
- Dockerized full-stack setup

This project was designed to showcase full-stack engineering, backend architecture, database integration, and systems-oriented thinking.

---

## Key Features

### Authentication
- user registration
- user login with JWT access tokens
- session persistence in the frontend
- user-specific task ownership

### Task Management
- create tasks
- edit existing tasks
- delete tasks
- search by title, description, or category
- filter by category and priority
- sort by newest, deadline, priority, or estimated hours

### Scheduling Engine
- Priority Scheduling (Non-Preemptive)
- Shortest Job First (Non-Preemptive)
- Round Robin
- configurable Round Robin time quantum
- task execution block generation
- deadline completion metrics
- algorithm comparison summaries

### Dashboard and Visualization
- live dashboard summary
- schedule metrics
- visual execution timeline
- comparison metric bars
- algorithm-specific execution block display

### Infrastructure
- FastAPI backend
- PostgreSQL database
- React frontend with Vite
- Dockerized full stack using Docker Compose

---

## Scheduling Algorithms

### Priority Scheduling
Tasks are ordered by highest priority first.  
If two tasks share the same priority, earlier deadlines are used as a tie-breaker.

### Shortest Job First (SJF)
Tasks are ordered by smallest estimated duration first.  
This helps prioritize shorter jobs for faster completion.

### Round Robin
Tasks are executed in time slices using a configurable time quantum.  
This algorithm can split a task into multiple execution blocks and is useful for demonstrating time-sliced scheduling behavior.

---

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic

### Database
- PostgreSQL

### Authentication
- JWT
- Passlib / bcrypt

### Infrastructure
- Docker
- Docker Compose
- Nginx

---

## Architecture

The application is split into three main layers:

### Frontend
The React frontend handles:
- authentication UI
- dashboard display
- task management interface
- scheduling visualization
- comparison views

### Backend
The FastAPI backend handles:
- authentication
- task CRUD operations
- scheduling logic
- algorithm comparison
- database access
- API validation

### Database
PostgreSQL stores:
- users
- tasks

Tasks are scoped to authenticated users, and scheduling algorithms run only on the tasks owned by the currently logged-in user.

---

## Project Structure

```text
system-aware-smart-scheduler/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   ├── models/
│   │   ├── scheduler/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
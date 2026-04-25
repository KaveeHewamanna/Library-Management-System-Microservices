# 📚 Library Management System — Microservices Architecture

**IT4020: Modern Topics in IT | Assignment 2 | 2026**

A microservices-based backend for a Library Management System, demonstrating API Gateway patterns, independent service deployment, and Swagger API documentation.

---

## 👥 Group Members & Services

| Student ID | Service | Port | Direct Swagger |
|---|---|---|---|
| IT22563750 | User Management Service | 3001 | http://localhost:3001/api-docs |
| IT22604958 | Book Management Service | 3002 | http://localhost:3002/api-docs |
| IT22584090 | Reservation Management Service | 3003 | http://localhost:3003/api-docs |
| IT22258694 | Borrow & Fine Management Service | 3004 | http://localhost:3004/api-docs |
| — (Shared) | API Gateway | 3000 | http://localhost:3000 |

---

## 🏗️ Architecture

```
                          ┌─────────────────────────────────┐
                          │          API GATEWAY             │
  Client ──────────────▶  │       localhost:3000             │
                          │  (JWT Auth + Route Proxy)        │
                          └──────┬──────┬──────┬────────┬───┘
                                 │      │      │        │
              ┌──────────────────┘      │      │        └─────────────────┐
              │                         │      │                          │
              ▼                         ▼      ▼                          ▼
  ┌───────────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐
  │  User Service     │  │ Book Service │  │ Reservation  │  │ Borrow & Fine Svc   │
  │  :3001            │  │ :3002        │  │ Service :3003│  │ :3004               │
  │  (IT22563750)     │  │ (IT22604958) │  │ (IT22584090) │  │ (IT22258694)        │
  └────────┬──────────┘  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘
           │                    │                  │                      │
           ▼                    ▼                  ▼                      ▼
  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐
  │ MongoDB        │  │ MongoDB        │  │ MongoDB        │  │ MongoDB            │
  │ library_users  │  │ library_books  │  │ library_res..  │  │ library_borrows    │
  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running on `localhost:27017`

### Option 1: PowerShell Script (Recommended)
```powershell
# 1. Install all dependencies
.\install-all.ps1

# 2. Start all services + gateway
.\start-all.ps1
```

### Option 2: Docker Compose
```bash
docker-compose up --build
```

### Option 3: Manual Start
```powershell
# Terminal 1
cd user-service && npm start

# Terminal 2
cd book-service && npm start

# Terminal 3
cd reservation-service && npm start

# Terminal 4
cd borrow-fine-service && npm start

# Terminal 5 (start after services are up)
cd api-gateway && npm start
```

---

## 🛠️ Data Initialization & Test Credentials

When you run `.\install-all.ps1`, a global initialization script (`seed.js`) automatically connects to all four MongoDB Atlas databases simultaneously. It completely clears the databases and populates them with:
- **10 Realistic IT & Fantasy Books**
- **1 Active Reservation** (A reserved copy of 'Clean Code')
- **1 Active Borrow** (An overdue copy of '1984')

### Secure Test Accounts Seeded

| Role | Name | Email | Password |
|---|---|---|---|
| **Librarian / Admin** | Head Librarian | `admin@library.lk` | `Admin123` |
| **Standard Member** | Alice Johnson | `alice@student.lk` | `Member123` |

Use these credentials to log into the system or generate JWT Access Tokens via the Swagger UI.

---

## 🔗 API Endpoints via Gateway (port 3000)

### User Management
| Method | Gateway URL | Description |
|--------|-------------|-------------|
| POST | /api/users/register | Register new user |
| POST | /api/users/login | Login & get JWT token |
| GET | /api/users/ | List all users |
| GET | /api/users/:id | Get user by ID |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Book Management
| Method | Gateway URL | Description |
|--------|-------------|-------------|
| POST | /api/books/ | Add new book |
| GET | /api/books/ | List all books |
| GET | /api/books/:id | Get book by ID |
| GET | /api/books/search?q= | Search books |
| PUT | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |

### Reservation Management
| Method | Gateway URL | Description |
|--------|-------------|-------------|
| POST | /api/reservations/ | Create reservation |
| GET | /api/reservations/ | List all reservations |
| GET | /api/reservations/:id | Get reservation by ID |
| GET | /api/reservations/user/:userId | Get reservations by user |
| PUT | /api/reservations/:id | Update reservation status |
| DELETE | /api/reservations/:id | Cancel reservation |

### Borrow & Fine Management
| Method | Gateway URL | Description |
|--------|-------------|-------------|
| POST | /api/borrows/ | Issue a borrow |
| GET | /api/borrows/ | List all borrows |
| GET | /api/borrows/:id | Get borrow record |
| PUT | /api/borrows/:id/return | Return a book |
| GET | /api/borrows/fines | List all fines |
| POST | /api/borrows/fines/:id/pay | Pay a fine |

---

## 🔐 Authentication

1. Register a user: `POST /api/users/register`
2. Login to get token: `POST /api/users/login`
3. Use the JWT token in all subsequent requests:
   ```
   Authorization: Bearer <your-token-here>
   ```
> **Note:** `/api/users/register` and `/api/users/login` are public endpoints. All other endpoints require a valid JWT.

---

## 📂 Project Structure

```
library-management-system/
├── api-gateway/          # API Gateway — routes all traffic, enforces JWT
├── user-service/         # User Management — IT22563750
├── book-service/         # Book Management — IT22604958
├── reservation-service/  # Reservation Management — IT22584090
├── borrow-fine-service/  # Borrow & Fine Management — IT22258694
├── docker-compose.yml    # One-command Docker startup
├── start-all.ps1         # PowerShell startup script
├── install-all.ps1       # PowerShell dependency installer
└── README.md
```

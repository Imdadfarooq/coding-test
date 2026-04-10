# MEANShop — Full Stack Angular 19 + Node.js + MySQL

A complete full-stack application with Angular 19 standalone components, Node.js/Express backend, and MySQL via Sequelize ORM.

---

## 🏗 Project Structure

```
mean-app/
├── backend/                  # Node.js + Express + MySQL
│   ├── config/
│   │   └── database.js       # Sequelize MySQL connection
│   ├── controllers/
│   │   ├── authController.js     # JWT auth (register/login)
│   │   ├── productController.js  # CRUD for products
│   │   ├── orderController.js    # CRUD for orders
│   │   └── weatherController.js  # OpenWeatherMap integration
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware + role guard
│   │   └── errorHandler.js   # Validation + global error handler
│   ├── models/
│   │   ├── User.js           # MySQL Users table (bcrypt passwords)
│   │   ├── Product.js        # MySQL Products table
│   │   └── Order.js          # MySQL Orders table (FK to users)
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/register|login
│   │   ├── products.js       # GET|POST|PUT|DELETE /api/products
│   │   ├── orders.js         # GET|POST|PUT|DELETE /api/orders
│   │   └── weather.js        # GET /api/weather
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── product.test.js
│   │   └── order.test.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/                 # Angular 19 Standalone
    └── src/app/
        ├── core/
        │   ├── guards/auth.guard.ts
        │   ├── interceptors/auth.interceptor.ts
        │   └── services/
        │       ├── auth.service.ts      # Signal-based auth state
        │       ├── product.service.ts   # Signal-based product state
        │       ├── order.service.ts     # Signal-based order state
        │       └── weather.service.ts   # OpenWeatherMap integration
        ├── features/
        │   ├── auth/login/ & register/
        │   ├── dashboard/               # Stats + Weather widget
        │   ├── products/list/ & form/
        │   └── orders/list/ & form/ & detail/
        └── shared/models/index.ts
```

---

## ⚙️ Prerequisites

- Node.js >= 18.x
- MySQL >= 8.x
- Angular CLI (`npm install -g @angular/cli@19`)

---

## 🗄 Database Setup

```sql
-- In MySQL console:
CREATE DATABASE mean_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mean_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mean_app_db.* TO 'mean_user'@'localhost';
FLUSH PRIVILEGES;
```

Tables are auto-created by Sequelize on first run.

---

## 🚀 Backend Setup

```bash
cd backend

# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your MySQL credentials:
#    DB_HOST=localhost
#    DB_PORT=3306
#    DB_NAME=mean_app_db
#    DB_USER=mean_user
#    DB_PASSWORD=your_password
#    JWT_SECRET=super_secret_key
#    WEATHER_API_KEY=your_openweathermap_key   (optional)

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
# → Server runs at http://localhost:3000

# 5. Run tests
npm test
```

---

## 🌐 Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server (proxies /api → localhost:3000)
npm start
# → App runs at http://localhost:4200

# 3. Run unit tests
npm test
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user (protected) |

### Products (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (pagination, search, filter) |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft-delete product |

### Orders (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (own or all for admin) |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather?city=London` | Current weather |
| GET | `/api/weather/forecast?city=London` | 5-day forecast |

> **Note:** Weather returns mock data if `WEATHER_API_KEY` is not set.  
> Get a free key at [openweathermap.org](https://openweathermap.org/api)

---

## 🔐 Authentication Flow

1. Register via `/auth/register` or login via `/auth/login`
2. JWT token stored in `localStorage`
3. `authInterceptor` attaches `Authorization: Bearer <token>` to all API calls
4. `authGuard` protects all routes except `/auth/*`
5. Passwords hashed with `bcryptjs` (12 salt rounds)

---

## 🧪 Tests

### Backend (Jest + Supertest)
```bash
cd backend && npm test
```
- `auth.test.js` — Registration, login, validation
- `product.test.js` — CRUD + auth + validation
- `order.test.js` — CRUD + ownership + admin access

### Frontend (Karma + Jasmine)
```bash
cd frontend && npm test
```
- `auth.service.spec.ts` — Signal state, login, logout, persistence
- `product.service.spec.ts` — CRUD operations, state updates
- `order.service.spec.ts` — CRUD operations, state management

---

## 📐 Angular Architecture

- **Standalone components** (no NgModules)
- **Signal-based state management** (Angular 19 signals)
- **Lazy-loaded routes** via `loadComponent()`
- **Functional guards** (`authGuard`, `guestGuard`)
- **HTTP interceptors** for JWT injection
- **Reactive forms** with validation

---

## 🌤 Weather Integration

The dashboard includes a live weather widget powered by [OpenWeatherMap API](https://openweathermap.org/api):

- Current temperature, humidity, wind speed, visibility
- 5-day forecast
- City search with Enter key or button
- Falls back to mock data gracefully when API key is absent

---

## 📦 MySQL Schema

### users
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | PK |
| username | VARCHAR(100) | UNIQUE |
| email | VARCHAR(255) | UNIQUE |
| password | VARCHAR(255) | bcrypt hashed |
| role | ENUM('user','admin') | default: 'user' |
| createdAt / updatedAt | DATETIME | auto |

### products
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT | PK |
| name | VARCHAR(200) | required |
| price | DECIMAL(10,2) | required, ≥ 0 |
| description | TEXT | optional |
| stock | INT | default: 0 |
| category | VARCHAR(100) | optional |
| isActive | BOOLEAN | soft delete flag |

### orders
| Field | Type | Notes |
|-------|------|-------|
| orderId | INT AUTO_INCREMENT | PK |
| userId | INT | FK → users.id |
| productIds | JSON | array of product IDs |
| totalAmount | DECIMAL(12,2) | auto-calculated |
| status | ENUM | pending/processing/shipped/delivered/cancelled |
| shippingAddress | TEXT | optional |
| notes | TEXT | optional |

# FixItNow 🔧

> **Your Trusted Home Service Platform**

FixItNow is a backend REST API for a home services marketplace where customers can find and book technicians for services such as plumbing, electrical work, cleaning, painting, and more.

The platform supports three roles:

* 👤 **Customer** — Browse services, book technicians, make payments, track bookings, and leave reviews.
* 🛠️ **Technician** — Manage service profiles, availability, bookings, and job status.
* 👑 **Admin** — Manage users, bookings, service categories, and the overall platform.

---

## 📌 Table of Contents

* [Project Overview](#-project-overview)
* [Features](#-features)
* [User Roles](#-user-roles)
* [Tech Stack](#-tech-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Database Design](#-database-design)
* [API Endpoints](#-api-endpoints)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Database Setup](#-database-setup)
* [Running the Project](#-running-the-project)
* [API Testing](#-api-testing)
* [Authentication](#-authentication)
* [Payment Integration](#-payment-integration)
* [Booking Flow](#-booking-flow)
* [Error Handling](#-error-handling)
* [Validation](#-validation)
* [Admin Account](#-admin-account)
* [Production Build](#-production-build)
* [Deployment](#-deployment)
* [Future Improvements](#-future-improvements)
* [Author](#-author)

---

# 🚀 Project Overview

FixItNow connects customers with professional technicians who provide home services.

### Customer Flow

```text
Register/Login
      ↓
Browse Services
      ↓
Find Technician
      ↓
View Technician Profile
      ↓
Create Booking
      ↓
Technician Accepts Booking
      ↓
Make Payment
      ↓
Technician Starts Job
      ↓
Job Completed
      ↓
Leave Review
```

### Technician Flow

```text
Register/Login
      ↓
Create Technician Profile
      ↓
Add Services
      ↓
Set Availability
      ↓
Receive Booking
      ↓
Accept / Decline
      ↓
Start Job
      ↓
Complete Job
```

### Admin Flow

```text
Login
 ↓
Manage Users
 ↓
Manage Categories
 ↓
Monitor Bookings
 ↓
Manage Platform
```

---

# ✨ Features

## Public Features

* Browse available services
* Browse technicians
* Search and filter services
* Filter technicians
* View technician profiles
* View technician ratings and reviews
* Browse service categories

## Customer Features

* Customer registration
* Login with JWT authentication
* View own profile
* Book a technician
* Select service and preferred time
* Track booking status
* Cancel eligible bookings
* Make online payments
* View payment history
* View payment status
* Leave reviews after completing a job

## Technician Features

* Technician registration
* Technician profile management
* Add/update service information
* Set availability slots
* View incoming bookings
* Accept bookings
* Decline bookings
* Update job status
* Mark jobs as completed

## Admin Features

* View all users
* Manage user status
* Ban/unban users
* View all bookings
* Manage service categories
* Create categories
* Monitor platform activities

---

# 👥 User Roles

| Role           | Main Responsibilities                              |
| -------------- | -------------------------------------------------- |
| 👤 Customer    | Book services, payments, reviews                   |
| 🛠️ Technician | Provide services, manage availability and bookings |
| 👑 Admin       | Manage users, categories and bookings              |

Users select their role during registration.

> Admin accounts should not be publicly creatable through normal registration.

---

# 🛠️ Tech Stack

## Backend

| Technology          | Purpose                   |
| ------------------- | ------------------------- |
| Node.js             | JavaScript runtime        |
| Express.js          | REST API framework        |
| TypeScript          | Type safety               |
| PostgreSQL          | Relational database       |
| Prisma              | ORM / database access     |
| JWT                 | Authentication            |
| bcrypt              | Password hashing          |
| Zod                 | Request validation        |
| Stripe / SSLCommerz | Online payment processing |

## Development Tools

* Git & GitHub
* Postman / Thunder Client
* Prisma Studio
* VS Code

---

# 🏗️ System Architecture

FixItNow follows a modular backend architecture.

```text
Client
  │
  ▼
Express Server
  │
  ├── Routes
  │
  ├── Controllers
  │
  ├── Services
  │
  ├── Validation
  │
  ├── Authentication
  │
  └── Error Handler
          │
          ▼
       Prisma ORM
          │
          ▼
      PostgreSQL
```

Typical request flow:

```text
HTTP Request
     ↓
Router
     ↓
Authentication Middleware
     ↓
Validation
     ↓
Controller
     ↓
Service
     ↓
Prisma
     ↓
PostgreSQL
     ↓
Response
```

---

# 📁 Project Structure

A typical project structure:

```text
fixitnow/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── customer/
│   │   │   ├── technician/
│   │   │   ├── service/
│   │   │   ├── category/
│   │   │   ├── booking/
│   │   │   ├── payment/
│   │   │   └── review/
│   │   │
│   │   ├── middlewares/
│   │   ├── errors/
│   │   └── routes/
│   │
│   ├── config/
│   ├── helpers/
│   ├── lib/
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

> The exact structure may vary depending on the implementation.

---

# 🗄️ Database Design

The main entities are:

```text
User
 │
 │
 └── TechnicianProfile
 │         │
 │         ├── AvailabilitySlots
 │         └── Services
 │                 │
 │                 ▼
 │              Category
 │
 │
 ├── CustomerProfile
        │─────── Booking ─────── Technician
                    │
                    ├── Payment
                    │
                    └── Review
```

### Main Models

* `User`
* `CustomerProfile`
* `TechnicianProfile`
* `AvailabilitySlot`
* `Category`
* `Service`
* `Booking`
* `Payment`
* `Review`

PostgreSQL is used as the primary database and Prisma manages database access.

---

# 🔌 API Endpoints

Base URL:

```text
/api
```

## Authentication

| Method | Endpoint         | Description                  | Access        |
| ------ | ---------------- | ---------------------------- | ------------- |
| POST   | `/auth/register` | Register customer/technician | Public        |
| POST   | `/auth/login`    | Login                        | Public        |
| GET    | `/auth/me`       | Current authenticated user   | Authenticated |

---

## Services & Technicians

| Method | Endpoint           | Description                  | Access |
| ------ | ------------------ | ---------------------------- | ------ |
| GET    | `/services`        | Get services with filters    | Public |
| GET    | `/technicians`     | Get technicians with filters | Public |
| GET    | `/technicians/:id` | Get technician details       | Public |
| GET    | `/categories`      | Get service categories       | Public |

---

## Bookings

| Method | Endpoint        | Description         | Access          |
| ------ | --------------- | ------------------- | --------------- |
| POST   | `/bookings`     | Create booking      | Customer        |
| GET    | `/bookings`     | Get own bookings    | Authenticated   |
| GET    | `/bookings/:id` | Get booking details | Authorized user |

---

## Technician

| Method | Endpoint                   | Description               | Access     |
| ------ | -------------------------- | ------------------------- | ---------- |
| PUT    | `/technician/profile`      | Update technician profile | Technician |
| PUT    | `/technician/availability` | Update availability       | Technician |
| GET    | `/technician/bookings`     | Get technician bookings   | Technician |
| PATCH  | `/technician/bookings/:id` | Update booking status     | Technician |

---

## Payments

| Method | Endpoint            | Description                   | Access           |
| ------ | ------------------- | ----------------------------- | ---------------- |
| POST   | `/payments/create`  | Create payment session/intent | Customer         |
| POST   | `/payments/confirm` | Confirm/verify payment        | Payment provider |
| GET    | `/payments`         | Payment history               | Customer         |
| GET    | `/payments/:id`     | Payment details               | Authorized user  |

---

## Reviews

| Method | Endpoint   | Description   | Access   |
| ------ | ---------- | ------------- | -------- |
| POST   | `/reviews` | Create review | Customer |

---

## Admin

| Method | Endpoint            | Description      | Access |
| ------ | ------------------- | ---------------- | ------ |
| GET    | `/admin/users`      | Get all users    | Admin  |
| PATCH  | `/admin/users/:id`  | Ban/unban user   | Admin  |
| GET    | `/admin/bookings`   | Get all bookings | Admin  |
| GET    | `/admin/categories` | Get categories   | Admin  |
| POST   | `/admin/categories` | Create category  | Admin  |

> Check the API documentation/Postman collection for the exact request and response formats implemented in this project.

---

# ⚙️ Getting Started

Follow these steps to run FixItNow locally.

## 1. Clone the Repository

```bash
git clone https://github.com/arian2004feni/b7a4-fixItNow.git
```

Move into the project directory:

```bash
cd b7a4-fixItNow
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
touch .env
```

On Windows, you can simply create a new file named:

```text
.env
```

Add the required environment variables.

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME"

APP_URL=

PORT=3000

BCRYPT_SALT_ROUNDS=10

JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_ACCESS_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d

STRIPE_PRODUCT_ID=prod_.....
STRIPE_SECRET_KEY=sk_test_......
STRIPE_WEBHOOK_SECRET=whsec_.......
```

> Never commit your real `.env` file or secret keys to GitHub.

---

# 🗃️ Database Setup

Make sure PostgreSQL is installed and running.

Then configure your `DATABASE_URL`.

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fixitnow"
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

If the project contains a seed script, run:

```bash
npx prisma db seed
```

You can inspect your database using:

```bash
npx prisma studio
```

Prisma Studio will open a browser interface where you can inspect and manage database records.

---

# ▶️ Running the Project

## Development Mode

Run:

```bash
npm run dev
```

The server should start at:

```text
http://localhost:5000
```

If your project uses a different port, check your `.env` configuration.

---

# 🏭 Production Build

First generate Prisma Client:

```bash
npx prisma generate
```

Then build the TypeScript project:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

The production flow is:

```text
TypeScript
    ↓
tsc
    ↓
dist/
    ↓
server.js
    ↓
Node.js
```

---

# 🧪 API Testing

FixItNow is a backend-only project, so APIs can be tested using:

* Postman
* Thunder Client
* Insomnia
* Swagger/OpenAPI

Recommended testing order:

### Step 1 — Register

```http
POST /api/auth/register
```

Create:

```text
Customer
```

and:

```text
Technician
```

---

### Step 2 — Login

```http
POST /api/auth/login
```

Copy the returned JWT token.

Use it in protected requests:

```http
Authorization: Bearer YOUR_TOKEN
```

---

### Step 3 — Test Public APIs

Try:

```http
GET /api/categories
GET /api/services
GET /api/technicians
GET /api/technicians/:id
```

---

### Step 4 — Configure Technician

Login as a technician and test:

```http
PUT /api/technician/profile
```

Then configure availability:

```http
PUT /api/technician/availability
```

---

### Step 5 — Create Booking

Login as a customer:

```http
POST /api/bookings
```

Provide the required:

* Service
* Technician
* Date
* Time
* Address
* Other required booking information

---

### Step 6 — Accept Booking

Login as the technician:

```http
PATCH /api/technician/bookings/:id
```

Set the booking status to:

```text
ACCEPTED
```

---

### Step 7 — Make Payment

After the booking is accepted:

```http
POST /api/payments/create
```

Complete the payment using the configured payment provider.

---

### Step 8 — Complete the Job

The technician can move the booking through the appropriate statuses:

```text
REQUESTED
   ↓
ACCEPTED
   ↓
PAID
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

---

### Step 9 — Leave Review

After completion, the customer can submit:

```http
POST /api/reviews
```

---

# 🔐 Authentication

FixItNow uses JWT-based authentication.

After successful login, the API returns a JWT token.

Send the token with protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

Authentication middleware verifies:

1. Token exists
2. Token is valid
3. User exists
4. User has permission to access the requested resource

Role-based authorization protects role-specific endpoints.

Example:

```text
Customer → Customer endpoints
Technician → Technician endpoints
Admin → Admin endpoints
```

---

# 💳 Payment Integration

Payment processing is a mandatory feature of FixItNow.

The system supports online payment through:

* Stripe
* SSLCommerz

The payment flow is:

```text
Customer creates booking
        ↓
Technician accepts booking
        ↓
Customer creates payment
        ↓
Payment provider processes payment
        ↓
Payment confirmed
        ↓
Payment status updated
        ↓
Booking continues
```

Payment records should contain information such as:

```text
transactionId
bookingId
amount
paymentMethod
provider
status
paidAt
```

Possible payment statuses:

```text
PENDING
COMPLETED
FAILED
```

> Use test/sandbox credentials during development.

---

# 📊 Booking Status

The booking lifecycle follows:

```text
REQUESTED
    │
    ├──────────────► DECLINED
    │
    ▼
ACCEPTED
    │
    ▼
PAID
    │
    ▼
IN_PROGRESS
    │
    ▼
COMPLETED
```

Customers may cancel a booking before it reaches `IN_PROGRESS`, according to the application's business rules.

---

# ❌ Error Handling

The API returns consistent structured error responses.

Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorDetails": {
    "field": "email",
    "message": "Invalid email address"
  }
}
```

Common error types include:

* Validation errors
* Authentication errors
* Authorization errors
* Resource not found
* Duplicate records
* Database errors
* Payment errors
* Invalid booking status transitions

---

# ✅ Input Validation

Server-side validation is applied to API requests.

Validation helps prevent:

* Invalid email addresses
* Invalid passwords
* Missing required fields
* Invalid IDs
* Invalid booking status
* Invalid payment information
* Invalid availability slots

Invalid requests should return meaningful error messages instead of allowing invalid data into the database.

---

# 👑 Admin Account

A working admin account is required for testing the admin functionality.

Use the credentials provided with the deployed/demo version of the project.

> **Security:** Never publish a real production password inside this README. For evaluation, provide temporary credentials through the assignment submission or a secure channel.

Example:

```text
Email:    admin@example.com
Password: ********
```

---

# 📚 API Documentation

The project should provide API documentation through either:

### Postman

Import the provided Postman collection and configure:

```text
baseUrl
token
```

### OR Swagger/OpenAPI

Open the Swagger documentation:

```text
/api-docs
```

> Replace this path with the actual Swagger URL if your implementation uses a different route.

---

# 🧑‍💻 Complete Local Setup Tutorial

If you are starting the project from zero, follow this checklist.

```text
1. Install Node.js
        ↓
2. Install PostgreSQL
        ↓
3. Clone repository
        ↓
4. npm install
        ↓
5. Create .env
        ↓
6. Configure DATABASE_URL
        ↓
7. Configure JWT secret
        ↓
8. Configure payment credentials
        ↓
9. npx prisma generate
        ↓
10. npx prisma migrate dev
        ↓
11. Seed database (if available)
        ↓
12. npm run dev
        ↓
13. Open Postman
        ↓
14. Register customer
        ↓
15. Register technician
        ↓
16. Login
        ↓
17. Test services/technicians
        ↓
18. Configure technician
        ↓
19. Create booking
        ↓
20. Accept booking
        ↓
21. Test payment
        ↓
22. Complete booking
        ↓
23. Submit review
```

---

# 🐛 Troubleshooting

## Prisma Client Error

Run:

```bash
npx prisma generate
```

Then restart the server.

---

## Database Connection Error

Check:

```env
DATABASE_URL="..."
```

Make sure:

* PostgreSQL is running
* Database exists
* Username is correct
* Password is correct
* Host and port are correct

---

## Migration Error

Check your Prisma schema:

```bash
npx prisma validate
```

Then:

```bash
npx prisma migrate dev
```

---

## Environment Variable Not Found

Make sure:

```text
.env
```

exists in the project root and restart the server after modifying it.

---

## Port Already in Use

Change:

```env
PORT=5000
```

to another available port, for example:

```env
PORT=5001
```

---

# 🚀 Deployment

The API can be deployed using platforms such as:

* Render
* Vercel
* Other Node.js-compatible hosting platforms

Before deployment:

```bash
npm install
npx prisma generate
npm run build
```

Configure all production environment variables in the hosting platform.

Important variables include:

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

Do not upload `.env` to GitHub.

---

# 🔒 Security Notes

* Passwords are hashed before being stored.
* JWT is used for authentication.
* Role-based authorization protects restricted routes.
* Environment variables are used for secrets.
* Payment credentials must never be committed to Git.
* Admin creation should be restricted.
* Input validation is performed on API requests.

---

# 🔮 Future Improvements

Potential improvements for FixItNow V2:

* 📍 Real-time technician location tracking
* 🔔 Email/SMS notifications
* 📱 Mobile application
* 💬 Customer-technician chat
* ⭐ Advanced review and rating system
* 📅 Advanced calendar-based availability
* 🧾 Invoice generation
* 🔄 Refund management
* 🎟️ Discount/coupon system
* 📊 Admin analytics dashboard
* 🔎 Advanced search
* ⚡ Redis caching
* 📨 Queue-based notifications
* 🧪 Automated unit/integration tests
* 📖 Complete Swagger/OpenAPI documentation
* 🐳 Docker support
* 🔐 Refresh-token authentication
* 📈 Monitoring and logging

---

# 🎯 Assignment Requirements

FixItNow fulfills the major backend assignment requirements:

* [x] REST API
* [x] Three user roles
* [x] Authentication & authorization
* [x] PostgreSQL database
* [x] Prisma ORM
* [x] CRUD operations
* [x] Server-side validation
* [x] Structured error responses
* [x] Booking system
* [x] Technician availability
* [x] Review system
* [x] Online payment integration
* [x] Admin management
* [x] API testing through Postman/Thunder Client
* [x] Production build

---

# 📹 Demo Video

The project demonstration covers:

1. Project overview
2. API architecture
3. Customer workflow
4. Technician workflow
5. Admin workflow
6. CRUD operations
7. Authentication
8. Validation
9. Error handling
10. Payment integration
11. A technical challenge and its solution

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

```bash
git clone https://github.com/arian2004feni/b7a4-fixItNow.git

cd b7a4-fixItNow

npm install

git checkout -b feature/your-feature
```

Make your changes, test them, and create a pull request.

---

# 📄 License

This project was created for educational and portfolio purposes.

---

# 👨‍💻 Author

**Arian**

Backend Developer | Node.js | Express.js | TypeScript | PostgreSQL | Prisma

GitHub:

`https://github.com/arian2004feni`

---

## ⭐ If you find this project useful

Give the repository a ⭐ and feel free to explore the code.

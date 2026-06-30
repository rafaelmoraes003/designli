# Designli — Technical Documentation

## Project Overview

Designli is a full-stack mobile application that allows users to monitor stock prices and receive push notifications when a stock reaches a target price defined by the user.

The application was built with a clear separation between frontend and backend, following REST principles and using JWT authentication, MongoDB persistence, scheduled background jobs, and Firebase Cloud Messaging for real-time notifications.

---

# Features

## Authentication

The application provides secure user authentication through:

- User registration
- User login
- Password hashing using **bcrypt**
- JWT-based authentication
- Protected API routes
- Persistent sessions using AsyncStorage

---

## Stock Explorer

Users can browse the list of available stocks retrieved from the Finnhub API.

Features include:

- Search stocks by symbol or company name
- View the latest stock price
- Open a price chart for each stock

---

## Price Alerts

Authenticated users can create custom price alerts.

Each alert contains:

- Stock symbol
- Target price

Users can:

- Create alerts
- View all active alerts
- Delete alerts

Every alert belongs exclusively to the authenticated user.

---

## Push Notifications

A background scheduler continuously monitors all pending alerts.

Whenever a stock reaches the configured target price:

- A Firebase Cloud Messaging notification is sent to the user's device.
- The alert is marked as triggered.
- Future executions ignore triggered alerts, preventing duplicate notifications.

---

# System Architecture

```text
                    +-----------------------+
                    |   React Native App    |
                    +-----------+-----------+
                                |
                                | REST API
                                |
                    +-----------v-----------+
                    |      NestJS API       |
                    +-----------+-----------+
                                |
        +-----------+-----------+-----------+
        |           |                       |
        |           |                       |
+-------v------+ +--v--------------+ +------v------+
| Authentication| | Alert Service  | | Finnhub API |
+--------------+ +-----------------+ +-------------+
        |
        |
+-------v--------------------+
| Firebase Cloud Messaging   |
+----------------------------+
        |
        |
+-------v--------------------+
|         MongoDB            |
+----------------------------+
```

---

# Backend Architecture

The backend is organized into independent modules following the NestJS architecture.

## Modules

### AuthModule

Responsible for:

- User authentication
- JWT generation
- Password validation
- Route protection

---

### UsersModule

Responsible for:

- User registration
- Storing Firebase device tokens
- User management

---

### AlertsModule

Responsible for:

- Creating alerts
- Listing alerts
- Deleting alerts
- Ownership validation

---

### FinnhubModule

Responsible for:

- Retrieving stock symbols
- Retrieving stock prices
- Communicating with the Finnhub API

---

### AlertCheckerService

Runs automatically every minute using NestJS Scheduler.

Execution flow:

1. Retrieve all pending alerts
2. Fetch the current stock price
3. Compare against the target price
4. Send push notification if necessary
5. Mark the alert as triggered

---

# Authentication Flow

```text
User Registration
        │
        ▼
Password Hash (bcrypt)
        │
        ▼
Store User
        │
        ▼
User Login
        │
        ▼
JWT Generated
        │
        ▼
Stored in AsyncStorage
        │
        ▼
Authorization: Bearer <token>
```

---

# Alert Notification Flow

```text
User Creates Alert
        │
        ▼
Alert Saved
        │
        ▼
Scheduler (Every Minute)
        │
        ▼
Request Current Price
        │
        ▼
Target Price Reached?
      │             │
      No           Yes
      │             │
      ▼             ▼
 Continue     Send FCM Notification
                    │
                    ▼
         Mark Alert as Triggered
```

---

# Database Design

## User Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | User identifier |
| name | String | Unique username |
| password | String | bcrypt hash |
| fcmToken | String | Firebase device token |

---

## Alert Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Alert identifier |
| userId | ObjectId | Owner of the alert |
| symbol | String | Stock ticker |
| targetPrice | Number | Desired price |
| triggered | Boolean | Notification status |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

---

# API Overview

## Authentication

### POST /auth/login

Authenticates a user and returns a JWT token.

---

## Users

### POST /users

Creates a new user account.

### PATCH /users/fcm-token

Stores or updates the Firebase Cloud Messaging token.

Authentication required.

---

## Alerts

### GET /alerts

Returns all alerts belonging to the authenticated user.

### POST /alerts

Creates a new alert.

### DELETE /alerts/:id

Deletes an existing alert.

Only the alert owner can perform this action.

---

## Finnhub

### GET /finnhub/stocks

Returns available US stock symbols.

### GET /finnhub/quote/:symbol

Returns the current stock price.

---

# Security

The application implements several security best practices.

## Password Protection

Passwords are never stored in plain text.

They are hashed using **bcrypt** before persistence.

---

## JWT Authentication

Protected routes require a valid JWT.

Authentication is handled through Passport's JWT Strategy.

---

## Request Validation

Incoming requests are validated using **class-validator**.

Examples include:

- Username length
- Password complexity
- Required fields
- Target price validation
- Stock symbol validation

---

## Authorization

Users can only access their own alerts.

Ownership is verified before allowing deletion.

---

# Frontend Structure

```text
frontend/
│
├── app/
│   ├── (auth)
│   ├── (tabs)
│   └── index.tsx
│
├── components/
│
├── hooks/
│
├── services/
│
└── assets/
```

---

# Backend Structure

```text
backend/
│
├── auth/
├── users/
├── alerts/
├── finnhub/
├── common/
├── firebase/
└── main.ts
```

---

# Technologies

## Backend

- NestJS
- Node.js
- MongoDB
- Mongoose
- Passport JWT
- bcrypt
- class-validator
- Firebase Admin SDK
- Finnhub API
- @nestjs/schedule

---

## Frontend

- React Native
- Expo
- Expo Router
- React Native Firebase
- AsyncStorage

---

## Infrastructure

- Railway
- MongoDB Atlas
- Firebase Cloud Messaging
- EAS Build

---

# Deployment

The backend is deployed on Railway.

Environment variables include:

- JWT_SECRET
- MONGO_URL
- FINNHUB_API_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

The mobile application is distributed as a native Android APK built using **EAS Build**, since Firebase Cloud Messaging requires native modules unavailable in Expo Go.

---

# Running the Project

## Backend

```bash
cd backend
npm install
npm run start:dev
```

---

## Frontend

```bash
cd frontend
npm install
npx expo start
```

---

## Android Build

```bash
eas build -p android
```

> **Note:** Push notifications only work in a native build generated with EAS Build. They are not supported in Expo Go.

---

# Possible Future Improvements

Although the application meets all requested requirements, several improvements could be added in future iterations:

- Edit existing alerts
- Alert conditions for both price increase and decrease
- Historical notification log
- Better stock chart visualization
- User profile management
- Docker Compose deployment
- Unit and integration tests
- CI/CD pipeline
- Rate limiting
- API documentation with Swagger

---

# Conclusion

This project demonstrates the implementation of a complete mobile application using modern technologies and good backend architecture practices.

The application includes secure authentication, persistent storage, scheduled background processing, external API integration, and real-time push notifications while maintaining a modular and scalable architecture.

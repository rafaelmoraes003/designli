# Designli — Stock Price Alert App

A full-stack mobile application that lets users track stock prices in real time and receive push notifications when a stock reaches a target price they've set.

## Overview

Designli was built to satisfy the following functional requirements:

1. User authentication (sign up / login)
2. Form to create a stock price alert
3. List of available stocks
4. Stock price chart/visualization
5. Firebase Cloud Messaging (FCM) notification when a stock price crosses the user's alert threshold

## Tech Stack

**Backend**
- NestJS (Node.js framework)
- MongoDB (Mongoose ODM)
- JWT authentication (Passport)
- Finnhub API (stock market data)
- Firebase Admin SDK (push notifications)
- Scheduled jobs (`@nestjs/schedule`) for price monitoring

**Frontend**
- React Native (Expo)
- Expo Router (navigation)
- React Native Firebase (FCM)
- AsyncStorage (JWT persistence)

**Infrastructure**
- Backend deployed on Railway
- MongoDB hosted on Railway / MongoDB Atlas
- Mobile app built with EAS Build (Android APK)

## Architecture

### Authentication

- Passwords are hashed with `bcrypt` before being stored
- On login, the server issues a JWT signed with a secret key
- Protected routes use a custom `JwtAuthGuard` (built with Passport's JWT strategy) to verify the token and attach the authenticated user (`req.user`) to each request
- The frontend stores the JWT in `AsyncStorage` and attaches it to every authenticated request via the `Authorization: Bearer <token>` header

### API Routes

**Users**
| Method | Route | Description | Protected |
|--------|-------|-------------|-----------|
| POST | `/users` | Create a new user account | No |
| PATCH | `/users/fcm-token` | Save/update the device's FCM token | Yes |

**Auth**
| Method | Route | Description | Protected |
|--------|-------|-------------|-----------|
| POST | `/auth/login` | Authenticate and receive a JWT | No |

**Alerts**
| Method | Route | Description | Protected |
|--------|-------|-------------|-----------|
| GET | `/alerts` | List all alerts for the logged-in user | Yes |
| POST | `/alerts` | Create a new stock price alert | Yes |
| DELETE | `/alerts/:id` | Delete an alert (only by its owner) | Yes |

**Finnhub (Stock Data)**
| Method | Route | Description | Protected |
|--------|-------|-------------|-----------|
| GET | `/finnhub/stocks` | List all available stocks (US market) | Yes |
| GET | `/finnhub/quote/:symbol` | Get real-time quote for a given stock symbol | Yes |

### Data Validation

- DTOs use `class-validator` decorators to enforce input rules (e.g. username length, password complexity, stock symbol format, minimum target price) before any request reaches the service layer.

### Price Monitoring & Notifications

A scheduled job (`AlertCheckerService`) runs every minute:

1. Fetches all alerts marked as not yet triggered
2. Queries Finnhub for the current price of each alert's stock symbol
3. If the current price has reached or exceeded the user's target price:
   - Sends a push notification via Firebase Cloud Messaging to the user's registered device
   - Marks the alert as `triggered` to avoid duplicate notifications

### Database Schema

**User**
- `name: string` (unique, min 5 characters)
- `password: string` (hashed, requires uppercase, lowercase, number, and symbol)
- `fcmToken: string` (optional, set after login)

**Alert**
- `userId: ObjectId` (reference to User)
- `symbol: string` (stock ticker, e.g. "AAPL")
- `targetPrice: number`
- `triggered: boolean` (default false)
- `createdAt` / `updatedAt` (automatic timestamps)

## Mobile App Screens

- **Sign Up** — create an account with validated username/password rules
- **Login** — authenticate and persist JWT + register FCM token
- **Home**
  - *Stocks tab* — searchable list of stocks with a price chart modal
  - *Alerts tab* — create, view, and delete price alerts
  - *Profile tab* — logout

## Deployment

- The NestJS backend and MongoDB database are both deployed on **Railway**, with environment variables (JWT secret, Finnhub API key, Firebase credentials, MongoDB URI) configured through Railway's dashboard.
- The mobile app is built as a standalone Android APK using **EAS Build**, since Firebase Cloud Messaging requires native modules that aren't available in Expo Go.

## Running Locally

**Backend**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend**
```bash
cd frontend
npm install
npx expo start
```

> Note: FCM notifications only work on a native build (`eas build`), not in Expo Go.

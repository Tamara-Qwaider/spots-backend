# SpotOn Backend

## Backend API for SpotOn Smart Meetup Recommendation System

This repository contains the backend of SpotOn, a full-stack web application designed to help users discover meetups and activities based on their interests.

The backend provides APIs for authentication, users, meetups, messaging, notifications, places, categories, and personalized recommendations.

---

## Technologies

- Node.js
- Express.js
- MongoDB
- Firebase
- Cloudinary
- JavaScript

---

## Features

- User registration and login
- User authentication and authorization
- User profile management
- Interest management
- Meetup creation and management
- Personalized meetup recommendations
- Meetup history
- Messaging between users
- Notifications
- Places and categories
- Admin functionality
- Image and media management using Cloudinary

---

## Project Structure

```text
spots-backend
│
├── middleware
│   └── authMiddleware.js
│
├── models
│   ├── Category.js
│   ├── Meetup.js
│   ├── Message.js
│   ├── Notification.js
│   ├── Place.js
│   └── User.js
│
├── routes
│   ├── aiRoutes.js
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── meetupRoutes.js
│   ├── messageRoutes.js
│   ├── notificationRoutes.js
│   ├── placeRoutes.js
│   └── userRoutes.js
│
├── package.json
├── package-lock.json
└── server.js
```

---

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB
- Git

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tamara-Qwaider/spots-backend.git
```

### 2. Navigate to the backend directory

```bash
cd spots-backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend directory and add the required environment variables.

The `.env` file should remain local and must not be uploaded to GitHub.

### 5. Start the server

```bash
node server.js
```

The backend API will start on the configured server port.

---

## Environment Variables

The backend uses environment variables for sensitive configuration such as:

- MongoDB connection details
- Firebase configuration
- Cloudinary configuration
- API keys
- Other service credentials

For security reasons:

- Do not upload `.env` files to GitHub.
- Do not expose database credentials.
- Do not expose private API keys or service secrets.

---

## Frontend

The frontend of SpotOn is available in a separate repository:

https://github.com/Tamara-Qwaider/graduation-project

---

## Related Repository

### SpotOn Frontend

https://github.com/Tamara-Qwaider/graduation-project

---

## Author

**Tamara Qwaider**

Software Engineering Graduate – Al-Zaytoonah University of Jordan

### GitHub

https://github.com/Tamara-Qwaider

---

## Graduation Project

SpotOn was developed as a university graduation project in 2026.

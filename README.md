# EazyByts-Final-Project

# Event Management App

Welcome to the Event Management App! This full-stack application helps users discover, book, and manage events.

## Features

* **User Management:** Auth, profile.
* **Event Handling:** View, create, edit, delete events (Admin).
* **Bookings:** Book, view, cancel.
* **Real-time Comments:** Socket.IO integration.
* **Admin Dashboard:** User/event management, analytics.
* **Payments:** (Razorpay).
* **Recommendations:** Personalized event suggestions.

## Technologies

**Frontend:** React.js, Redux Toolkit, React Router, Axios, Socket.IO Client, React Toastify.
**Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO, Bcrypt.js, JWT, Dotenv, CORS.

## Prerequisites

* Node.js (LTS) & npm/Yarn
* MongoDB (running locally or Atlas)
* Git

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/Paraj-Nath/EazyByts-Final-Project.git
cd event-management # Your project root
```

## 2. Backend Setup (`event-management-backend`)

Navigate into the backend directory:

```bash
cd event-management-backend
```
## Install Dependencies
```bash

npm install # or yarn install
```
### Create `.env` File

Create a file named `.env` in the `event-management-backend` directory (same level as `server.js` and `package.json`) and add the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventapp
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_YOUR_RAZORPAY_TEST_KEY_ID
RAZORPAY_SECRET_KEY=your_razorpay_secret_key_here
```
### Start Backend

Start the backend development server with the following command:

```bash
node server.js
```
Server will be running on port 5000 or [http://localhost:5000](http://localhost:5000)
## 3. Frontend Setup (`event-management-frontend`)

Open a new terminal window and navigate into the frontend directory:

```bash
cd ../event-management-frontend
```
### Install Dependencies
```bash
npm install # or yarn install
```
### Create `.env` File (Frontend)
Create a file named `.env` in the `event-management-frontend` directory (at the same level as `public/` and `package.json`). Populate it with the following environment variables:

```env
REACT_APP_API_URL=http://localhost:5000 # Must match your backend PORT
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_RAZORPAY_TEST_KEY_ID # Your Razorpay Test Key ID (same as backend's RAZORPAY_KEY_ID)
REACT_APP_SOCKET_IO_URL=http://localhost:5000 # Must match your backend PORT for Socket.IO
```
### Start Frontend

```bash
npm start # or yarn start
```
The React app will open in your browser, usually at [http://localhost:3000](http://localhost:3000).


## Running the Application

Make sure both servers are running in **separate terminal windows**:

- Backend server: `http://localhost:5000`
- Frontend server: `http://localhost:3000`

Then, open your browser and go to:

[http://localhost:3000](http://localhost:3000).


---

## Important Notes & Troubleshooting

- **Admin Access:**  
  Log in as a user with `role: "admin"` in your MongoDB. You may need to manually update the user role in your database for development.

- **URL/404 Errors:**  
  Ensure API paths in `src/services/*.js` match the routes in `backend/routes/*.js`.  
  Always restart both servers and hard refresh your browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) after any `.env` or code changes.

- **WebSocket Errors:**  
  Check the backend terminal for Socket.IO errors.  
  Make sure the `FRONTEND_URL` value in the backend `.env` file exactly matches the actual frontend URL.

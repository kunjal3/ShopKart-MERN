# ShopKart - MERN E-Commerce Application

ShopKart is a full-stack e-commerce application built using MongoDB, Express.js, React, and Node.js.

## Features

- Customer registration and login
- Product listing and product details
- Product search and browsing
- Shopping cart
- Wishlist
- Checkout and Razorpay test payments
- Order placement and order history
- Backend authentication and API integration

## Tech Stack

- Frontend: React, Vite, Axios, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Payments: Razorpay Test Mode

## Project Structure

- `shopkart-frontend/` - React frontend
- `shopkart-backend/` - Express backend and database integration

## Prerequisites

- Node.js and npm
- MongoDB database
- Razorpay test account for payment testing

## Backend Setup

1. Open a terminal and navigate to the backend:

   `cd shopkart-backend`

2. Install dependencies:

   `npm install`

3. Create a `.env` file in the backend folder. Add the environment variable names required by the backend code, including your MongoDB connection string, JWT secret, and Razorpay test credentials.

4. Start the backend:

   `node index.js`

The backend runs on port 3000.

## Frontend Setup

1. Open another terminal from the project root:

   `cd shopkart-frontend`

2. Install dependencies:

   `npm install`

3. Start the development server:

   `npm run dev`

Open `http://localhost:5173` in your browser.

## Important Notes

- Start the backend before using the application.
- Keep your `.env` file and all API keys, passwords, and secrets private.
- Never commit `.env` files to GitHub.
- Razorpay should be configured with test credentials for development.

## Author

Kunjal Dubey

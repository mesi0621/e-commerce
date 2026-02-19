# E-Commerce Backend API

Node.js + Express + MongoDB backend for the e-commerce platform.

## Features

- Product catalog management with search and filtering
- User browsing history and personalization
- Shopping cart with coupon support
- Product reviews and ratings
- Interaction tracking for popularity scoring
- Dynamic pricing algorithms
- Inventory management

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

3. Start MongoDB (if using local):
```bash
mongod
```

4. Seed the database with initial products:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/search` - Search products
- `GET /api/products/recommendations/:id` - Get similar products
- `GET /api/products/popular` - Get best sellers
- `GET /api/products/personalized/:userId` - Get personalized recommendations

### Cart
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart` - Update cart
- `POST /api/cart/checkout` - Calculate checkout total

### Reviews
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Add review

### Interactions
- `POST /api/interactions` - Track user interaction

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── models/          # Mongoose schemas
├── routes/          # API routes
├── services/        # Business logic
├── scripts/         # Utility scripts
├── server.js        # Entry point
└── .env            # Environment variables
```

## Development

- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run seed` - Seed database with products

## Models

- **Product**: Product catalog with pricing, stock, ratings
- **User**: User profiles with browsing history
- **Review**: Product reviews with ratings
- **Interaction**: User interactions (views, cart adds, purchases)
- **Cart**: Shopping carts with items and coupons

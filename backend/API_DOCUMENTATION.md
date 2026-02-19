# E-Commerce API Documentation

Base URL: `http://localhost:5000/api`

## Products API

### Get All Products
```
GET /products
Query Parameters:
  - category: string (men, women, kid)
  - minPrice: number
  - maxPrice: number
  - inStock: boolean
  - minRating: number
```

### Search Products
```
GET /products/search?q=jacket&category=men
Query Parameters:
  - q: string (search query)
  - category: string
  - minPrice: number
  - maxPrice: number
```

### Get Product by ID
```
GET /products/:id?userId=user123
Query Parameters:
  - userId: string (optional, for tracking views)
```

### Get Product Recommendations
```
GET /products/:id/recommendations?limit=4
Query Parameters:
  - limit: number (default: 4)
```

### Get Popular Products
```
GET /products/popular?limit=10
Query Parameters:
  - limit: number (default: 10)
```

### Get Trending Products
```
GET /products/trending?limit=10&days=7
Query Parameters:
  - limit: number (default: 10)
  - days: number (default: 7)
```

### Get Personalized Recommendations
```
GET /products/personalized/:userId?limit=10
Query Parameters:
  - limit: number (default: 10)
```

### Get Product Statistics
```
GET /products/:id/stats?days=30
Query Parameters:
  - days: number (default: 30)
```

### Create Product (Admin)
```
POST /products
Body: {
  name: string,
  category: string,
  image: string,
  new_price: number,
  old_price: number,
  description: string,
  stock: number,
  costPrice: number
}
```

### Update Product (Admin)
```
PUT /products/:id
Body: { ...fields to update }
```

### Delete Product (Admin)
```
DELETE /products/:id
```

## Cart API

### Get User Cart
```
GET /cart/:userId
```

### Update Cart
```
POST /cart
Body: {
  userId: string,
  items: [{
    productId: number,
    quantity: number,
    price: number
  }],
  coupon: {
    code: string,
    discountPercent: number,
    minPurchase: number,
    expiryDate: date
  }
}
```

### Add Item to Cart
```
POST /cart/:userId/items
Body: {
  productId: number,
  quantity: number,
  price: number
}
```

### Remove Item from Cart
```
DELETE /cart/:userId/items/:productId
```

### Update Item Quantity
```
PATCH /cart/:userId/items/:productId
Body: {
  quantity: number
}
```

### Apply Coupon
```
POST /cart/:userId/coupon
Body: {
  code: string,
  discountPercent: number,
  minPurchase: number,
  expiryDate: date
}
```

### Calculate Checkout Total
```
POST /cart/checkout
Body: {
  userId: string,
  taxRate: number (default: 0.1)
}
Response: {
  subtotal: number,
  discount: number,
  discountPercent: number,
  discountedSubtotal: number,
  tax: number,
  taxRate: number,
  total: number,
  items: array,
  couponCode: string
}
```

### Clear Cart
```
DELETE /cart/:userId
```

## Reviews API

### Get Product Reviews
```
GET /reviews/:productId?sortBy=helpfulness&limit=50
Query Parameters:
  - sortBy: string (helpfulness, newest, rating)
  - limit: number (default: 50)
  - skip: number (default: 0)
```

### Get Review Statistics
```
GET /reviews/:productId/stats
Response: {
  totalReviews: number,
  averageRating: number,
  weightedRating: number,
  ratingDistribution: { 5: n, 4: n, 3: n, 2: n, 1: n }
}
```

### Add Review
```
POST /reviews
Body: {
  productId: number,
  userId: string,
  rating: number (0-5),
  comment: string
}
```

### Vote on Review
```
POST /reviews/:reviewId/vote
Body: {
  voteType: string (upvote | downvote)
}
```

### Delete Review
```
DELETE /reviews/:reviewId
Body: {
  userId: string
}
```

## Interactions API

### Track Interaction
```
POST /interactions
Body: {
  productId: number,
  userId: string,
  type: string (view | cart_add | purchase),
  metadata: {
    category: string,
    price: number
  }
}
```

### Get User Interactions
```
GET /interactions/user/:userId?type=view&limit=50
Query Parameters:
  - type: string (view, cart_add, purchase)
  - limit: number (default: 50)
  - startDate: date
  - endDate: date
```

### Get Product Statistics
```
GET /interactions/product/:productId/stats?days=30
Query Parameters:
  - days: number (default: 30)
Response: {
  views: number,
  cartAdds: number,
  purchases: number,
  total: number,
  conversionRate: number
}
```

### Bulk Track Interactions
```
POST /interactions/bulk
Body: {
  interactions: [{
    productId: number,
    userId: string,
    type: string
  }]
}
```

## Inventory API (Admin)

### Get Reorder Alerts
```
GET /inventory/alerts
```

### Get Trending Products
```
GET /inventory/trending?limit=10&days=7
Query Parameters:
  - limit: number (default: 10)
  - days: number (default: 7)
```

### Get Reorder Point
```
GET /inventory/:productId/reorder?leadTime=7
Query Parameters:
  - leadTime: number (default: 7 days)
Response: {
  currentStock: number,
  averageDailySales: number,
  safetyStock: number,
  reorderPoint: number,
  shouldReorder: boolean
}
```

### Get Demand Forecast
```
GET /inventory/:productId/forecast?days=30
Query Parameters:
  - days: number (default: 30)
Response: {
  currentStock: number,
  averageDailySales: number,
  forecastedDemand: number,
  stockSufficient: boolean,
  daysUntilStockout: number
}
```

### Update Stock
```
PATCH /inventory/:productId/stock
Body: {
  quantity: number (positive to add, negative to subtract)
}
```

### Update Popularity
```
POST /inventory/:productId/popularity
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Algorithm Implementation

- **Algorithm #1**: Product Catalog Management - `/products` endpoints
- **Algorithm #2**: Product Search - `/products/search`
- **Algorithm #3**: Category Filtering - Query parameters on `/products`
- **Algorithm #4**: Sorting - Implemented in services
- **Algorithm #5**: Price Discount - Calculated in product responses
- **Algorithm #6**: Recommendations - `/products/:id/recommendations`
- **Algorithm #7**: Ranking - Search relevance scoring
- **Algorithm #8**: Popularity - `/products/popular`, `/inventory/trending`
- **Algorithm #9**: Inventory Management - `/inventory` endpoints
- **Algorithm #10**: Cart & Checkout - `/cart/checkout`
- **Algorithm #12**: Review & Rating - `/reviews` endpoints
- **Algorithm #13**: Personalization - `/products/personalized/:userId`
- **Algorithm #14**: Dynamic Pricing - Implemented in PricingService

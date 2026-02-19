# Implementation Plan: E-Commerce Product Features (Full-Stack)

## Overview

This implementation plan creates a complete full-stack e-commerce platform with:
- **Frontend**: React (existing) with API integration
- **Backend**: Node.js + Express REST API
- **Database**: MongoDB for persistent storage

The implementation follows an incremental approach: backend API first, then frontend integration.

## Tasks

### Phase 1: Backend Setup

- [ ] 1. Initialize backend project structure
  - Create `backend/` directory in project root
  - Initialize Node.js project: `npm init -y`
  - Install dependencies: express, mongoose, cors, dotenv, nodemon
  - Create folder structure: `models/`, `controllers/`, `services/`, `routes/`, `config/`
  - Create `server.js` entry point
  - Create `.env` file for configuration (PORT, MONGODB_URI)

- [ ] 2. Set up MongoDB connection
  - Create `config/database.js` with Mongoose connection
  - Add connection error handling and retry logic
  - Test connection to MongoDB (local or Atlas)

- [ ] 3. Create Mongoose models
  - [ ] 3.1 Create `models/Product.js`
    - Define product schema with all fields (id, name, description, category, prices, stock, popularity, rating)
    - Add text indexes for name and description
    - Add indexes for category, new_price, popularity
    - _Requirements: 1.1, 1.2_

  - [ ] 3.2 Create `models/User.js`
    - Define user schema for browsing history and preferences
    - _Requirements: 13.1_

  - [ ] 3.3 Create `models/Review.js`
    - Define review schema with ratings and helpfulness scores
    - _Requirements: 11.1_

  - [ ] 3.4 Create `models/Interaction.js`
    - Define interaction schema for tracking views, cart adds, purchases
    - _Requirements: 8.1_

  - [ ] 3.5 Create `models/Cart.js`
    - Define cart schema with items and coupon
    - _Requirements: 10.1_

### Phase 2: Backend Services (Business Logic)

- [ ] 4. Implement ProductService
  - Create `services/ProductService.js`
  - Implement `getAllProducts(filters)` with category, price range, stock filtering
  - Implement `getProductById(id)`
  - Implement `createProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)`
  - _Requirements: 1.1, 1.2, 1.5, 3.1_

- [ ]* 4.1 Write property tests for ProductService
  - **Property 1: Product Catalog Uniqueness**
  - **Property 2: Category Retrieval Completeness**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [ ] 5. Implement SearchService
  - [ ] 5.1 Create `services/SearchService.js`
    - Implement `search(query, filters)` using MongoDB `$text` operator
    - Implement `calculateRelevance(product, textScore)` with weighted formula
    - Handle empty queries
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 5.2 Add search optimization features
    - Implement `expandQueryWithSynonyms(query)` with synonym dictionary
    - Implement `suggestCorrections(query)` for misspellings
    - Implement multi-keyword boosting in relevance calculation
    - _Requirements: 14.1, 14.2, 14.4_

  - [ ]* 5.3 Write property tests for SearchService
    - **Property 3: Search Result Correctness**
    - **Property 4: Search Result Ranking**
    - **Property 20: Synonym Expansion Correctness**
    - **Property 21: Multi-Keyword Boosting**
    - **Validates: Requirements 2.1, 2.2, 2.3, 7.1, 7.2, 7.4, 7.5, 14.2, 14.4**

  - [ ]* 5.4 Write unit tests for search edge cases
    - Test empty query returns all products
    - Test zero-result searches suggest alternatives
    - _Requirements: 2.4, 14.3_

- [ ] 6. Implement FilterService and SortService
  - Create `services/FilterService.js` with `buildFilterQuery(criteria)`
  - Create `services/SortService.js` with `buildSortQuery(criteria)`
  - Support filtering by category, price range, stock, rating
  - Support sorting by price, discount, popularity, rating (asc/desc)
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 4.4_

- [ ]* 6.1 Write property tests for filtering and sorting
  - **Property 5: Category Filter Correctness**
  - **Property 6: Sort Correctness and Stability**
  - **Validates: Requirements 3.1, 3.2, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 7. Checkpoint - Test backend services
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement PricingService
  - [ ] 8.1 Create `services/PricingService.js`
    - Implement `calculateDiscount(oldPrice, newPrice)` with rounding
    - Implement `formatDiscount(percentage)` returning "X% OFF"
    - Implement `calculateCartTotal(userId, taxRate)` with coupon and tax logic
    - _Requirements: 5.1, 5.2, 5.5, 10.1, 10.2, 10.3, 10.4_

  - [ ] 8.2 Implement dynamic pricing
    - Implement `applyDynamicPricing(productId)` with demand-based rules
    - High demand: increase by 10-20%
    - Low demand: decrease by 10-30%
    - Never below cost price
    - Implement `adjustForCompetitors(productId, competitorPrices)` within ±5%
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 8.3 Write property tests for pricing
    - **Property 7: Discount Calculation Accuracy**
    - **Property 14: Cart Total Calculation Order**
    - **Property 17: Dynamic Pricing Constraints**
    - **Property 18: Competitive Price Adjustment**
    - **Validates: Requirements 5.1, 5.2, 5.5, 10.1, 10.2, 10.3, 10.4, 12.1, 12.2, 12.3, 12.4**

  - [ ]* 8.4 Write unit tests for pricing edge cases
    - Test equal prices return 0 discount
    - Test price increases return 0 discount
    - Test invalid/expired coupons
    - _Requirements: 5.3, 5.4_

- [ ] 9. Implement RecommendationService
  - [ ] 9.1 Create `services/RecommendationService.js`
    - Implement `getSimilarProducts(productId, limit)` with content-based filtering
    - Implement `calculateSimilarity(product1, product2)` using category and price
    - Filter by same category and price within 30%
    - Exclude viewed product
    - Fill with popular products if needed
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 9.2 Implement personalized recommendations
    - Implement `getPersonalizedRecommendations(userId, limit)`
    - Use user's most-viewed categories and price range
    - Fallback to popular products for new users
    - _Requirements: 13.2, 13.3, 13.4_

  - [ ]* 9.3 Write property tests for recommendations
    - **Property 8: Recommendation Relevance**
    - **Property 19: Personalized Recommendation Accuracy**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 13.2, 13.3**

  - [ ]* 9.4 Write unit tests for recommendation edge cases
    - Test product not found returns popular products
    - Test new user gets popular products
    - _Requirements: 6.4, 13.4_

- [ ] 10. Implement InventoryService
  - [ ] 10.1 Create `services/InventoryService.js`
    - Implement `updateStock(productId, quantity)`
    - Implement `calculateReorderPoint(productId)` using formula
    - Implement `checkReorderPoint(productId)` for alerts
    - Implement `forecastDemand(productId, days)` with 30-day moving average
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 10.2 Implement popularity tracking
    - Implement `updatePopularity(productId)` calculating from interactions
    - Formula: views*1 + cartAdds*5 + purchases*10
    - Apply time decay: score *= Math.pow(0.9, weeksSinceInteraction)
    - Implement `getPopularProducts(limit)` returning top N
    - Default popularity of 1 for zero interactions
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [ ]* 10.3 Write property tests for inventory
    - **Property 9: Popularity Score Calculation**
    - **Property 10: Best Sellers Accuracy**
    - **Property 11: Reorder Point Calculation**
    - **Property 12: Out-of-Stock Visibility**
    - **Property 13: Demand Forecasting Accuracy**
    - **Validates: Requirements 8.1, 8.2, 8.3, 9.2, 9.3, 9.4, 9.5**

  - [ ]* 10.4 Write unit tests for inventory edge cases
    - Test zero interactions defaults to popularity 1
    - Test out-of-stock products remain visible
    - _Requirements: 8.5, 9.4_

- [ ] 11. Implement InteractionService and ReviewService
  - Create `services/InteractionService.js` to track user interactions
  - Implement `trackInteraction(productId, userId, type)`
  - Create `services/ReviewService.js` for reviews
  - Implement `calculateWeightedRating(reviews)` with time-based weighting
  - Implement `sortReviewsByHelpfulness(reviews)` using upvotes - downvotes
  - _Requirements: 8.1, 11.2, 11.5_

- [ ]* 11.1 Write property tests for reviews
  - **Property 15: Weighted Rating Calculation**
  - **Property 16: Review Sorting by Helpfulness**
  - **Validates: Requirements 11.2, 11.5**

- [ ] 12. Checkpoint - All backend services complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Backend API (Controllers & Routes)

- [ ] 13. Create API controllers
  - [ ] 13.1 Create `controllers/ProductController.js`
    - Implement `getAll(req, res)` with query param parsing
    - Implement `getById(req, res)` with view tracking
    - Implement `search(req, res)`
    - Implement `getRecommendations(req, res)`
    - Implement `getPopular(req, res)`
    - Implement `getPersonalized(req, res)`
    - Implement `create(req, res)`, `update(req, res)`, `delete(req, res)` (admin)

  - [ ] 13.2 Create `controllers/CartController.js`
    - Implement `getCart(req, res)`
    - Implement `updateCart(req, res)`
    - Implement `calculateCheckout(req, res)`

  - [ ] 13.3 Create `controllers/ReviewController.js`
    - Implement `getReviews(req, res)`
    - Implement `addReview(req, res)`
    - Implement `voteReview(req, res)`

  - [ ] 13.4 Create `controllers/InteractionController.js`
    - Implement `trackInteraction(req, res)`

- [ ] 14. Create API routes
  - Create `routes/products.js` with all product endpoints
  - Create `routes/cart.js` with cart endpoints
  - Create `routes/reviews.js` with review endpoints
  - Create `routes/interactions.js` with interaction endpoint
  - Register all routes in `server.js`

- [ ] 15. Add middleware and error handling
  - Add CORS middleware for frontend communication
  - Add body parser middleware
  - Add global error handler
  - Add request logging (optional: morgan)
  - Add input validation middleware (optional: express-validator)

- [ ] 16. Seed database with initial products
  - Create `scripts/seedProducts.js`
  - Import products from `frontend/src/Components/Assets/all_product.js`
  - Transform and insert into MongoDB
  - Add additional fields: stock, costPrice, popularity, rating

- [ ] 17. Test backend API with Postman/Thunder Client
  - Test all product endpoints
  - Test search with various queries
  - Test filtering and sorting
  - Test recommendations
  - Test cart operations
  - Test review operations

- [ ] 18. Checkpoint - Backend API complete
  - Ensure all endpoints work correctly, ask the user if questions arise.

### Phase 4: Frontend Integration

- [ ] 19. Create API client for frontend
  - [ ] 19.1 Create `frontend/src/api/client.js`
    - Set up axios with base URL
    - Create API client instance

  - [ ] 19.2 Create `frontend/src/api/productAPI.js`
    - Implement `getAll(params)`
    - Implement `getById(id)`
    - Implement `search(query, filters)`
    - Implement `getRecommendations(id)`
    - Implement `getPopular()`
    - Implement `getPersonalized(userId)`

  - [ ] 19.3 Create `frontend/src/api/cartAPI.js`
    - Implement `getCart(userId)`
    - Implement `updateCart(userId, items)`
    - Implement `checkout(userId, taxRate)`

  - [ ] 19.4 Create `frontend/src/api/reviewAPI.js`
    - Implement `getReviews(productId)`
    - Implement `addReview(review)`

  - [ ] 19.5 Create `frontend/src/api/interactionAPI.js`
    - Implement `track(productId, userId, type)`

- [ ] 20. Create custom React hooks
  - [ ] 20.1 Create `frontend/src/hooks/useProducts.js`
    - Fetch products with filters
    - Handle loading and error states

  - [ ] 20.2 Create `frontend/src/hooks/useSearch.js`
    - Search products with query
    - Handle search state

  - [ ] 20.3 Create `frontend/src/hooks/useRecommendations.js`
    - Fetch recommendations for product
    - Handle loading state

  - [ ] 20.4 Create `frontend/src/hooks/useCart.js`
    - Manage cart state
    - Calculate checkout totals

  - [ ] 20.5 Create `frontend/src/hooks/usePopular.js`
    - Fetch popular/best-selling products

- [ ] 21. Update Shop/ShopCategory components
  - [ ] 21.1 Add search functionality
    - Add search input field
    - Use `useSearch` hook
    - Display search results
    - _Requirements: 2.1_

  - [ ] 21.2 Add category filtering
    - Update category buttons to use API
    - Use `useProducts` hook with category filter
    - _Requirements: 3.1_

  - [ ] 21.3 Add sorting dropdown
    - Add sort options: price (low-high, high-low), popularity, rating, discount
    - Update API call with sort parameter
    - _Requirements: 4.1, 4.2_

  - [ ] 21.4 Add price range filter
    - Add price range slider or inputs
    - Update API call with price filter
    - _Requirements: 3.1_

- [ ] 22. Update Product component
  - [ ] 22.1 Add recommendations section
    - Use `useRecommendations` hook
    - Display "Similar Products" below product details
    - _Requirements: 6.1_

  - [ ] 22.2 Track product views
    - Call interaction API when product is viewed
    - _Requirements: 8.1, 13.2_

  - [ ] 22.3 Display reviews and ratings
    - Fetch and display product reviews
    - Show weighted average rating
    - Sort reviews by helpfulness
    - _Requirements: 11.2, 11.5_

  - [ ] 22.4 Add review submission form
    - Allow users to add reviews
    - Update product rating after submission
    - _Requirements: 11.1_

- [ ] 23. Update Cart component
  - [ ] 23.1 Integrate with cart API
    - Use `useCart` hook
    - Fetch cart on component mount
    - Update cart when items change

  - [ ] 23.2 Add coupon code input
    - Add input field for coupon code
    - Validate and apply coupon
    - _Requirements: 10.3_

  - [ ] 23.3 Display cart total breakdown
    - Show subtotal, discount, tax, and final total
    - Use pricing service calculations
    - _Requirements: 10.1, 10.2, 10.4_

  - [ ] 23.4 Track cart additions
    - Call interaction API when items added to cart
    - _Requirements: 8.1_

- [ ] 24. Add "Best Sellers" section to homepage
  - Update Hero or create new Popular component
  - Use `usePopular` hook to fetch top 10 products
  - Display with "Best Seller" badges
  - _Requirements: 8.3_

- [ ] 25. Add UI enhancements
  - [ ] 25.1 Add discount badges to Item component
    - Calculate and display "X% OFF" badges
    - Use pricing service
    - _Requirements: 5.5_

  - [ ] 25.2 Add stock availability indicators
    - Show "In Stock", "Out of Stock", "Low Stock" badges
    - Color-code based on stock level
    - _Requirements: 9.4_

  - [ ] 25.3 Add "Trending" badges
    - Identify high-popularity products
    - Display trending badge
    - _Requirements: 8.3_

  - [ ] 25.4 Add loading skeletons
    - Show loading states for async operations
    - Improve user experience

- [ ] 26. Checkpoint - Frontend integration complete
  - Ensure all features work end-to-end, ask the user if questions arise.

### Phase 5: Testing & Optimization

- [ ] 27. Install and configure testing libraries
  - Backend: Install jest, supertest for API testing
  - Backend: Install fast-check for property-based testing
  - Frontend: Already has @testing-library/react
  - Configure test scripts in package.json

- [ ] 28. Write integration tests
  - [ ]* 28.1 Test search → filter → sort pipeline
    - End-to-end test of combined operations

  - [ ]* 28.2 Test product view → recommendations flow
    - Verify recommendations appear correctly

  - [ ]* 28.3 Test cart → checkout flow
    - Verify total calculations with coupons and tax

  - [ ]* 28.4 Test interaction tracking → popularity update
    - Verify popularity scores update correctly

- [ ] 29. Performance optimization
  - Add MongoDB indexes (already in schemas)
  - Add API response caching for popular products (optional: Redis)
  - Optimize frontend re-renders with React.memo
  - Add pagination for large product lists

- [ ] 30. Final testing and deployment preparation
  - Run all tests (unit, property, integration)
  - Test with realistic data volumes
  - Verify all 21 correctness properties
  - Document API endpoints
  - Create README with setup instructions

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Backend is built first, then integrated with frontend
- MongoDB provides persistent storage and efficient querying
- Express API provides clean separation between frontend and backend
- Property-based tests validate universal correctness properties
- Integration tests verify end-to-end flows
- Fast-check will be used for property-based testing with minimum 100 iterations per test

## Environment Setup

**Backend `.env` file**:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
NODE_ENV=development
```

**Frontend API configuration**:
```javascript
// frontend/src/config.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## Running the Application

**Backend**:
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

**Frontend**:
```bash
cd frontend
npm install
npm start
```

**MongoDB**:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

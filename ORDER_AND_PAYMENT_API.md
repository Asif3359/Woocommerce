# Order and Payment API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
- **All Orders**: Authentication required (Firebase auth)
- **User ID and Email**: Both are required for all orders
- **My Orders**: Requires authentication (Firebase auth)

---

## Order API

### 1. Create Order

Create a new order (authentication required).

**Endpoint:** `POST /api/orders`

**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2
    },
    {
      "productId": "another_product_id",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "paymentMethod": "cash_on_delivery", // or "stripe"
  "email": "user@example.com" // Optional: if not provided in headers
}
```

**Request Headers (Required):**
```
Authorization: Bearer <firebase_token>
// OR
x-user-id: <firebase_user_id> (required)
x-firebase-user-id: <firebase_user_id> (required)
x-user-email: <user_email> (required if not in Firebase token)
```

**Response (201 Created):**
```json
{
  "_id": "order_id_here",
  "user": "firebase_user_id", // String (Firebase UID) - required
  "userEmail": "user@example.com", // String - required
  "items": [
    {
      "product": "product_id",
      "name": "Product Name",
      "image": "https://example.com/image.jpg",
      "unit": "kg",
      "amount": 1,
      "quantity": 2,
      "price": 299.99
    }
  ],
  "totalAmount": 599.98,
  "paymentStatus": "unpaid",
  "paymentMethod": "cash_on_delivery",
  "stripePaymentIntentId": null,
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "message": "User ID is required"
}
```

```json
{
  "message": "User email is required"
}
```

```json
{
  "message": "Items are required"
}
```

```json
{
  "message": "Shipping address is required"
}
```

```json
{
  "message": "Product {productId} not found"
}
```

```json
{
  "message": "Product {name} is out of stock"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to create order"
}
```

**Example cURL:**
```bash
# Create order (authentication required)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase_token>" \
  -H "x-user-id: <firebase_user_id>" \
  -H "x-user-email: user@example.com" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    },
    "paymentMethod": "stripe",
    "email": "user@example.com"
  }'
```

---

### 2. Get User's Orders

Get all orders for the authenticated user.

**Endpoint:** `GET /api/orders/my-orders`

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <firebase_token>
// OR
x-user-id: <firebase_user_id> (required)
x-firebase-user-id: <firebase_user_id> (required)
x-user-email: <user_email> (required if not in Firebase token)
```

**Response (200 OK):**
```json
[
  {
    "_id": "order_id_1",
    "user": "firebase_user_id", // String (Firebase UID)
    "userEmail": "user@example.com", // String
    "items": [
      {
        "product": {
          "_id": "product_id",
          "name": "Product Name",
          "price": 299.99,
          // ... other product fields
        },
        "name": "Product Name",
        "image": "https://example.com/image.jpg",
        "unit": "kg",
        "amount": 1,
        "quantity": 2,
        "price": 299.99
      }
    ],
    "totalAmount": 599.98,
    "paymentStatus": "paid",
    "paymentMethod": "stripe",
    "status": "processing",
    "shippingAddress": { ... },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "message": "User ID is required"
}
```

```json
{
  "message": "User email is required"
}
```

**401 Unauthorized:**
```json
{
  "message": "User authentication required"
}
```

```json
{
  "message": "User ID or email is required"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to fetch orders"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/orders/my-orders \
  -H "Authorization: Bearer <firebase_token>"
```

---

### 3. Get Order by ID

Get a specific order by ID (accessible by anyone with order ID).

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Optional (for order tracking)

**URL Parameters:**
- `id` - Order ID

**Response (200 OK):**
```json
{
  "_id": "order_id_here",
  "user": "firebase_user_id", // String (Firebase UID) - required
  "userEmail": "user@example.com", // String - required
  "items": [
    {
      "product": {
        "_id": "product_id",
        "name": "Product Name",
        // ... other product fields
      },
      "name": "Product Name",
      "image": "https://example.com/image.jpg",
      "unit": "kg",
      "amount": 1,
      "quantity": 2,
      "price": 299.99
    }
  ],
  "totalAmount": 599.98,
  "paymentStatus": "unpaid",
  "paymentMethod": "cash_on_delivery",
  "status": "pending",
  "shippingAddress": { ... },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "message": "Order not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to fetch order"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/orders/507f1f77bcf86cd799439011
```

---

## Payment API

### 1. Create Payment Intent

Create a Stripe payment intent for an order (authentication required).

**Endpoint:** `POST /api/payment/create-payment-intent`

**Authentication:** Required

**Request Body:**
```json
{
  "orderId": "order_id_here"
}
```

**Request Headers (Required):**
```
Authorization: Bearer <firebase_token>
// OR
x-user-id: <firebase_user_id> (required)
x-firebase-user-id: <firebase_user_id> (required)
x-user-email: <user_email> (required if not in Firebase token)
```

**Response (200 OK):**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "message": "Order ID is required"
}
```

```json
{
  "message": "Order not found"
}
```

```json
{
  "message": "Order is already paid"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Stripe is not configured"
}
```

```json
{
  "message": "Failed to create payment intent"
}
```

**Example cURL:**
```bash
# Create payment intent (authentication required)
curl -X POST http://localhost:3000/api/payment/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase_token>" \
  -H "x-user-id: <firebase_user_id>" \
  -H "x-user-email: user@example.com" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011"
  }'
```

**Frontend Integration Example:**
```javascript
// After creating order, create payment intent
const response = await fetch('/api/payment/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`, // Required
    'x-user-id': firebaseUser.uid, // Required
    'x-user-email': firebaseUser.email // Required if not in token
  },
  body: JSON.stringify({ orderId: order._id })
});

const { clientSecret, paymentIntentId } = await response.json();

// Use clientSecret with Stripe.js
const stripe = Stripe('pk_test_...');
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
  },
});
```

---

### 2. Verify Payment Status

Verify the payment status of an order (authentication required).

**Endpoint:** `GET /api/payment/verify/:orderId`

**Authentication:** Required

**URL Parameters:**
- `orderId` - Order ID

**Request Headers (Required):**
```
Authorization: Bearer <firebase_token>
// OR
x-user-id: <firebase_user_id> (required)
x-firebase-user-id: <firebase_user_id> (required)
x-user-email: <user_email> (required if not in Firebase token)
```

**Response (200 OK):**
```json
{
  "paymentStatus": "paid", // or "unpaid"
  "stripeStatus": "succeeded" // if Stripe payment
}
```

**OR (if no Stripe payment):**
```json
{
  "paymentStatus": "unpaid"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "message": "Order not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to verify payment"
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/payment/verify/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <firebase_token>" \
  -H "x-user-id: <firebase_user_id>" \
  -H "x-user-email: user@example.com"
```

**Frontend Integration Example:**
```javascript
// After payment, verify status
const response = await fetch(`/api/payment/verify/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`, // Required
    'x-user-id': firebaseUser.uid, // Required
    'x-user-email': firebaseUser.email // Required if not in token
  }
});

const { paymentStatus, stripeStatus } = await response.json();

if (paymentStatus === 'paid') {
  console.log('Payment successful!');
  // Update UI, redirect, etc.
}
```

---

### 3. Stripe Webhook (Production Only)

Webhook endpoint for Stripe to notify about payment events.

**Endpoint:** `POST /api/payment/webhook`

**Authentication:** Not required (Stripe signature verification)

**Request Headers:**
```
stripe-signature: <stripe_signature>
```

**Request Body:** Raw JSON from Stripe

**Response (200 OK):**
```json
{
  "received": true
}
```

**Note:** This endpoint is only active when `STRIPE_WEBHOOK_SECRET` is configured. For development, use the verify endpoint instead.

---

## Payment Flow Examples

### Flow 1: Authenticated User Order with Cash on Delivery

```javascript
// 1. Create order (authentication required)
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`,
    'x-user-id': firebaseUser.uid,
    'x-user-email': firebaseUser.email
  },
  body: JSON.stringify({
    items: [{ productId: '...', quantity: 2 }],
    shippingAddress: { ... },
    paymentMethod: 'cash_on_delivery',
    email: firebaseUser.email
  })
});

const order = await orderResponse.json();
console.log('Order created:', order._id);
// Order status: pending, paymentStatus: unpaid
// Order will have user (Firebase UID) and userEmail
```

### Flow 2: Authenticated User Order with Stripe Payment

```javascript
// 1. Create order (authentication required)
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`,
    'x-user-id': firebaseUser.uid,
    'x-user-email': firebaseUser.email
  },
  body: JSON.stringify({
    items: [{ productId: '...', quantity: 2 }],
    shippingAddress: { ... },
    paymentMethod: 'stripe',
    email: firebaseUser.email
  })
});

const order = await orderResponse.json();

// 2. Create payment intent (authentication required)
const paymentResponse = await fetch('/api/payment/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`,
    'x-user-id': firebaseUser.uid,
    'x-user-email': firebaseUser.email
  },
  body: JSON.stringify({ orderId: order._id })
});

const { clientSecret } = await paymentResponse.json();

// 3. Confirm payment with Stripe.js
const stripe = Stripe('pk_test_...');
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});

if (paymentIntent.status === 'succeeded') {
  // 4. Verify payment (authentication required)
  const verifyResponse = await fetch(`/api/payment/verify/${order._id}`, {
    headers: {
      'Authorization': `Bearer ${firebaseToken}`,
      'x-user-id': firebaseUser.uid,
      'x-user-email': firebaseUser.email
    }
  });
  const { paymentStatus } = await verifyResponse.json();
  console.log('Payment status:', paymentStatus); // "paid"
}
```

### Flow 3: Get User's Orders

```javascript
// Get user's orders (authentication required)
const myOrdersResponse = await fetch('/api/orders/my-orders', {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'x-user-id': firebaseUser.uid,
    'x-user-email': firebaseUser.email
  }
});

const myOrders = await myOrdersResponse.json();
console.log('My orders:', myOrders);
// Returns all orders for the authenticated user (matched by user ID or email)
```

---

## Order Status Values

- `pending` - Order created, awaiting processing
- `processing` - Order is being processed
- `shipped` - Order has been shipped
- `delivered` - Order has been delivered
- `cancelled` - Order has been cancelled

## Payment Status Values

- `unpaid` - Payment not received
- `paid` - Payment received

## Payment Method Values

- `stripe` - Online payment via Stripe
- `cash_on_delivery` - Payment on delivery

---

## Error Handling

All endpoints follow standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

Error responses always include a `message` field:

```json
{
  "message": "Error description here"
}
```

---

## Notes

1. **Authentication Required**: All orders require authentication. Both `user` (Firebase UID as String) and `userEmail` are required fields.

2. **User Field**: The `user` field is a String type (Firebase UID), not ObjectId. It's required for all orders.

3. **User Email**: The `userEmail` field is required for all orders. It can be provided via:
   - Firebase auth token (`req.user.email`)
   - Request header (`x-user-email`)
   - Request body (`email` field)

4. **Payment Verification**: In development, use `/api/payment/verify/:orderId` after payment. In production, webhooks automatically update order status.

5. **Stripe Configuration**: Stripe features only work when `STRIPE_SECRET_KEY` is configured in environment variables.

6. **Order Tracking**: Orders can be tracked using the order ID via `GET /api/orders/:id` (no authentication required for viewing).

7. **My Orders**: Authenticated users can access `/api/orders/my-orders` to see all their orders (matched by user ID or email).

8. **Minimum Amount**: For Stripe payments, minimum order amount is ₹50. Orders below this amount should use cash on delivery.


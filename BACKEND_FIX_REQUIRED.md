# Backend Fix Required - Missing User Information

## 🐛 The Problem

Your order is missing critical fields:

```json
{
  "_id": "690e56f0d248590df5f64451",
  // ❌ MISSING: "user": "firebase_uid_here",
  // ❌ MISSING: "userEmail": "user@example.com",
  "items": [...],
  "totalAmount": 105,
  "shippingAddress": {
    "street": "gawer",
    "city": "gaweg",
    "state": "gawer",
    "zipCode": "1234",
    "country": "Bangladesh"
    // ❌ MISSING: "email": "user@example.com",
    // ❌ MISSING: "phone": "01712345678"
  },
  "status": "pending"
}
```

This causes:
- ❌ Can't fetch "My Orders" (no user linkage)
- ❌ 401 error: "User authentication required"
- ❌ Can't track orders by email

---

## ✅ Backend Order Route Fix

### Current Issue
Your backend is receiving the JWT token (you can see it's working because Stripe payment intent was created), but it's **not extracting user info** when creating the order.

### Fix Your Order Creation Route

**File:** `routes/order.ts` (or wherever your order route is)

```typescript
import { Router } from 'express';
import Order from '../db/order.js';
import Product from '../db/product.js';
import { optionalJwt } from '../auth/jwt.js';  // Make JWT optional

const router = Router();

// Create order - JWT OPTIONAL for guest support
router.post('/', optionalJwt, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // ✅ EXTRACT USER INFO FROM JWT OR USE GUEST DEFAULTS
    let userId = 'guest_default';
    let userEmail = null;

    // If JWT token provided and verified
    if (req.jwtUser) {
      userId = req.jwtUser.sub;  // Firebase UID
      userEmail = req.jwtUser.email;
      console.log('✅ Authenticated user:', userEmail);
    } else {
      console.log('⚠️ Guest user - no JWT token');
    }

    // Get email from shipping address if not from token
    if (!userEmail && shippingAddress?.email) {
      userEmail = shippingAddress.email;
    }

    // ✅ VALIDATION
    if (!userEmail) {
      return res.status(400).json({ 
        message: 'Email is required in shipping address' 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // ✅ Validate email and phone in shipping address
    if (!shippingAddress.email) {
      return res.status(400).json({ 
        message: 'Email is required in shipping address' 
      });
    }

    if (!shippingAddress.phone) {
      return res.status(400).json({ 
        message: 'Phone is required in shipping address' 
      });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${item.productId} not found` 
        });
      }
      if (!product.inStock) {
        return res.status(400).json({ 
          message: `Product ${product.name} is out of stock` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image || '',
        unit: product.quantity?.unit || 'pcs',
        amount: product.quantity?.amount || 1,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // ✅ CREATE ORDER WITH USER INFO
    const order = await Order.create({
      user: userId,              // ✅ Firebase UID or "guest_default"
      userEmail: userEmail,      // ✅ Email from token or shipping address
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: 'unpaid',
      shippingAddress,           // ✅ Includes email and phone
      status: 'pending',
    });

    // Populate product details
    await order.populate('items.product');

    console.log('✅ Order created:', {
      orderId: order._id,
      user: userId,
      userEmail: userEmail,
      type: userId === 'guest_default' ? 'GUEST' : 'AUTHENTICATED'
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

export default router;
```

---

## ✅ Fix My Orders Route

**File:** `routes/order.ts`

```typescript
// Get user's orders - JWT REQUIRED
router.get('/my-orders', requireJwt, async (req, res) => {
  try {
    const userId = req.jwtUser.sub;        // Firebase UID
    const userEmail = req.jwtUser.email;   // Email from JWT

    console.log('📋 Fetching orders for:', userEmail);

    // ✅ Find orders by user ID OR email (handles both old and new orders)
    const orders = await Order.find({
      $or: [
        { user: userId },
        { userEmail: userEmail }
      ]
    })
      .populate('items.product')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders`);

    return res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});
```

---

## ✅ Optional JWT Middleware

Create middleware to make JWT optional for guest orders:

**File:** `middleware/jwt.ts` or `auth/jwt.ts`

```typescript
import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// ✅ REQUIRED JWT - for authenticated-only endpoints
export const requireJwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    (req as any).jwtUser = decodedToken;
    console.log('✅ JWT verified for:', decodedToken.email);
    
    next();
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ✅ OPTIONAL JWT - for guest-enabled endpoints
export const optionalJwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        (req as any).jwtUser = decodedToken;
        console.log('✅ JWT verified for:', decodedToken.email);
      } catch (error) {
        console.log('⚠️ Invalid JWT, continuing as guest');
      }
    } else {
      console.log('⚠️ No JWT token, guest mode');
    }
    
    // Continue regardless of token presence (guest allowed)
    next();
  } catch (error) {
    console.error('❌ Error in optional JWT:', error);
    next(); // Continue even on error
  }
};
```

---

## 🗄️ Update Your Schema (Already Shown Before)

Make sure your Order schema has these fields:

```typescript
const OrderSchema = new Schema({
  user: {
    type: String,
    required: true,
    index: true,
    default: 'guest_default',  // ✅ Default for guests
  },
  userEmail: {  // ✅ NEW FIELD
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  // ... rest of schema ...
  shippingAddress: {
    // ... existing fields ...
    email: {  // ✅ NEW FIELD
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {  // ✅ NEW FIELD
      type: String,
      required: true,
      trim: true,
    },
  },
});
```

---

## 🧪 Test Backend

### Test 1: Authenticated Order
```bash
# Get your Firebase token from the app console
TOKEN="your_firebase_token_here"

curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"productId": "690cd6ce0b27d7c44f7567ab", "quantity": 1}],
    "shippingAddress": {
      "street": "123 Test St",
      "city": "Dhaka",
      "state": "Dhaka Division",
      "zipCode": "1206",
      "country": "Bangladesh",
      "email": "test@example.com",
      "phone": "01712345678"
    },
    "paymentMethod": "cash_on_delivery"
  }'
```

**Expected Backend Logs:**
```
✅ JWT verified for: test@example.com
✅ Authenticated user: test@example.com
✅ Order created: {
  orderId: '690e56f0d248590df5f64451',
  user: 'firebase_uid_abc123',
  userEmail: 'test@example.com',
  type: 'AUTHENTICATED'
}
```

**Expected Response:**
```json
{
  "_id": "690e56f0d248590df5f64451",
  "user": "firebase_uid_abc123",  // ✅ Should have this!
  "userEmail": "test@example.com",  // ✅ Should have this!
  "items": [...],
  "shippingAddress": {
    "email": "test@example.com",  // ✅ Should have this!
    "phone": "01712345678"  // ✅ Should have this!
  }
}
```

### Test 2: Fetch Orders
```bash
curl -X GET http://localhost:3000/api/orders/my-orders \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Backend Logs:**
```
✅ JWT verified for: test@example.com
📋 Fetching orders for: test@example.com
✅ Found 3 orders
```

**Expected Response:**
```json
[
  {
    "_id": "...",
    "user": "firebase_uid_abc123",
    "userEmail": "test@example.com",
    ...
  }
]
```

---

## 🔍 Debug Checklist

When you try to create an order, check your backend console:

### ✅ Should See:
```
POST /api/orders
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
✅ JWT verified for: user@example.com
✅ Authenticated user: user@example.com
Creating order...
✅ Order created: {
  orderId: '690e56f0d248590df5f64451',
  user: 'firebase_uid_abc123',
  userEmail: 'user@example.com',
  type: 'AUTHENTICATED'
}
```

### ❌ Currently Seeing (Problem):
```
POST /api/orders
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
Creating order...
Order created: 690e56f0d248590df5f64451
// ❌ No user info logged
```

---

## 🎯 Summary

**Your backend needs:**

1. ✅ Extract `userId` from `req.jwtUser.sub` (or use "guest_default")
2. ✅ Extract `userEmail` from `req.jwtUser.email` or `shippingAddress.email`
3. ✅ Save `user` and `userEmail` fields when creating order
4. ✅ Require `email` and `phone` in `shippingAddress`
5. ✅ Query orders by `user` OR `userEmail` in my-orders route
6. ✅ Use `optionalJwt` for order creation (guest support)
7. ✅ Use `requireJwt` for my-orders (auth required)

**Once fixed:**
- ✅ Orders will have proper user linkage
- ✅ "My Orders" will work
- ✅ Guest orders will work
- ✅ Email/phone will be saved

---

## 📞 If Still Not Working

Share your backend logs when creating an order:
1. What's logged when POST /api/orders is called?
2. Is JWT verification logged?
3. What's the value of `req.jwtUser`?
4. What's saved to the database?

The frontend is sending everything correctly - this is 100% a backend issue!


import { Router } from 'express';
import Order from '../db/order.js';
import Product from '../db/product.js';

const router = Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { user, userEmail, items, shippingAddress, paymentMethod } = req.body as {
      user?: string;
      userEmail?: string;
      items?: Array<{ productId: string; quantity: number }>;
      shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country?: string;
        email?: string;
        phone?: string;
      };
      paymentMethod?: 'stripe' | 'cash_on_delivery';
    };

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Validate email and phone in shipping address
    if (!shippingAddress.email) {
      return res.status(400).json({ message: 'Email is required in shipping address' });
    }

    if (!shippingAddress.phone) {
      return res.status(400).json({ message: 'Phone is required in shipping address' });
    }

    // Get user ID and email from request body (frontend sends these)
    // Fallback to auth/headers if not provided in body
    const firebaseUser = (req as any).user;
    const jwtUser = (req as any).jwtUser;
    
    // Use body values if provided and not empty, otherwise try auth/headers
    let userId = (user && user.trim()) 
      ? user.trim() 
      : firebaseUser?.uid || firebaseUser?.id || jwtUser?.sub || jwtUser?.uid || req.headers['x-user-id'] || req.headers['x-firebase-user-id'];
    
    let finalUserEmail = (userEmail && userEmail.trim())
      ? userEmail.trim()
      : firebaseUser?.email || jwtUser?.email || req.headers['x-user-email'] || shippingAddress.email;

    // Use shipping address email if still no email found
    if (!finalUserEmail && shippingAddress.email) {
      finalUserEmail = shippingAddress.email;
    }

    // Validate email is available
    if (!finalUserEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Use guest_default if no userId provided
    if (!userId || userId.trim() === '') {
      userId = 'guest_default';
    }

    // Normalize email
    finalUserEmail = finalUserEmail.toLowerCase().trim();

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (!product.inStock) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image || '',
        unit: product.quantity.unit,
        amount: product.quantity.amount,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Normalize shipping address email
    const normalizedShippingAddress = {
      ...shippingAddress,
      email: shippingAddress.email.toLowerCase().trim(),
    };

    const order = await Order.create({
      user: userId,
      userEmail: finalUserEmail,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: paymentMethod === 'stripe' ? 'unpaid' : 'unpaid',
      shippingAddress: normalizedShippingAddress,
      status: 'pending',
    });

    // Populate product details
    await order.populate('items.product');

    return res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get user's orders by email
router.get('/my-orders/:email', async (req, res) => {
  try {
    const email = req.params.email?.toLowerCase().trim();
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find orders by email
    const orders = await Order.find({ userEmail: email })
      .populate('items.product')
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID (accessible by anyone with order ID - for guest order tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order has a user, optionally verify it matches authenticated user
    // But allow guest orders to be accessed by anyone with the order ID
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
});

export default router;


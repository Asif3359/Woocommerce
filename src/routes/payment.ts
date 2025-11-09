import express, { Router } from 'express';
import Stripe from 'stripe';
import Order from '../db/order.js';

const router = Router();

// Initialize Stripe lazily - only when needed and key is available
const getStripe = (): Stripe | null => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
};

// Create payment intent for an order (works for both authenticated and guest users)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { orderId } = req.body as { orderId?: string };
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured' });
    }

    // Get user ID and email from Firebase auth (try multiple sources)
    const firebaseUser = (req as any).user;
    const jwtUser = (req as any).jwtUser; // If using JWT middleware
    const userId = firebaseUser?.uid || firebaseUser?.id || jwtUser?.sub || jwtUser?.uid || req.headers['x-user-id'] || req.headers['x-firebase-user-id'];
    const userEmail = firebaseUser?.email || jwtUser?.email || req.headers['x-user-email'];

    // Find the order (user is now String type, required)
    const query: any = { _id: orderId };
    const conditions: any[] = [];
    
    if (userId) {
      conditions.push({ user: userId });
    }
    
    if (userEmail) {
      conditions.push({ userEmail: userEmail.toLowerCase() });
    }
    
    if (conditions.length > 0) {
      query.$or = conditions;
    }
    
    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        userId: userId,
      },
    });

    // Update order with payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Webhook endpoint for Stripe (optional - only needed in production)
// Note: Raw body middleware is applied in app.ts before express.json()
// For development, you can skip webhooks and use the verify endpoint instead
router.post('/webhook', async (req, res) => {
  // Webhook secret is optional - skip if not configured (development mode)
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('Webhook secret not configured - skipping webhook verification (development mode)');
    return res.json({ received: true, message: 'Webhook disabled - use verify endpoint instead' });
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Webhook signature missing');
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({ message: 'Stripe is not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          await order.save();
          console.log(`Order ${orderId} marked as paid`);
        }
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  }

  return res.json({ received: true });
});

// Verify payment status (user and email are required)
router.get('/verify/:orderId', async (req, res) => {
  try {
    // Get user ID and email from Firebase auth (try multiple sources)
    const firebaseUser = (req as any).user;
    const jwtUser = (req as any).jwtUser; // If using JWT middleware
    const userId = firebaseUser?.uid || firebaseUser?.id || jwtUser?.sub || jwtUser?.uid || req.headers['x-user-id'] || req.headers['x-firebase-user-id'];
    const userEmail = firebaseUser?.email || jwtUser?.email || req.headers['x-user-email'];

    // Find the order (user is now String type, required)
    const query: any = { _id: req.params.orderId };
    const conditions: any[] = [];
    
    if (userId) {
      conditions.push({ user: userId });
    }
    
    if (userEmail) {
      conditions.push({ userEmail: userEmail.toLowerCase() });
    }
    
    if (conditions.length > 0) {
      query.$or = conditions;
    }
    
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order has a payment intent, check with Stripe
    if (order.stripePaymentIntentId) {
      const stripe = getStripe();
      if (stripe) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
          
          if (paymentIntent.status === 'succeeded' && order.paymentStatus !== 'paid') {
            order.paymentStatus = 'paid';
            order.status = 'processing';
            await order.save();
          }

          return res.status(200).json({
            paymentStatus: order.paymentStatus,
            stripeStatus: paymentIntent.status,
          });
        } catch (error) {
          console.error('Error verifying payment with Stripe:', error);
        }
      }
    }

    return res.status(200).json({
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ message: 'Failed to verify payment' });
  }
});

export default router;


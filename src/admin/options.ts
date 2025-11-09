import { AdminJSOptions, ValidationError } from 'adminjs';
import componentLoader from './component-loader.js';
import User from '../db/user.js';
import { dark, light, noSidebar } from '@adminjs/themes';
import Product from '../db/product.js';
import Order from '../db/order.js';

const options: AdminJSOptions = {
  defaultTheme: dark.id,
  availableThemes: [light, noSidebar],
  branding: {
    companyName: 'AdminPro',
    logo: false,
    withMadeWithLove: false,
    // Additional branding options
    favicon: '/favicon.ico',

  },
  componentLoader,
  rootPath: '/admin',
  dashboard: {
    component: 'Dashboard',
  },
  resources: [
    {
      resource: User,
      options: {
        navigation: {
          name: 'Users',
          icon: 'User',
        },
        properties: {
          passwordHash: { isVisible: false },
          createdAt: {
            isVisible: { list: true, filter: true, show: true, edit: false }
          },
          updatedAt: {
            isVisible: { list: false, filter: true, show: true, edit: false }
          },
          email: {
            isTitle: true,
            isRequired: true
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload && 'password' in request.payload) {
                const { password, ...rest } = (request.payload as Record<string, unknown>);
                const trimmed = String(password ?? '').trim();
                // Only set passwordHash when provided; otherwise raise a validation error
                if (trimmed.length > 0) {
                  return {
                    ...request,
                    payload: {
                      ...rest,
                      passwordHash: trimmed,
                    },
                  } as typeof request;
                }
                // Throw a validation error that highlights the password field
                throw new ValidationError({
                  password: {
                    message: 'Password is required',
                  },
                });
              }
              return request;
            },
            properties: {
              password: {
                type: 'password',
                isVisible: { list: false, filter: false, show: false, edit: true },
                isRequired: true,
              },
            },
          },
          edit: {
            before: async (request) => {
              if (request.payload && 'password' in request.payload) {
                const { password, ...rest } = (request.payload as Record<string, unknown>);
                const trimmed = String(password ?? '').trim();
                if (trimmed.length > 0) {
                  return {
                    ...request,
                    payload: {
                      ...rest,
                      passwordHash: trimmed,
                    },
                  } as typeof request;
                }
                // if empty password sent, do not overwrite hash
                const { passwordHash, ...withoutHash } = rest as Record<string, unknown>;
                return { ...request, payload: withoutHash } as typeof request;
              }
              return request;
            },
            properties: {
              password: {
                type: 'password',
                isVisible: { list: false, filter: false, show: false, edit: true },
                isRequired: false,
              },
            },
          },
        },
      },
    },
    {
      resource: Product,
      options: {
        navigation: {
          name: 'Products',
          icon: 'ShoppingBag',
        },
        properties: {
          _id: {
            isVisible: false,
          },
          name: {
            isTitle: true,
            isRequired: true,
          },
          description: {
            type: 'textarea',
            isRequired: false,
          },
          price: {
            isRequired: true,
          },
          originalPrice: {
            isRequired: true,
          },
          image: {
            type: 'string',
            isRequired: false,
          },
          category: {
            isRequired: true,
            availableValues: [
              { value: 'Vegetable', label: 'Vegetable' },
              { value: 'Fruits', label: 'Fruits' },
              { value: 'Beverages', label: 'Beverages' },
              { value: 'Grocery', label: 'Grocery' },
              { value: 'Edible oil', label: 'Edible Oil' },
              { value: 'Household', label: 'Household' },
              { value: 'Babycare', label: 'Babycare' },
            ],
          },
          'quantity.amount': {
            label: 'Quantity Amount',
            type: 'number',
            isRequired: true,
            props: {
              step: '0.1',
              min: 0.1,
            },
          },
          'quantity.unit': {
            label: 'Quantity Unit',
            type: 'string',
            isRequired: true,
            availableValues: [
              { value: 'gm', label: 'Grams (gm)' },
              { value: 'kg', label: 'Kilograms (kg)' },
              { value: 'ml', label: 'Milliliters (ml)' },
              { value: 'l', label: 'Liters (l)' },
              { value: 'piece', label: 'Piece' },
              { value: 'pack', label: 'Pack' },
            ],
          },
          brand: {
            isRequired: true,
          },
          rating: {
            isRequired: false,
            props: {
              step: '0.1',
              min: 0,
              max: 5,
            },
          },
          reviews: {
            isRequired: false,
            props: {
              min: 0,
            },
          },
          inStock: {
            isVisible: { list: true, filter: true, show: true, edit: true },
            isRequired: false,
          },
          features: {
            type: 'mixed',
            isArray: true,
            isVisible: { list: false, filter: false, show: true, edit: true },
          },
          isActive: {
            isVisible: { list: true, filter: true, show: true, edit: true },
          },
          createdAt: {
            isVisible: { list: true, filter: true, show: true, edit: false }
          },
          updatedAt: {
            isVisible: { list: false, filter: true, show: true, edit: false }
          },
        },
        listProperties: ['name', 'category', 'price', 'quantity.amount', 'quantity.unit', 'inStock', 'isActive', 'createdAt'],
        filterProperties: ['name', 'category', 'brand', 'inStock', 'isActive', 'createdAt'],
        sort: {
          direction: 'desc',
          sortBy: 'createdAt',
        },
        actions: {
          new: {
            before: async (request) => {
              // Ensure rating is between 0-5 if provided
              if (request.payload.rating !== undefined) {
                request.payload.rating = Math.max(0, Math.min(5, parseFloat(request.payload.rating)));
              }
              // Ensure reviews is non-negative
              if (request.payload.reviews !== undefined) {
                request.payload.reviews = Math.max(0, parseInt(request.payload.reviews));
              }
              // Ensure quantity amount is positive
              if (request.payload['quantity.amount'] !== undefined) {
                request.payload['quantity.amount'] = Math.max(0.1, parseFloat(request.payload['quantity.amount']));
              }
              return request;
            },
          },
          edit: {
            before: async (request) => {
              // Ensure rating is between 0-5 if provided
              if (request.payload.rating !== undefined) {
                request.payload.rating = Math.max(0, Math.min(5, parseFloat(request.payload.rating)));
              }
              // Ensure reviews is non-negative
              if (request.payload.reviews !== undefined) {
                request.payload.reviews = Math.max(0, parseInt(request.payload.reviews));
              }
              // Ensure quantity amount is positive
              if (request.payload['quantity.amount'] !== undefined) {
                request.payload['quantity.amount'] = Math.max(0.1, parseFloat(request.payload['quantity.amount']));
              }
              return request;
            },
          },
          delete: {
            isVisible: true,
          },
          bulkDelete: {
            isVisible: true,
          },
        },
      },
    },
    {
      resource: Order,
      options: {
        navigation: {
          name: 'Orders',
          icon: 'ShoppingBag',
        },
        properties: {
          _id: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          user: {
            isVisible: { list: true, filter: true, show: true, edit: false },
            type: 'reference',
          },
          userEmail: {
            isVisible: { list: true, filter: true, show: true, edit: false },
            type: 'string',
          },
          items: {
            type: 'mixed',
            isArray: true,
            isVisible: { list: false, filter: false, show: true, edit: false },
          },
          totalAmount: {
            isVisible: { list: true, filter: true, show: true, edit: false },
            type: 'currency',
            props: {
              currency: 'INR',
            },
          },
          paymentStatus: {
            isVisible: { list: true, filter: true, show: true, edit: true },
            isRequired: true,
            availableValues: [
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
            ],
          },
          paymentMethod: {
            isVisible: { list: true, filter: true, show: true, edit: false },
            availableValues: [
              { value: 'stripe', label: 'Stripe' },
              { value: 'cash_on_delivery', label: 'Cash on Delivery' },
            ],
          },
          stripePaymentIntentId: {
            isVisible: { list: false, filter: false, show: true, edit: false },
            type: 'string',
          },
          'shippingAddress.street': {
            label: 'Street',
            isVisible: { list: false, filter: false, show: true, edit: false },
          },
          'shippingAddress.city': {
            label: 'City',
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          'shippingAddress.state': {
            label: 'State',
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          'shippingAddress.zipCode': {
            label: 'Zip Code',
            isVisible: { list: false, filter: false, show: true, edit: false },
          },
          'shippingAddress.country': {
            label: 'Country',
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          'shippingAddress.email': {
            label: 'Email',
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          'shippingAddress.phone': {
            label: 'Phone',
            isVisible: { list: false, filter: false, show: true, edit: false },
          },
          status: {
            isVisible: { list: true, filter: true, show: true, edit: true },
            isRequired: true,
            availableValues: [
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
          createdAt: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          updatedAt: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
        },
        listProperties: ['_id', 'user', 'userEmail', 'totalAmount', 'paymentStatus', 'paymentMethod', 'status', 'shippingAddress.city', 'shippingAddress.email', 'createdAt'],
        filterProperties: ['_id', 'user', 'userEmail', 'paymentStatus', 'paymentMethod', 'status', 'shippingAddress.city', 'shippingAddress.state', 'shippingAddress.country', 'shippingAddress.email', 'createdAt', 'updatedAt'],
        sort: {
          direction: 'desc',
          sortBy: 'createdAt',
        },
        actions: {
          edit: {
            isVisible: true,
            before: async (request) => {
              // Only allow editing paymentStatus and status
              const allowedFields = ['paymentStatus', 'status'];
              const filteredPayload: Record<string, unknown> = {};
              
              for (const field of allowedFields) {
                if (field in request.payload) {
                  filteredPayload[field] = request.payload[field];
                }
              }
              
              return {
                ...request,
                payload: filteredPayload,
              };
            },
          },
          delete: {
            isVisible: true,
          },
          show: {
            isVisible: true,
          },
          list: {
            isVisible: true,
          },
        },
      },
    }
    // Add more resources as needed for AdminPro
  ],
  databases: [],
  // Additional AdminPro specific settings
  locale: {
    language: 'en',
    translations: {
      messages: {
        loginWelcome: 'Welcome to AdminPro',
      },
      labels: {
        loginWelcome: 'AdminPro',
      }
    }
  },
};

export default options;
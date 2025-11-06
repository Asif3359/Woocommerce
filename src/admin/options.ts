import { AdminJSOptions, ValidationError } from 'adminjs';
import componentLoader from './component-loader.js';
import User from '../db/user.js';
import { dark, light, noSidebar } from '@adminjs/themes';
import Product from '../db/product.js';

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
            isRequired: false,
          },
          category: {
            isRequired: true,
          },
          brand: {
            isRequired: true,
          },
          rating: {
            isRequired: false,
          },
          reviews: {
            isRequired: false,
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
              return request;
            },
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
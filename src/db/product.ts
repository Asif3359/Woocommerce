import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    category: {
      enum: ['Vegetable', 'Fruits', 'Beverages', 'Grocery', 'Edible oil', 'Household', 'Babycare'],
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      amount: {
        type: Number,
        required: true,
        default: 1
      },
      unit: {
        type: String,
        enum: ['gm', 'kg', 'ml', 'l', 'piece', 'pack'],
        required: true,
        default: 'pack'
      }
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    features: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export type ProductDocument = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>('Product', ProductSchema);

export default Product;
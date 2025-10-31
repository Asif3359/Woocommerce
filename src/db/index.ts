import mongoose from 'mongoose';
import { Database, Resource } from '@adminjs/mongoose';
import AdminJS from 'adminjs';

AdminJS.registerAdapter({ Database, Resource });

const initialize = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  try {
    const db = await mongoose.connect(databaseUrl);
    console.log('Database connected successfully');
    return { db };
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export default initialize;

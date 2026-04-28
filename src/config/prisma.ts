import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🔥 Database connected successfully. OT7 forever.');
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);
  }
};

export default prisma;
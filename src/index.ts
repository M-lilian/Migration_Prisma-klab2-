import 'dotenv/config'; 
import express, { Request, Response, NextFunction } from 'express';
import { connectDB } from './config/prisma';
import { PrismaClient, Prisma } from '@prisma/client'; 

// Make sure these paths are exactly correct!
import userRoutes from './routes/users.routes';
import listingRoutes from './routes/listings.routes';
import bookingRoutes from './routes/bookings.routes';

const app = express();
app.use(express.json());

app.use('/users', userRoutes);
app.use('/listings', listingRoutes);
app.use('/bookings', bookingRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error]: ${err.message}`);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Duplicate field value (email/username)' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'Foreign key constraint failed' });
  }

  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3000;

const main = async () => {
  await connectDB(); 
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main();
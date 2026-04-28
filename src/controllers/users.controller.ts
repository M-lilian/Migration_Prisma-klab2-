import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { createUserSchema, updateUserSchema } from '../validators/users.validator';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { listings: true } } }
    });
    res.json(users);
  } catch (error) { next(error); }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        listings: { include: { _count: { select: { bookings: true } } } },
        bookings: { include: { listing: { select: { title: true, location: true } } } }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { listings, bookings, ...userData } = user;
    const response = {
      ...userData,
      ...(user.role === "HOST" ? { listings } : { bookings })
    };
    res.json(response);
  } catch (error) { next(error); }
};

// export const createUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const result = createUserSchema.safeParse(req.body);
//     if (!result.success) return res.status(400).json({ errors: result.error.issues });

//     const user = await prisma.user.create({ data: result.data });
//     res.status(201).json(user);
//   } catch (error) { next(error); }
// };

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id as string) },
      data: result.data
    });
    res.json(user);
  } catch (error) { next(error); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(204).send();
  } catch (error) { next(error); }
};
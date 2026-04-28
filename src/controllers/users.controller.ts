import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

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
      include: { listings: true, bookings: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (error) { next(error); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id as string) },
      data: req.body
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
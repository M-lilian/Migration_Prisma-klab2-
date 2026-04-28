import { z } from "zod";
export const createBookingSchema = z.object({
  listingId: z.number().int().positive(),
  // guestId: z.number().int().positive(),
  checkIn: z.string().datetime("Invalid checkIn date"),
  checkOut: z.string().datetime("Invalid checkOut date"),
}).refine(
  (data) => new Date(data.checkIn) < new Date(data.checkOut),
  { message: "checkIn must be before checkOut", path: ["checkIn"] }
).refine(
  (data) => new Date(data.checkIn) > new Date(),
  { message: "checkIn must be in the future", path: ["checkIn"] }
);
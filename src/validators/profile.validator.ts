import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().max(300, "Bio too long").optional(),
  website: z.string().url("Invalid URL").optional(),
  country: z.string().optional(),
});
import multer from 'multer';

// 1. Hold the file in RAM (Memory) instead of the hard drive
const storage = multer.memoryStorage();

// 2. The ID Check (MIME Type Validation)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // We check the actual mimetype, NOT the file extension (.jpg)
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true); // VIP access granted
  } else {9
    cb(new Error("Only jpeg, png, webp allowed")); // Kicked out
  }
};

// 3. Finalize the bouncer
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Megabytes absolute maximum
  fileFilter
});
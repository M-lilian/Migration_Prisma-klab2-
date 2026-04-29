import { v2 as cloudinary } from 'cloudinary';

// 1. Log in using your new .env keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. The Upload Function
export const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        
        // Always grab the secure HTTPS url and the publicId (so we can delete it later)
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    
    // Push the file from RAM into Cloudinary
    stream.end(buffer);
  });
};

// 3. The Delete Function (Gotta clean up old selcas!)
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
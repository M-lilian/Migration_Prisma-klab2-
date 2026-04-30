import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables.
// Prefer explicit vars; fall back to CLOUDINARY_URL if present.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else if (cloudinaryUrl) {
  // Load from CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
  // Important: calling config({ ... }) alone does NOT reliably pull from CLOUDINARY_URL.
  cloudinary.config();
  cloudinary.config({ secure: true });
} else {
  // Throwing here makes misconfiguration obvious at request time.
  // (We avoid logging secrets; the message tells which vars are expected.)
  cloudinary.config({ secure: true });
}

// 2. THE BASE64 PIVOT 🔄 (No more streams!)
export const uploadToCloudinary = async (
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  try {
    // Turn the buffer RAM into a massive text string
    const b64 = buffer.toString('base64');
    
    // Format it so Cloudinary knows it's an image
    const safeMimeType = mimeType && mimeType.startsWith('image/') ? mimeType : 'application/octet-stream';
    const dataURI = `data:${safeMimeType};base64,${b64}`;

    // Upload the string directly in one shot
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: "auto"
    });

    return { url: result.secure_url, publicId: result.public_id };

  } catch (error: any) {
    // If it fails now, it CANNOT hide. It will print the exact Cloudinary JSON.
    console.log("\n🔥 THE REAL CLOUDINARY ERROR 🔥");
    console.log({
      message: error?.message,
      name: error?.name,
      http_code: error?.http_code,
      error: error?.error,
      // Common misconfig hint (without leaking secrets)
      cloudinary_config_present: Boolean(cloudinary.config().cloud_name),
      cloudinary_has_api_key: Boolean(cloudinary.config().api_key),
      cloudinary_has_api_secret: Boolean(cloudinary.config().api_secret),
      env_has_cloudinary_url: Boolean(process.env.CLOUDINARY_URL),
      env_has_cloudinary_triple: Boolean(
        process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
      ),
    });
    console.log("-------------------------------\n");
    throw error;
  }
};

// 3. Delete Function
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ CLOUDINARY DELETE ERROR:", error);
  }
};
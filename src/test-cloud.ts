import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// This grabs the single string from your .env
cloudinary.config();

console.log("🕵️‍♂️ Checking Cloudinary connection...");
console.log("URL detected in .env:", process.env.CLOUDINARY_URL ? "YES" : "NO");

cloudinary.api.ping()
  .then(res => {
    console.log("✅ CLOUDINARY IS ALIVE AND CONNECTED:");
    console.log(res);
  })
  .catch(err => {
    console.log("❌ CLOUDINARY REJECTED US. Reason:", err.message);
    console.log("Full error status code:", err.http_code);
  });
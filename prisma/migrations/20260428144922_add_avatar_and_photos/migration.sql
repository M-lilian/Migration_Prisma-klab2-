  - Added the required column `publicId` to the `ListingPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ListingPhoto" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarPublicId" TEXT;
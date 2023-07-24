-- AlterTable
ALTER TABLE "TeamProfile" ADD COLUMN     "programCode" TEXT NOT NULL DEFAULT 'No program',
ADD COLUMN     "programId" INTEGER NOT NULL DEFAULT 0;

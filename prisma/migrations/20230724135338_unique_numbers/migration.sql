/*
  Warnings:

  - A unique constraint covering the columns `[teamNumber]` on the table `TeamProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TeamProfile_teamNumber_key" ON "TeamProfile"("teamNumber");

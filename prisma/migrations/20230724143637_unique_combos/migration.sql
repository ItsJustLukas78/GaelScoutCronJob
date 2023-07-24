/*
  Warnings:

  - A unique constraint covering the columns `[teamId,seasonId]` on the table `TeamSeasonProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teamNumber,seasonId]` on the table `TeamSeasonProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TeamSeasonProfile_teamId_seasonId_key" ON "TeamSeasonProfile"("teamId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamSeasonProfile_teamNumber_seasonId_key" ON "TeamSeasonProfile"("teamNumber", "seasonId");

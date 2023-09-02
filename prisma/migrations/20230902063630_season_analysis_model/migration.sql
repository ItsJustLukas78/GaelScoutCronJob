-- CreateTable
CREATE TABLE "SeasonAnalysis" (
    "seasonId" INTEGER NOT NULL,
    "seasonName" TEXT NOT NULL,
    "numberOfTeams" INTEGER NOT NULL,
    "numberOfEvents" INTEGER NOT NULL,
    "lastEventDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonAnalysis_pkey" PRIMARY KEY ("seasonId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonAnalysis_seasonName_key" ON "SeasonAnalysis"("seasonName");

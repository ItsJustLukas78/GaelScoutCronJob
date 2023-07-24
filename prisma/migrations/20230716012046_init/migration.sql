-- CreateTable
CREATE TABLE "TeamProfile" (
    "teamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamNumber" TEXT NOT NULL,
    "robotName" TEXT DEFAULT 'No name',
    "teamGrade" TEXT DEFAULT 'No grade',
    "teamOrg" TEXT DEFAULT 'No org',
    "teamCity" TEXT DEFAULT 'No city',
    "teamRegion" TEXT DEFAULT 'No region',
    "teamCountry" TEXT DEFAULT 'No country',

    CONSTRAINT "TeamProfile_pkey" PRIMARY KEY ("teamId")
);

-- CreateTable
CREATE TABLE "TeamSeasonProfile" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamNumber" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "seasonName" TEXT NOT NULL,
    "mu" DOUBLE PRECISION NOT NULL,
    "sigma" DOUBLE PRECISION NOT NULL,
    "openSkill" DOUBLE PRECISION NOT NULL,
    "openSkillRank" INTEGER NOT NULL,
    "opr" DOUBLE PRECISION NOT NULL,
    "dpr" DOUBLE PRECISION NOT NULL,
    "ccwm" DOUBLE PRECISION NOT NULL,
    "oprCum" DOUBLE PRECISION NOT NULL,
    "dprCum" DOUBLE PRECISION NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "topProgSkills" INTEGER NOT NULL,
    "topDriverSkills" INTEGER NOT NULL,
    "topTotalSkills" INTEGER NOT NULL,
    "skillsRank" INTEGER NOT NULL,
    "qualMatchCount" INTEGER NOT NULL,
    "elimMatchCount" INTEGER NOT NULL,
    "qualMatchWins" INTEGER NOT NULL,
    "elimMatchWins" INTEGER NOT NULL,
    "qualMatchLosses" INTEGER NOT NULL,
    "elimMatchLosses" INTEGER NOT NULL,
    "qualMatchWinPercentage" DOUBLE PRECISION NOT NULL,
    "elimMatchWinPercentage" DOUBLE PRECISION NOT NULL,
    "totalMatchWinPercentage" DOUBLE PRECISION NOT NULL,
    "qualToRegionals" BOOLEAN NOT NULL,
    "awardQualToWorlds" BOOLEAN NOT NULL,

    CONSTRAINT "TeamSeasonProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamSeasonProfile" ADD CONSTRAINT "TeamSeasonProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamProfile"("teamId") ON DELETE RESTRICT ON UPDATE CASCADE;

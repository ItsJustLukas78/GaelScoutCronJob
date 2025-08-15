import * as dotenv from 'dotenv';
import {calcCumulativeStats, TeamSeasonProfile} from "./dataFill.js";
import winston from 'winston';
import { createRequire } from "module";
import { PrismaClient } from '@prisma/client'
import { getTeamObject } from "./RobotEventsAPI.js";

dotenv.config();

const { combine, errors } = winston.format;
export const logger = winston.createLogger({
  level: 'info',
  format: combine(errors({ stack: true }), winston.format.cli()),
  transports: [new winston.transports.Console()],
});

export const prismaConnection = new PrismaClient()

async function run() {
  // wait for 10 seconds to allow for the server to start up
  await new Promise(resolve => setTimeout(resolve, 5000));

  // spin-up: 173
  // over under: 181
  // high stakes: 190
  // push back: 197
  const currentSeasonId: number = 197;
  const currentSeasonName: string = "V5RC 2025-2026: Push Back";

  let SeasonAnalysis = await prismaConnection.seasonAnalysis.findUnique({
    where: {
      seasonId: currentSeasonId
    }
  })

  if (!SeasonAnalysis) {
    SeasonAnalysis = await prismaConnection.seasonAnalysis.create({
      data: {
        seasonId: currentSeasonId,
        seasonName: currentSeasonName,
        numberOfTeams: 0,
        numberOfEvents: 0,
        lastEventDate: (new Date(0)).toISOString(),
      }
    });
  }

  logger.info("Starting Analysis");
  const startAnalysis = performance.now();

  logger.info("Calculating Stats From Event Matches");
  await calcCumulativeStats(currentSeasonId, SeasonAnalysis);

  logger.info("Populating Team Season Profiles");
  await TeamSeasonProfile.populateAllTeams();

  logger.info("Storing Team Season Profiles");
  await TeamSeasonProfile.storeTeamSeasonProfiles();

  logger.info("Performing Season Rankings");
  await TeamSeasonProfile.fetchQualsAndSkillsThenRank(currentSeasonId);

  logger.info("Clearing Team Season Profiles From Memory");
  await TeamSeasonProfile.clearTeamSeasonProfilesObjects()

  const endAnalysis = performance.now();

  logger.info(`Done Analyzing Data In ${endAnalysis - startAnalysis} ms`);

  await prismaConnection.$disconnect();
}

run();

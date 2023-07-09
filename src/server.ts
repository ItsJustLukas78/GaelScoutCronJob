import { connect } from 'mongoose';
import * as dotenv from 'dotenv';
import {calcCumulativeStats, TeamSeasonProfile} from "./dataFill.js";
import { MetadataDocument } from "./models/Metadata.js";
import winston from 'winston';
import { createRequire } from "module";

const require = createRequire(import.meta.url);


dotenv.config();

const { combine, errors } = winston.format;
export const logger = winston.createLogger({
  level: 'info',
  format: combine(errors({ stack: true }), winston.format.cli()),
  transports: [new winston.transports.Console()],
});

async function run() {
  await connect(process.env.MONGO_URI as string);

  let DBMetadData = await MetadataDocument.findOne({});

  if (!DBMetadData) {
    await MetadataDocument.create({
      // create date forever ago so that it will be updated
      latestTeamsUpdate: new Date(0),
    });
  }

  // wait for 10 seconds to allow for the server to start up
  await new Promise(resolve => setTimeout(resolve, 10000));

  logger.info("STARTING ANALYSIS")
  const startAnalysis = performance.now();

  // await calcCumulativeStats(173);
  //
  // logger.info("POPULATING TEAM SEASON PROFILES");
  // await TeamSeasonProfile.populateAllTeams();
  //
  // logger.info("STORING TEAM SEASON PROFILES");
  // await TeamSeasonProfile.storeTeamSeasonProfiles();
  //
  // logger.info("PERFORMING SEASON RANKINGS");
  // await TeamSeasonProfile.performSeasonRankings(173);
  //
  // logger.info("CLEARING TEAM SEASON PROFILES");
  // await TeamSeasonProfile.clearTeamSeasonProfilesObjects()

  const endAnalysis = performance.now();

  logger.info(`DONE ANALYZING TEAM DATA IN ${endAnalysis - startAnalysis} ms`);
}

run();

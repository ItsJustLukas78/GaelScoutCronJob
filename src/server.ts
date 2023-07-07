import { connect } from 'mongoose';
import express from 'express';
import { Request, Response } from 'express';
import vhost from 'vhost';
import * as dotenv from 'dotenv';
import teamRouter from "./routes/teams.js";
import { calcCumulativeStats, Team } from "./dataFill.js";
import { MetadataDocument } from "./models/Metadata.js";
import swaggerUi from 'swagger-ui-express';
import winston from 'winston';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const swaggerDocument = require("./public/swagger-output.json");

// const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');

dotenv.config();

const { combine, errors } = winston.format;
export const logger = winston.createLogger({
  level: 'info',
  format: combine(errors({ stack: true }), winston.format.cli()),
  transports: [new winston.transports.Console()],
});

const mainApp = express();

const apiApp = express();

mainApp.use(vhost('api.*.*', apiApp));

// const jwtCheck = auth({
//   audience: process.env.audience,
//   issuerBaseURL: process.env.issuerBaseURL,
//   tokenSigningAlg: "RS256",
// });

// apiApp.use(jwtCheck);

mainApp.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the main app!' });
});

apiApp.use('/teams', teamRouter);

apiApp.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the API!' });
});

apiApp.use('/docs', swaggerUi.serve);
apiApp.get('/docs', swaggerUi.setup(swaggerDocument));

async function run() {
  await connect(process.env.MONGO_URI as string);

  mainApp.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });

  let DBMetadData = await MetadataDocument.findOne({});

  if (!DBMetadData) {
    DBMetadData = await MetadataDocument.create({
      // create date forever ago so that it will be updated
      latestTeamsUpdate: new Date(0),
    });
  }

  logger.info("STARTING ANALYSIS")
  const startAnalysis = performance.now();

  const latestTeamsUpdate = await calcCumulativeStats(173)
  // await calcCumulativeStats(173)
  // await Team.populateAllTeams();
  await Team.storeTeamsInDB();

  DBMetadData.latestTeamsUpdate = latestTeamsUpdate;
  await DBMetadData.save();

  const endAnalysis = performance.now();

  logger.info(`DONE ANALYZING TEAM DATA IN ${endAnalysis - startAnalysis} ms`);
}

run();

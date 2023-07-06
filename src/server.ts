import { connect } from 'mongoose';
import express from 'express';
import { Request, Response } from 'express';
import vhost from 'vhost';
import * as dotenv from 'dotenv';
import teamRouter from "./routes/teams.js";
import { calcCumulativeStats, Team } from "./dataFill.js";
import { MetadataDocument } from "./models/Metadata.js";
// const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');

dotenv.config();

const mainApp = express();

const apiApp = express();

mainApp.use(vhost('api.*.*', apiApp));

// const jwtCheck = auth({
//   audience: process.env.audience,
//   issuerBaseURL: process.env.issuerBaseURL,
//   tokenSigningAlg: "RS256",
// });

// apiApp.use(jwtCheck);

apiApp.use('/teams', teamRouter);

apiApp.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the API!' });
});

mainApp.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the main app!' });
});

async function run() {
  await connect(process.env.MONGO_URI);

  mainApp.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });

  const DBMetadData = await MetadataDocument.findOne({});

  if (!DBMetadData) {
    await MetadataDocument.create({
      // create date forever ago so that it will be updated
      latestTeamsUpdate: new Date(0),
    });
  }

  console.log("STARTING ANALYSIS")
  const startAnalysis = performance.now();

  const latestTeamsUpdate = await calcCumulativeStats(173)
  // await calcCumulativeStats(173)
  await Team.storeTeamsInDB();

  DBMetadData.latestTeamsUpdate = latestTeamsUpdate;
  await DBMetadData.save();

  const endAnalysis = performance.now();

  console.log(`DONE ANALYZING TEAM DATA IN ${endAnalysis - startAnalysis} ms`);
}

run();

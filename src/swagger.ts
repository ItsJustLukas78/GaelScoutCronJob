import swaggerAutogen from 'swagger-autogen';


const doc = {
  openapi: "3.1.0",
  info: {
    title: "GaelScout API from GaelSuite",
    version: "0.1.0",
    description:
      "An API for the the GaleScout app, and for teams in need of scouting data for VRC",
    contact: {
      name: "GaelScout",
      url: "https://gaelscout.com",
      email: "somwong.lukas@gaelsuite.com",
    },
  },
  servers: [
    {
      url: "https://api.gaelscout.com",
    },
  ],
  tags: [
    {
      name: "teams",
      description: "Analysis of teams and their performance, and other information",
    },
  ],
};


const outputFile: string = 'src/public/swagger-output.json';
const endpointsFiles: string[] = ['src/server.ts'];

swaggerAutogen({openapi: '3.1.0'})(outputFile, endpointsFiles, doc);
import {
  matrix,
  multiply,
  pinv,
  concat,
} from "mathjs";
import {
  getEventMatches,
  getTeamObject,
  getTeamAwards,
  getEvents,
  getEventDivisions, getTeamSkills,
} from "./RobotEventsAPI.js";
import {
  TeamDocument,
  TeamDocumentType
} from "./models/Team.js";
import {
  MetadataDocumentType,
  MetadataDocument,
} from "./models/Metadata.js";
import { rating, rate, ordinal } from 'openskill'

export class Team {
  teamNumber: string;
  teamId: number;
  seasonId: number;

  teamName: string;
  robotName: string;
  teamGrade: string;
  teamOrg: string;
  teamCity: string;
  teamRegion: string;
  teamCountry: string;

  mu: number = 25;
  sigma: number = 8.333333333333334;
  openSkill: number = 0;
  openSkillRank: number = 0;

  opr: number = 0;
  dpr: number = 0;
  ccwm: number = 0;

  oprCum: number = 0;
  dprCum: number = 0;
  eventCount: number = 0;

  topProgSkills: number = 0;
  topDriverSkills: number = 0;
  topTotalSkills: number = 0;
  skillsRank: number = 0;

  qualMatchCount: number = 0;
  elimMatchCount: number = 0;
  totalMatchWinPercentage: number = 0;

  qualMatchWins: number = 0;
  elimMatchWins: number = 0;

  qualMatchLosses: number = 0;
  elimMatchLosses: number = 0;

  qualMatchWinPercentage: number = 0;
  elimMatchWinPercentage: number = 0;

  qualToRegionals: boolean = false;
  awardQualToWorlds: boolean = false;

  private REDataFilled: boolean = false;

  private static teams: Team[] = [];

  constructor(
    teamNumber: string,
    teamId: number,
    seasonId: number
  ) {
    const existingTeam = Team.teams.find((team) => team.teamId === teamId);

    if (existingTeam) {
      return existingTeam;
    } else {
      Team.teams.push(this);
    }

    this.teamNumber = teamNumber;
    this.teamId = teamId;
    this.seasonId = seasonId;
  }

  static async fromDocument(teamDocument: TeamDocumentType) {
    const team = new Team(teamDocument.teamName, teamDocument.teamId, teamDocument.seasonId);

    team.teamName = teamDocument.teamName;
    team.teamNumber = teamDocument.teamNumber;
    team.robotName = teamDocument.robotName;
    team.seasonId = teamDocument.seasonId;
    team.teamGrade = teamDocument.teamGrade;
    team.teamOrg = teamDocument.teamOrg;
    team.teamCity = teamDocument.teamCity;
    team.teamRegion = teamDocument.teamRegion;
    team.teamCountry = teamDocument.teamCountry;
    team.mu = teamDocument.mu;
    team.sigma = teamDocument.sigma;
    team.openSkill = teamDocument.openSkill;
    team.openSkillRank = teamDocument.openSkillRank;
    team.opr = teamDocument.opr;
    team.dpr = teamDocument.dpr;
    team.ccwm = teamDocument.ccwm;
    team.oprCum = teamDocument.oprCum;
    team.dprCum = teamDocument.dprCum;
    team.eventCount = teamDocument.eventCount;
    team.topProgSkills = teamDocument.topProgSkills;
    team.topDriverSkills = teamDocument.topDriverSkills;
    team.topTotalSkills = teamDocument.topTotalSkills;
    team.skillsRank = teamDocument.skillsRank;
    team.qualMatchCount = teamDocument.qualMatchCount;
    team.elimMatchCount = teamDocument.elimMatchCount;
    team.qualMatchWins = teamDocument.qualMatchWins;
    team.elimMatchWins = teamDocument.elimMatchWins;
    team.qualMatchLosses = teamDocument.qualMatchLosses;
    team.elimMatchLosses = teamDocument.elimMatchLosses;
    team.qualMatchWinPercentage = teamDocument.qualMatchWinPercentage;
    team.elimMatchWinPercentage = teamDocument.elimMatchWinPercentage;
    team.totalMatchWinPercentage = teamDocument.totalMatchWinPercentage;
    team.qualToRegionals = teamDocument.qualToRegionals;
    team.awardQualToWorlds = teamDocument.awardQualToWorlds;
  }

  async populate(): Promise<void> {
    this.opr = +(this.oprCum / this.eventCount).toFixed(4);
    this.dpr = +(this.dprCum / this.eventCount).toFixed(4);
    this.ccwm = +(this.opr - this.dpr).toFixed(4);

    this.openSkill = ordinal({mu: this.mu, sigma: this.sigma});

    if (this.qualMatchCount > 0) {
      this.qualMatchWinPercentage =
        +((this.qualMatchWins / this.qualMatchCount)
          .toFixed(4)) * 100;
    } else {
      this.qualMatchWinPercentage = 0;
    }

    if (this.elimMatchCount > 0) {
      this.elimMatchWinPercentage =
        +((this.elimMatchWins / this.elimMatchCount)
          .toFixed(4)) * 100;
    } else {
      this.elimMatchWinPercentage = 0;
    }

    if (this.qualMatchCount + this.elimMatchCount > 0) {
      this.totalMatchWinPercentage =
        +(((this.qualMatchWins + this.elimMatchWins) / (this.qualMatchCount + this.elimMatchCount))
          .toFixed(4)) * 100;
    } else {
      this.totalMatchWinPercentage = 0;
    }


    if (!this.REDataFilled) {
      this.REDataFilled = true;
      const teamObject = await getTeamObject(this.teamId);

      if (teamObject) {
        this.teamName = teamObject.team_name;
        this.robotName = teamObject.robot_name;
        this.teamGrade = teamObject.grade;
        this.teamOrg = teamObject.organization;
        this.teamCity = teamObject.location.city;
        this.teamRegion = teamObject.location.region;
        this.teamCountry = teamObject.location.country;
      }

      const teamAwards = await getTeamAwards(this.teamId, this.seasonId);

      if (teamAwards) {
        const qualToRegionals = teamAwards.some((award) =>
          award.qualifications.some((qualification) =>
            qualification === "Event Region Championship")
        );
        const awardQualToWorlds = teamAwards.some((award) =>
          award.qualifications.some((qualification) =>
            qualification === "World Championship")
        );

        this.qualToRegionals = qualToRegionals;
        this.awardQualToWorlds = awardQualToWorlds;
      }

      const teamSkills = await getTeamSkills(this.teamId, this.seasonId);

      if (teamSkills && teamSkills.length > 0) {
        const topProgSkills: number = teamSkills.reduce((topProgSkills, skill) => {
          if (skill.type === "programming" && skill.score > topProgSkills) {
            return skill.score;
          } else {
            return topProgSkills;
          }
        }, 0);

        const topDriverSkills: number = teamSkills.reduce((topDriverSkills, skill) => {
          if (skill.type === "driver" && skill.score > topDriverSkills) {
            return skill.score;
          } else {
            return topDriverSkills;
          }
        }, 0);

        this.topProgSkills = topProgSkills;
        this.topDriverSkills = topDriverSkills;
        this.topTotalSkills = topProgSkills + topDriverSkills;
      } else {
        this.topProgSkills = 0;
        this.topDriverSkills = 0;
        this.topTotalSkills = 0;
      }
    }
  }

  static async populateAllTeams() {
    const promises: Promise<void>[] = [];

    this.teams.forEach((team) => {
      promises.push(team.populate());
    });

    await Promise.all(promises);

    const openSkillSorted = this.teams.sort((teamA, teamB) => {
      return teamB.openSkill - teamA.openSkill;
    });

    const topSkillsSorted = this.teams.sort((teamA, teamB) => {
      return teamB.topTotalSkills - teamA.topTotalSkills;
    });

    openSkillSorted.forEach((team, index) => {
      team.openSkillRank = index + 1;
    });

    topSkillsSorted.forEach((team, index) => {
      team.skillsRank = index + 1;
    });
  }

  static async storeTeamsInDB(teams?: Team[]): Promise<void> {
    if (!teams) {
      await this.populateAllTeams();
      teams = this.teams;
    }
    await Promise.all(teams.map(async (team) => {
      await TeamDocument.findOneAndUpdate({ teamId: team.teamId }, {
        teamId: team.teamId,
        teamName: team.teamName,
        teamNumber: team.teamNumber,
        seasonId: team.seasonId,
        robotName: team.robotName,
        teamGrade: team.teamGrade,
        teamOrg: team.teamOrg,
        teamCity: team.teamCity,
        teamRegion: team.teamRegion,
        teamCountry: team.teamCountry,
        mu: team.mu,
        sigma: team.sigma,
        openSkill: team.openSkill,
        openSkillRank: team.openSkillRank,
        opr: team.opr,
        dpr: team.dpr,
        ccwm: team.ccwm,
        oprCum: team.oprCum,
        dprCum: team.dprCum,
        eventCount: team.eventCount,
        topProgSkills: team.topProgSkills,
        topDriverSkills: team.topDriverSkills,
        topTotalSkills: team.topTotalSkills,
        skillsRank: team.skillsRank,
        qualMatchCount: team.qualMatchCount,
        elimMatchCount: team.elimMatchCount,
        qualMatchWins: team.qualMatchWins,
        elimMatchWins: team.elimMatchWins,
        qualMatchLosses: team.qualMatchLosses,
        elimMatchLosses: team.elimMatchLosses,
        qualMatchWinPercentage: team.qualMatchWinPercentage,
        elimMatchWinPercentage: team.elimMatchWinPercentage,
        totalMatchWinPercentage: team.totalMatchWinPercentage,
        qualToRegionals: team.qualToRegionals,
        awardQualToWorlds: team.awardQualToWorlds,
      }, {
        upsert: true
      });
    }));
  }

  static async initializeTeamsFromDB(): Promise<void> {
    const DBteams = await TeamDocument.find({});

    DBteams.forEach((team) => {
      Team.fromDocument(team)
    });
  }
}

class Match {
  redScore: number;
  blueScore: number;

  redTeams: Team[];
  blueTeams: Team[];

  roundType: number;

  constructor(
    redScore: number,
    blueScore: number,
    redTeams: Team[],
    blueTeams: Team[],
    roundType: number
  ) {
    this.redScore = redScore;
    this.blueScore = blueScore;
    this.redTeams = redTeams;
    this.blueTeams = blueTeams;
    this.roundType = roundType;
  }
}

class Event {
  eventCode: string;
  eventId: number;
  seasonId: number;
  divisions: Promise<number[] | null>;

  constructor(eventCode: string, eventId: number, seasonId: number) {
    this.eventCode = eventCode;
    this.eventId = eventId;
    this.seasonId = seasonId;
    this.divisions = getEventDivisions(eventId)
  }

  async getMatches(division: number) : Promise<Match[]> {
    const matches = await getEventMatches(this.eventId, division);

    const teamObjects: Team[] = [];
    const matchObjects: Match[] = [];

    matches.forEach(match => {
      const redTeams: Team[] = [];
      const blueTeams: Team[] = [];

      let redScore: number = 0;
      let blueScore: number = 0;

      const roundType: number = match.round;

      match.alliances.forEach(alliance => {
        if (alliance.color === "red") {
          redScore = alliance.score;
          alliance.teams.forEach(team => {
            const teamObject: Team = new Team(team.team.name, team.team.id, this.seasonId);
            redTeams.push(teamObject);
          })
        } else if (alliance.color === "blue") {
          blueScore = alliance.score;
          alliance.teams.forEach(team => {
            const teamObject: Team = new Team(team.team.name, team.team.id, this.seasonId);
            blueTeams.push(teamObject);
          })
        }
      })

      matchObjects.push(new Match(redScore, blueScore, redTeams, blueTeams, roundType));
    })

    return matchObjects;
  }
}

export const calcCumulativeStats = async (seasonId: number): Promise<Date> => {
  const seasonEvents = await getEvents(seasonId);

  const DBMetaData: MetadataDocumentType | null = await MetadataDocument.findOne({})


  if (!seasonEvents || !DBMetaData) {
    return new Date(0);
  }

  const latestTeamsUpdate: Date = new Date();

  const newEvents = seasonEvents.filter(async (event) => {
    if (new Date(event.end).getTime() > Date.now()) {
      return false;
    }

    if (DBMetaData.latestTeamsUpdate.getTime() < new Date(event.end).getTime()) {
      return true;
    }
  });

  const events: Event[] = newEvents.map((event) => {
    return new Event(event.sku, event.id, seasonId);
  });

  // const events: Event[] = [
  //   // new Event("RE-VRC-22-9506", 49506, 173),
  //   new Event("RE-VRC-22-8473", 48473, 173),
  // ];

  await Promise.all(events.map(async (event) => {
    const eventDivisions = await event.divisions;

    if (!eventDivisions || eventDivisions.length === 0) {
      return;
    }

    console.log(`Processing ${event.eventCode}...`);
    await Promise.all(eventDivisions.map(async (division) => {
      const matches: Match[] = await event.getMatches(division)

      if (matches.length < 4) {
        return;
      }

      const playingTeams: Team[] = [];

      matches.forEach((match) => {
        [...match.redTeams, ...match.blueTeams].forEach((team: Team) => {
          if (!playingTeams.some((existingTeam): boolean => existingTeam.teamId === team.teamId)) {
            playingTeams.push(team);
          }
        });
      });


      let matchScoresMatrix = matrix()
      let matchOpponentScoresMatrix = matrix()

      // create matrix of matches
      const matchTeamsMatrix = matrix(
        matches.flatMap((match: Match) => {
          const winningTeams = match.redScore > match.blueScore ? match.redTeams : match.blueTeams;
          const losingTeams = match.redScore > match.blueScore ? match.blueTeams : match.redTeams;

          winningTeams.forEach(async (team: Team) => {
            if (match.roundType === 2) {
              team.qualMatchWins++;
              team.qualMatchCount++;
            } else if (match.roundType >= 3) {
              team.elimMatchWins++;
              team.elimMatchCount++;
            }
          })

          losingTeams.forEach(async (team: Team) => {
            if (match.roundType === 2) {
              team.qualMatchLosses++;
              team.qualMatchCount++;
            } else if (match.roundType >= 3) {
              team.elimMatchLosses++;
              team.elimMatchCount++;
            }
          })

          const winningRatings = winningTeams.map(team => {
            return rating({mu: team.mu, sigma: team.sigma});
          });

          const losingRatings = losingTeams.map(team => {
            return rating({mu: team.mu, sigma: team.sigma});
          });

          const newRatings = rate([winningRatings, losingRatings]);

          winningTeams.forEach((team, index) => {
            team.mu = newRatings[0][index].mu;
            team.sigma = newRatings[0][index].sigma;
          });

          losingTeams.forEach((team, index) => {
            team.mu = newRatings[1][index].mu;
            team.sigma = newRatings[1][index].sigma;
          });

          const redRow = playingTeams.map(team =>
            match.redTeams.some((redTeam: Team) => {
              return redTeam.teamId === team.teamId;
          }) ? 1 : 0);
          const blueRow = playingTeams.map(team =>
            match.blueTeams.some((blueTeam: Team) => {
              return blueTeam.teamId === team.teamId;
          }) ? 1 : 0);

          matchScoresMatrix = matrix(
            concat(matchScoresMatrix, [match.redScore], [match.blueScore], 0)
          );
          matchOpponentScoresMatrix = matrix(
            concat(matchOpponentScoresMatrix, [match.blueScore], [match.redScore], 0)
          );

          return [redRow, blueRow];
        })
      );

      try {
        const matchTeamsPseudoInverse = pinv(matchTeamsMatrix);


        const oprMatrix = multiply(matchTeamsPseudoInverse, matchScoresMatrix);
        const dprMatrix = multiply(matchTeamsPseudoInverse, matchOpponentScoresMatrix);

        for (let i = 0; i < oprMatrix.size()[0]; i++) {
          const team: Team = playingTeams[i];

          const opr: number = +oprMatrix.get([i]).toFixed(4);
          const dpr: number = +dprMatrix.get([i]).toFixed(4);

          team.oprCum += opr;
          team.dprCum += dpr;
          team.eventCount++;
        }
      } catch (e) {
        console.log(e)
        console.log(`Couldn't analyze ${event.eventCode} - division ${division}`)
      }
    }));
  }));

  return latestTeamsUpdate;
};

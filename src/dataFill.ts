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
  getTeamSkills, getSeason,
} from "./RobotEventsAPI.js";
import { rating, rate, ordinal } from 'openskill'
import { logger, prismaConnection } from "./server.js";
import {SeasonAnalysis} from "@prisma/client";

export class TeamSeasonProfile {
  teamNumber: string;
  teamName: string;
  teamId: number;

  seasonId: number;
  seasonName: string;

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

  private static teamSeasonProfiles: TeamSeasonProfile[] = [];

  private constructor(teamSeasonProfile) {
    Object.assign(this, teamSeasonProfile);
    TeamSeasonProfile.teamSeasonProfiles.push(this);
  }

  static async countTeamSeasonProfiles() {
    return this.teamSeasonProfiles.length;
  }

  static async getTeamSeasonProfile(teamId: number, seasonId: number, seasonName: string) {
    const existingObject = TeamSeasonProfile.teamSeasonProfiles.find((teamSeasonProfile) => {
      return teamSeasonProfile.teamId === teamId && teamSeasonProfile.seasonId === seasonId;
    });

    if (existingObject) {
      return existingObject;
    }

    const teamObject = await getTeamObject(teamId);

    if (!teamObject) {
      return null;
    }

    let existingTeamProfile = await prismaConnection.teamProfile.findUnique({
      where: {
        teamId: teamId,
      }
    });

    let existingTeamSeasonProfile;

    if (!existingTeamProfile) {
      existingTeamProfile = await prismaConnection.teamProfile.create({
        data: {
          teamId: teamId,
          teamName: teamObject.team_name,
          teamNumber: teamObject.number,
          robotName: teamObject.robot_name,
          teamGrade: teamObject.grade,
          teamOrg: teamObject.organization,
          teamCity: teamObject.location.city,
          teamRegion: teamObject.location.region,
          teamCountry: teamObject.location.country,
          programId: teamObject.program.id,
          programCode: teamObject.program.code,
        }
      });
    } else {
      existingTeamProfile = await prismaConnection.teamProfile.update({
        where: {
          teamId: teamId,
        },
        data: {
          teamName: teamObject.team_name,
          teamNumber: teamObject.number,
          robotName: teamObject.robot_name,
          teamGrade: teamObject.grade,
          teamOrg: teamObject.organization,
          teamCity: teamObject.location.city,
          teamRegion: teamObject.location.region,
          teamCountry: teamObject.location.country,
          programId: teamObject.program.id,
          programCode: teamObject.program.code,
        }
      });
    }

    existingTeamSeasonProfile = await prismaConnection.teamSeasonProfile.findUnique({
      where: {
        teamId_seasonId: {
          teamId: teamId,
          seasonId: seasonId,
        }
      }
    });

    if (!existingTeamSeasonProfile) {
      existingTeamSeasonProfile = await prismaConnection.teamSeasonProfile.create({
        data: {
          teamName: teamObject.team_name,
          teamNumber: teamObject.number,
          seasonId: seasonId,
          seasonName: seasonName,
          mu: 25,
          sigma: 8.333333333333334,
          openSkill: 0,
          openSkillRank: 0,
          opr: 0,
          dpr: 0,
          ccwm: 0,
          oprCum: 0,
          dprCum: 0,
          eventCount: 0,
          topProgSkills: 0,
          topDriverSkills: 0,
          topTotalSkills: 0,
          skillsRank: 0,
          qualMatchCount: 0,
          elimMatchCount: 0,
          totalMatchWinPercentage: 0,
          qualMatchWins: 0,
          elimMatchWins: 0,
          qualMatchLosses: 0,
          elimMatchLosses: 0,
          qualMatchWinPercentage: 0,
          elimMatchWinPercentage: 0,
          qualToRegionals: false,
          awardQualToWorlds: false,
          team: {
            connect: {
              teamId: teamId,
            }
          }
        }
      });
    }

    const teamSeasonProfileTemplate = {
      teamName: existingTeamSeasonProfile.teamName,
      teamId: existingTeamSeasonProfile.teamId,
      teamNumber: existingTeamSeasonProfile.teamNumber,
      seasonId: existingTeamSeasonProfile.seasonId,
      seasonName: existingTeamSeasonProfile.seasonName,
      teamOrg: existingTeamSeasonProfile.teamOrg,
      teamCity: existingTeamSeasonProfile.teamCity,
      teamRegion: existingTeamSeasonProfile.teamRegion,
      teamCountry: existingTeamSeasonProfile.teamCountry,
      mu: existingTeamSeasonProfile.mu,
      sigma: existingTeamSeasonProfile.sigma,
      openSkill: existingTeamSeasonProfile.openSkill,
      openSkillRank: existingTeamSeasonProfile.openSkillRank,
      opr: existingTeamSeasonProfile.opr,
      dpr: existingTeamSeasonProfile.dpr,
      ccwm: existingTeamSeasonProfile.ccwm,
      oprCum: existingTeamSeasonProfile.oprCum,
      dprCum: existingTeamSeasonProfile.dprCum,
      eventCount: existingTeamSeasonProfile.eventCount,
      topProgSkills: existingTeamSeasonProfile.topProgSkills,
      topDriverSkills: existingTeamSeasonProfile.topDriverSkills,
      topTotalSkills: existingTeamSeasonProfile.topTotalSkills,
      skillsRank: existingTeamSeasonProfile.skillsRank,
      qualMatchCount: existingTeamSeasonProfile.qualMatchCount,
      elimMatchCount: existingTeamSeasonProfile.elimMatchCount,
      totalMatchWinPercentage: existingTeamSeasonProfile.totalMatchWinPercentage,
      qualMatchWins: existingTeamSeasonProfile.qualMatchWins,
      elimMatchWins: existingTeamSeasonProfile.elimMatchWins,
      qualMatchLosses: existingTeamSeasonProfile.qualMatchLosses,
      elimMatchLosses: existingTeamSeasonProfile.elimMatchLosses,
      qualMatchWinPercentage: existingTeamSeasonProfile.qualMatchWinPercentage,
      elimMatchWinPercentage: existingTeamSeasonProfile.elimMatchWinPercentage,
      qualToRegionals: existingTeamSeasonProfile.qualToRegionals,
      awardQualToWorlds: existingTeamSeasonProfile.awardQualToWorlds,
    };

    return new TeamSeasonProfile(teamSeasonProfileTemplate);
  }

  async store() {
    await prismaConnection.teamSeasonProfile.update({
      where: {
        teamId_seasonId: {
          teamId: this.teamId,
          seasonId: this.seasonId,
        }
      },
      data: {
        teamId: this.teamId,
        teamName: this.teamName,
        teamNumber: this.teamNumber,
        seasonId: this.seasonId,
        seasonName: this.seasonName,
        mu: this.mu,
        sigma: this.sigma,
        openSkill: this.openSkill,
        openSkillRank: this.openSkillRank,
        opr: this.opr,
        dpr: this.dpr,
        ccwm: this.ccwm,
        oprCum: this.oprCum,
        dprCum: this.dprCum,
        eventCount: this.eventCount,
        topProgSkills: this.topProgSkills,
        topDriverSkills: this.topDriverSkills,
        topTotalSkills: this.topTotalSkills,
        skillsRank: this.skillsRank,
        qualMatchCount: this.qualMatchCount,
        elimMatchCount: this.elimMatchCount,
        totalMatchWinPercentage: this.totalMatchWinPercentage,
        qualMatchWins: this.qualMatchWins,
        elimMatchWins: this.elimMatchWins,
        qualMatchLosses: this.qualMatchLosses,
        elimMatchLosses: this.elimMatchLosses,
        qualMatchWinPercentage: this.qualMatchWinPercentage,
        elimMatchWinPercentage: this.elimMatchWinPercentage,
        qualToRegionals: this.qualToRegionals,
        awardQualToWorlds: this.awardQualToWorlds,
      }
    });

    return;
  }

  async populate() {
    try {
      if (this.eventCount > 0) {
        this.opr = +(this.oprCum / this.eventCount).toFixed(4);
        this.dpr = +(this.dprCum / this.eventCount).toFixed(4);
      } else {
        this.opr = 0;
        this.dpr = 0;
      }

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
    } catch (err) {
      logger.error(err);
    }
  }

  static async populateAllTeams() {
    const promises: Promise<void>[] = [];

    this.teamSeasonProfiles.forEach((team) => {
      promises.push(team.populate());
    });

    await Promise.all(promises);
  }

  static async performSeasonRankings(seasonId: number) {
    const seasonTeams = await prismaConnection.teamSeasonProfile.findMany({
      where: {
        seasonId: seasonId,
      },
    });

    await this.clearTeamSeasonProfilesObjects();

    await Promise.all(seasonTeams.map(async (team) => {
      await this.getTeamSeasonProfile(team.teamId, team.seasonId, team.seasonName);
    }));

    const openSkillSorted = [...this.teamSeasonProfiles].sort((teamA, teamB) => {
      return teamB.openSkill - teamA.openSkill;
    });

    openSkillSorted.forEach((team, index) => {
      team.openSkillRank = index + 1;
    });

    const topSkillsSorted = [...this.teamSeasonProfiles].sort((teamA, teamB) => {
      return teamB.topTotalSkills - teamA.topTotalSkills;
    });

    topSkillsSorted.forEach((team, index) => {
      team.skillsRank = index + 1;
    });

    const promises: Promise<void>[] = [];

    this.teamSeasonProfiles.forEach((team) => {
      promises.push(team.store());
    });

    await Promise.all(promises);

    const numberOfWorldsQualifiers: number = this.teamSeasonProfiles.filter((team) => {
      return team.awardQualToWorlds;
    }).length;

    const numberOfRegionalQualifiers: number = this.teamSeasonProfiles.filter((team) => {
      return team.qualToRegionals;
    }).length;

    await prismaConnection.seasonAnalysis.update({
      where: {
        seasonId: seasonId,
      },
      data: {
        numberOfWorldsQualifiers: numberOfWorldsQualifiers,
        numberOfRegionalQualifiers: numberOfRegionalQualifiers,
      }
    });
  }

  static async storeTeamSeasonProfiles() {
    const promises: Promise<void>[] = [];

    this.teamSeasonProfiles.forEach((team) => {
      promises.push(team.store());
    });

    await Promise.all(promises);
  }

  static async clearTeamSeasonProfilesObjects() {
    this.teamSeasonProfiles = [];
  }
}

class Match {
  redScore: number;
  blueScore: number;

  // RE can return a non-existant team in a match
  redTeams: (TeamSeasonProfile | null)[];
  blueTeams: (TeamSeasonProfile | null)[];

  roundType: number;

  constructor(
    redScore: number,
    blueScore: number,
    redTeams: (TeamSeasonProfile | null)[],
    blueTeams: (TeamSeasonProfile | null)[],
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
  seasonName: string;
  divisions: number[];
  end: Date;

  constructor(eventCode: string, eventId: number, seasonId: number, seasonName: string, end: Date, divisions: number[]) {
    this.eventCode = eventCode;
    this.eventId = eventId;
    this.seasonName = seasonName;
    this.seasonId = seasonId;
    this.end = end;
    this.divisions = divisions;
  }

  async getMatches(division: number) : Promise<Match[]> {
    const matches = await getEventMatches(this.eventId, division);

    const matchObjects: Match[] = [];

    for (const match of matches) {
      const redTeams: (TeamSeasonProfile | null)[] = [];
      const blueTeams: (TeamSeasonProfile | null)[] = [];

      let redScore: number = 0;
      let blueScore: number = 0;

      const roundType: number = match.round;

      for (const alliance of match.alliances) {
        if (alliance.color === "red") {
          redScore = alliance.score;
          await Promise.all(alliance.teams.map(async (team) => {
            const teamObject: TeamSeasonProfile | null =
              await TeamSeasonProfile.getTeamSeasonProfile(team.team.id, this.seasonId, this.seasonName);
            redTeams.push(teamObject);
          }))
        } else if (alliance.color === "blue") {
          blueScore = alliance.score;
          await Promise.all(alliance.teams.map(async (team) => {
            const teamObject: TeamSeasonProfile | null =
              await TeamSeasonProfile.getTeamSeasonProfile(team.team.id, this.seasonId, this.seasonName);
            blueTeams.push(teamObject);
          }))
        }
      }

      matchObjects.push(new Match(redScore, blueScore, redTeams, blueTeams, roundType));
    }

    return matchObjects;
  }
}

export const calcCumulativeStats = async (seasonId: number, SeasonAnalysisObject: SeasonAnalysis) => {
  const seasonObject = await getSeason(seasonId);

  if (!seasonObject) {
    return;
  }

  const seasonEvents = await getEvents(seasonId);

  if (!seasonEvents) {
    return;
  }

  const newEvents: any[] = [];

  for (const event of seasonEvents) {
    if (new Date(event.end).getTime() + 86400000 > new Date().getTime()) {
      continue; // Skip events that haven't ended for at least a day
    }

    if (SeasonAnalysisObject.lastEventDate.getTime() < new Date(event.end).getTime()) {
      newEvents.push(event); // Add events that meet the criteria
    }
  }

  if (newEvents.length === 0) {
    logger.warn("No new events to analyze");
    return;
  }

  const events: Event[] = newEvents.map((event) => {
    return new Event(event.sku, event.id, seasonId, seasonObject.name, new Date(event.end), event.divisions.map((division) => division.id));
  });

  logger.verbose(`Analyzing ${events.length} events...`);

  events.sort((a, b) => {
    return a.end.getTime() - b.end.getTime();
  })

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const eventDivisions = event.divisions;

    if (!eventDivisions || eventDivisions.length === 0) {
      continue;
    }

    logger.verbose(`Processing ${event.eventCode}, ${events.length - i + 1} remaining...`);
    for (const division of eventDivisions) {
      const matches: Match[] = await event.getMatches(division)

      if (matches.length < 4) {
        continue;
      }

      const playingTeams: (TeamSeasonProfile | null)[] = [];

      matches.forEach((match) => {
        [...match.redTeams, ...match.blueTeams].forEach((team: TeamSeasonProfile | null) => {
          if (!team) {
            return null;
          }

          const existingTeam = !playingTeams.some((existingTeam: TeamSeasonProfile | null): boolean => {
            return (existingTeam != null && existingTeam.teamId === team.teamId)
          });

          if (existingTeam) {
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

          winningTeams.forEach(async (team: TeamSeasonProfile | null) => {
            if (!team) {
              return;
            }

            if (match.roundType === 2) {
              team.qualMatchWins++;
              team.qualMatchCount++;
            } else if (match.roundType >= 3) {
              team.elimMatchWins++;
              team.elimMatchCount++;
            }
          })

          losingTeams.forEach(async (team: TeamSeasonProfile | null) => {
            if (!team) {
              return;
            }

            if (match.roundType === 2) {
              team.qualMatchLosses++;
              team.qualMatchCount++;
            } else if (match.roundType >= 3) {
              team.elimMatchLosses++;
              team.elimMatchCount++;
            }
          })

          const winningRatings = winningTeams.map(team => {
            if (!team) {
              return rating();
            }
            return rating({mu: team.mu, sigma: team.sigma});
          });

          const losingRatings = losingTeams.map(team => {
            if (!team) {
              return rating();
            }
            return rating({mu: team.mu, sigma: team.sigma});
          });

          const newRatings = rate([winningRatings, losingRatings]);

          winningTeams.forEach((team, index) => {
            if (!team) {
              return;
            }

            team.mu = newRatings[0][index].mu;
            team.sigma = newRatings[0][index].sigma;
          });

          losingTeams.forEach((team, index) => {
            if (!team) {
              return;
            }

            team.mu = newRatings[1][index].mu;
            team.sigma = newRatings[1][index].sigma;
          });

          const redRow = playingTeams.map((team: TeamSeasonProfile | null)  => {
            if (!team) {
              return 0;
            }

            const teamHere = match.redTeams.some((redTeam: TeamSeasonProfile | null) => {
              if (!redTeam) {
                return false;
              } else {
                return redTeam.teamId === team.teamId
              }
            })

            if (teamHere) {
              return 1;
            } else {
              return 0;
            }
          });

          const blueRow = playingTeams.map((team: TeamSeasonProfile | null)  => {
            if (!team) {
              return 0;
            }

            const teamHere = match.blueTeams.some((blueTeam: TeamSeasonProfile | null) => {
              if (!blueTeam) {
                return false;
              } else {
                return blueTeam.teamId === team.teamId
              }
            })

            if (teamHere) {
              return 1;
            } else {
              return 0;
            }
          });

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

        for (let j = 0; j < oprMatrix.size()[0]; j++) {
          const team: TeamSeasonProfile | null = playingTeams[j];

          if (!team) {
            continue;
          }

          const opr: number = +oprMatrix.get([j]).toFixed(4);
          const dpr: number = +dprMatrix.get([j]).toFixed(4);

          team.oprCum += opr;
          team.dprCum += dpr;
          team.eventCount++;
        }
      } catch (e) {
        logger.warn(e)
        logger.warn(`Couldn't analyze ${event.eventCode} - division ${division}`)
      }
    }
  }

  const newNumberOfEvents = SeasonAnalysisObject.numberOfEvents + events.length;
  const newNumberOfTeams = SeasonAnalysisObject.numberOfTeams + await TeamSeasonProfile.countTeamSeasonProfiles();
  const newLastEventDate = events[events.length - 1].end;

  await prismaConnection.seasonAnalysis.update({
    where: {
      seasonId: seasonId,
    },
    data: {
      numberOfEvents: newNumberOfEvents,
      numberOfTeams: newNumberOfTeams,
      lastEventDate: newLastEventDate,
    }
  });
};

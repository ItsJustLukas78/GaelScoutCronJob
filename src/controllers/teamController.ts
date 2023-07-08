import { Request, Response } from 'express';
import { SeasonProfileDocument, SeasonProfileDocumentType } from '../models/SeasonProfile.js';
async function formatTeamDocument(seasonProfile: SeasonProfileDocumentType) {
  return {
    teamId: seasonProfile.teamId,
    teamName: seasonProfile.teamName,
    teamNumber: seasonProfile.teamNumber,
    opr: seasonProfile.opr,
    dpr: seasonProfile.dpr,
    ccwm: seasonProfile.ccwm,
    openSkill: seasonProfile.openSkill,
    openSkillRank: seasonProfile.openSkillRank,
    eventCount: seasonProfile.eventCount,
    topProgSkills: seasonProfile.topProgSkills,
    topDriverSkills: seasonProfile.topDriverSkills,
    topTotalSkills: seasonProfile.topTotalSkills,
    skillsRank: seasonProfile.skillsRank,
    qualMatchCount: seasonProfile.qualMatchCount,
    elimMatchCount: seasonProfile.elimMatchCount,
    qualMatchWins: seasonProfile.qualMatchWins,
    elimMatchWins: seasonProfile.elimMatchWins,
    qualMatchLosses: seasonProfile.qualMatchLosses,
    elimMatchLosses: seasonProfile.elimMatchLosses,
    qualMatchWinPercentage: seasonProfile.qualMatchWinPercentage,
    elimMatchWinPercentage: seasonProfile.elimMatchWinPercentage,
    totalMatchWinPercentage: seasonProfile.totalMatchWinPercentage,
    qualToRegionals: seasonProfile.qualToRegionals,
    awardQualToWorlds: seasonProfile.awardQualToWorlds,
  }
}

export async function getAllTeams(req: Request, res: Response) {
  let seasonId = req.query.seasonId;

  if (!seasonId) {
    res.status(400).json({ error: 'Season ID not provided' });
    return;
  }

  const teams = await SeasonProfileDocument.find({ seasonId: seasonId });

  const formattedTeams = await Promise.all(teams.map(async (team: SeasonProfileDocumentType) => {
    return await formatTeamDocument(team);
  }));

  const prettyJson: string = JSON.stringify(formattedTeams, null, 2);

  res.setHeader('Content-Type', 'application/json');
  res.send(prettyJson);
}

export async function getTeam(req: Request, res: Response) {
  const teamNumber = req.query.teamNumber;
  const seasonId = req.query.seasonId;

  if (!teamNumber || !seasonId) {
    res.status(400).json({ error: 'Team ID or Season ID not provided' });
    return;
  }

  const team = await SeasonProfileDocument.findOne({ teamNumber: teamNumber, seasonId: seasonId });

  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const formattedTeam = await formatTeamDocument(team);

  const prettyJson: string = JSON.stringify(formattedTeam, null, 2);

  res.setHeader('Content-Type', 'application/json');
  res.send(prettyJson);
}
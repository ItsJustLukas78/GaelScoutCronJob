import { Request, Response } from 'express';
import { TeamDocument, TeamDocumentType } from '../models/Team.js';

async function formatTeamDocument(teamDocument: TeamDocumentType) {
  return {
    teamId: teamDocument.teamId,
    teamName: teamDocument.teamName,
    teamNumber: teamDocument.teamNumber,
    robotName: teamDocument.robotName,
    teamGrade: teamDocument.teamGrade,
    teamOrg: teamDocument.teamOrg,
    teamCity: teamDocument.teamCity,
    teamRegion: teamDocument.teamRegion,
    teamCountry: teamDocument.teamCountry,
    opr: teamDocument.opr,
    dpr: teamDocument.dpr,
    ccwm: teamDocument.ccwm,
    openSkill: teamDocument.openSkill,
    openSkillRank: teamDocument.openSkillRank,
    eventCount: teamDocument.eventCount,
    topProgSkills: teamDocument.topProgSkills,
    topDriverSkills: teamDocument.topDriverSkills,
    topTotalSkills: teamDocument.topTotalSkills,
    skillsRank: teamDocument.skillsRank,
    qualMatchCount: teamDocument.qualMatchCount,
    elimMatchCount: teamDocument.elimMatchCount,
    qualMatchWins: teamDocument.qualMatchWins,
    elimMatchWins: teamDocument.elimMatchWins,
    qualMatchLosses: teamDocument.qualMatchLosses,
    elimMatchLosses: teamDocument.elimMatchLosses,
    qualMatchWinPercentage: teamDocument.qualMatchWinPercentage,
    elimMatchWinPercentage: teamDocument.elimMatchWinPercentage,
    totalMatchWinPercentage: teamDocument.totalMatchWinPercentage,
    qualToRegionals: teamDocument.qualToRegionals,
    awardQualToWorlds: teamDocument.awardQualToWorlds,
  }
}

export async function getAllTeams(req: Request, res: Response) {
  let seasonId = req.query.seasonId;

  if (!seasonId) {
    res.status(400).json({ error: 'Season ID not provided' });
    return;
  }

  const teams = await TeamDocument.find({ seasonId: seasonId});

  const formattedTeams = await Promise.all(teams.map(async (team: TeamDocumentType) => {
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

  const team = await TeamDocument.findOne({ teamNumber: teamNumber, seasonId: seasonId });

  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const formattedTeam = await formatTeamDocument(team);

  const prettyJson: string = JSON.stringify(formattedTeam, null, 2);

  res.setHeader('Content-Type', 'application/json');
  res.send(prettyJson);
}
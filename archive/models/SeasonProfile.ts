import { Schema, model, Types } from 'mongoose';

export interface SeasonProfileDocumentType {
    teamDocument: Types.ObjectId;
    teamId: number;
    teamName: string;
    teamNumber: string;
    seasonId: number;
    seasonName: string;
    mu: number;
    sigma: number;
    openSkill: number;
    openSkillRank: number;
    opr: number;
    dpr: number;
    ccwm: number;
    oprCum: number;
    dprCum: number;
    eventCount: number;
    topProgSkills: number;
    topDriverSkills: number;
    topTotalSkills: number;
    skillsRank: number;
    qualMatchCount: number;
    elimMatchCount: number;
    qualMatchWins: number;
    elimMatchWins: number;
    qualMatchLosses: number;
    elimMatchLosses: number;
    qualMatchWinPercentage: number;
    elimMatchWinPercentage: number;
    totalMatchWinPercentage: number;
    qualToRegionals: boolean;
    awardQualToWorlds: boolean;
}

const seasonProfileSchema = new Schema<SeasonProfileDocumentType>({
    teamDocument: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    teamId: { type: Number, required: true },
    teamName: { type: String, required: true },
    teamNumber: { type: String, required: true },
    seasonId: { type: Number, required: true },
    seasonName: { type: String, required: true },
    mu: { type: Number, required: true },
    sigma: { type: Number, required: true },
    openSkill: { type: Number, required: true },
    openSkillRank: { type: Number, required: true },
    opr: { type: Number, required: true },
    dpr: { type: Number, required: true },
    ccwm: { type: Number, required: true },
    oprCum: { type: Number, required: true },
    dprCum: { type: Number, required: true },
    eventCount: { type: Number, required: true },
    topProgSkills: { type: Number, required: true },
    topDriverSkills: { type: Number, required: true },
    topTotalSkills: { type: Number, required: true },
    skillsRank: { type: Number, required: true },
    qualMatchCount: { type: Number, required: true },
    elimMatchCount: { type: Number, required: true },
    qualMatchWins: { type: Number, required: true },
    elimMatchWins: { type: Number, required: true },
    qualMatchLosses: { type: Number, required: true },
    elimMatchLosses: { type: Number, required: true },
    qualMatchWinPercentage: { type: Number, required: true },
    elimMatchWinPercentage: { type: Number, required: true },
    totalMatchWinPercentage: { type: Number, required: true },
    qualToRegionals: { type: Boolean, required: true },
    awardQualToWorlds: { type: Boolean, required: true },
});

export const SeasonProfileDocument = model<SeasonProfileDocumentType>('Team', seasonProfileSchema);


import { Schema, model } from 'mongoose';

export interface TeamProfileDocumentType {
    teamId: number;
    teamName: string;
    teamNumber: string;
    robotName: string;
    teamGrade: string;
    teamOrg: string;
    teamCity: string;
    teamRegion: string;
    teamCountry: string;
}

const teamProfileSchema = new Schema<TeamProfileDocumentType>({
    teamId: { type: Number, required: true },
    teamName: { type: String, required: true },
    teamNumber: { type: String, required: true },
    robotName: { type: String, required: false },
    teamGrade: { type: String, required: false },
    teamOrg: { type: String, required: false },
    teamCity: { type: String, required: false },
    teamRegion: { type: String, required: false },
    teamCountry: { type: String, required: false },
});

export const TeamProfileDocument = model<TeamProfileDocumentType>('TeamProfile', teamProfileSchema);


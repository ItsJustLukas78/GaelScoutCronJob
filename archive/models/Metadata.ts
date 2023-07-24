import { Schema, model } from 'mongoose';

export interface MetadataDocumentType {
  latestTeamsUpdate: Date;
}

const metadataSchema = new Schema<MetadataDocumentType>({
  latestTeamsUpdate: { type: Date, required: true },
});

export const MetadataDocument = model<MetadataDocumentType>('Metadata', metadataSchema);


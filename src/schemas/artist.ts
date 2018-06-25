'use strict';
import { Document, Model, model, Schema } from 'mongoose';

export interface IArtist extends Document {
  count: number;
  externalURL: string;
  id: string;
  image: string;
  name: string;
}

export const ArtistSchema: Schema = new Schema({
  count: {
    required: false,
    type: Number
  },
  externalURL: {
    required: true,
    type: String
  },
  id: {
    required: true,
    type: String
  },
  image: {
    required: true,
    type: String
  },
  name: {
    required: true,
    type: String
  }
}, {
    timestamps: true
  });

export const Artist: Model<IArtist> = model<IArtist>('Artist', ArtistSchema, 'Artist');

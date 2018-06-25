'use strict';
import { Document, Model, model, Schema } from 'mongoose';

export interface ITrack extends Document {
  artist: string[];
  count: number;
  created: string;
  duration: number;
  externalURL: string;
  genres: string[];
  id: string;
  image: string;
  name: string;
  query: string;
}

export const TrackSchema: Schema = new Schema({
  artist: {
    required: true,
    type: [String]
  },
  count: {
    required: false,
    type: Number
  },
  created: {
    required: true,
    type: String
  },
  duration: {
    required: true,
    type: Number
  },
  externalURL: {
    required: false,
    type: String
  },
  genres: {
    required: false,
    type: [String]
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
  },
  query: {
    required: true,
    type: String
  }
}, {
    timestamps: true
  });

export const Track: Model<ITrack> = model<ITrack>('Tracks', TrackSchema, 'Tracks');

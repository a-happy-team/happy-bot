import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Queues {
  addedAt: Generated<Timestamp>;
  channelId: string;
  guildId: string;
  songId: string;
}

export interface SongPlays {
  channelId: string;
  createdAt: Generated<Timestamp>;
  guildId: string;
  id: Generated<string>;
  processedAt: Timestamp | null;
  requestedBy: string;
  songId: string | null;
}

export interface Songs {
  artist: string;
  createdAt: Generated<Timestamp>;
  genre: string;
  id: Generated<string>;
  name: string;
  playedCount: Generated<Int8>;
  updatedAt: Generated<Timestamp>;
  url: string;
}

export interface DB {
  queues: Queues;
  songPlays: SongPlays;
  songs: Songs;
}

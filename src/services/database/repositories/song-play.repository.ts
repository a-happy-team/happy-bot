import { inject, injectable } from "@a-happy-team/dependo";
import { Kysely } from "kysely";
import { Try } from "../../../decorators/try";
import { DB } from "../types";

@injectable({ singleton: true })
export default class SongPlayRepository {
  @inject("DB") db: Kysely<DB>;

  @Try async add(params: RecordPlayParams) {
    let songId: string | null = "songId" in params ? params.songId : null;

    if ("url" in params) {
      const song = await this.db.selectFrom("songs").where("url", "=", params.url).select("id").executeTakeFirst();

      if (!song) {
        throw new Error("Song not found.");
      }

      songId = song.id;
    }

    this.db
      .insertInto("songPlays")
      .values({
        channelId: params.channelId,
        guildId: params.guildId,
        requestedBy: params.requestedBy,
        songId,
      })
      .execute();
  }

  @Try async countUnprocessed() {
    const response = await this.db
      .selectFrom("songPlays")
      .where("processedAt", "is", null)
      .select(this.db.fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(response.count);
  }

  @Try async getUnprocessed(params: PaginationParams) {
    return this.db
      .selectFrom("songs")
      .select(["songs.id as songId", this.db.fn.countAll().as("count")])
      .innerJoin("songPlays", "songs.id", "songPlays.songId")
      .where("songPlays.processedAt", "is", null)
      .groupBy("songs.id")
      .limit(params.limit)
      .offset(params.offset)
      .execute();
  }

  @Try async markAsProcessed(songId: string) {
    return this.db
      .updateTable("songPlays")
      .set("processedAt", new Date().toISOString())
      .where("songId", "=", songId)
      .where("processedAt", "is", null)
      .execute();
  }

  @Try async getTopSongs(params: GetTopSongsParams) {
    return this.db
      .selectFrom("songs")
      .select(["songs.id", "songs.spotifyTrackId", this.db.fn.countAll().as("count")])
      .innerJoin("songPlays", "songPlays.songId", "songs.id")
      .where("requestedBy", "=", params.userId)
      .groupBy(["songs.id", "songs.spotifyTrackId"])
      .orderBy("count", "desc")
      .limit(5)
      .execute();
  }
}

type GetTopSongsParams = {
  userId: string;
};

type PaginationParams = {
  limit: number;
  offset: number;
};

type RecordPlayParams =
  | {
      url: string;
      guildId: string;
      channelId: string;
      requestedBy: string;
    }
  | {
      songId: string;
      guildId: string;
      channelId: string;
      requestedBy: string;
    };

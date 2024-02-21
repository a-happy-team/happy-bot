import { Insertable, Kysely } from "kysely";
import { Try } from "../../../decorators/try";
import { DB, Songs } from "../types";

export default class SongRepository {
  constructor(private db: Kysely<DB>) {}

  @Try
  async insert(song: Insertable<Songs>) {
    return this.db
      .insertInto("songs")
      .values({
        ...song,
        genre: song.genre || "UNKNOWN",
      })
      .executeTakeFirst();
  }

  @Try
  async findOrCreate(song: Insertable<Songs>) {
    const songOrNull = await this.db.selectFrom("songs").where("url", "=", song.url).selectAll().executeTakeFirst();

    if (songOrNull) {
      return songOrNull;
    }

    return this.insert(song);
  }

  @Try
  async recordPlay(params: RecordPlayParams) {
    let songId: string | null = "songId" in params ? params.songId : null;

    if ("url" in params) {
      const song = await this.db.selectFrom("songs").where("url", "=", params.url).select("id").executeTakeFirst();

      if (!song) {
        throw new Error("Song not found.");
      }

      songId = song.id;
    }

    await this.db
      .insertInto("songPlays")
      .values({
        ...params,
        songId,
      })
      .execute();
  }
}

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

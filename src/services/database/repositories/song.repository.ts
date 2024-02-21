import { Insertable, Kysely } from "kysely";
import { DB, Songs } from "kysely-codegen";

export default class SongRepository {
  constructor(private db: Kysely<DB>) {}

  async insert(song: Insertable<Songs>) {
    return this.db
      .insertInto("songs")
      .values({
        ...song,
        genre: song.genre || "UNKNOWN",
      })
      .executeTakeFirst();
  }

  async findOrCreate(song: Insertable<Songs>) {
    const songOrNull = await this.db.selectFrom("songs").where("url", "=", song.url).selectAll().executeTakeFirst();

    if (songOrNull) {
      return songOrNull;
    }

    return this.insert(song);
  }

  async recordPlay(params: RecordPlayParams) {
    let songId: string | null = "songId" in params ? params.songId : null;

    if ("url" in params) {
      const song = await this.db.selectFrom("songs").where("url", "=", params.url).select("id").executeTakeFirst();

      if (!song) {
        throw new Error("Song not found");
      }

      songId = song.id;
    }

    await this.db
      .insertInto("song_plays")
      .values({
        guild_id: params.guildId,
        channel_id: params.channelId,
        song_id: songId,
        is_from_playlist: false,
      })
      .execute();
  }
}

type RecordPlayParams =
  | {
      url: string;
      guildId: string;
      channelId: string;
    }
  | {
      songId: string;
      guildId: string;
      channelId: string;
    };

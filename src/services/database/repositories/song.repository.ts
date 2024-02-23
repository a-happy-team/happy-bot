import { Insertable, Kysely } from "kysely";
import { Try } from "../../../decorators/try";
import { DB, Songs } from "../types";

export default class SongRepository {
  constructor(private db: Kysely<DB>) {}

  @Try async insert(song: Insertable<Songs>) {
    return this.db
      .insertInto("songs")
      .values({
        ...song,
        genre: song.genre || "UNKNOWN",
      })
      .executeTakeFirst();
  }

  @Try async findOrCreate(song: Insertable<Songs>) {
    const songOrNull = await this.db.selectFrom("songs").where("url", "=", song.url).selectAll().executeTakeFirst();

    if (songOrNull) {
      return songOrNull;
    }

    return this.insert(song);
  }

  @Try async updatePlayedCount(params: UpdatePlayedCountParams) {
    const song = await this.db
      .selectFrom("songs")
      .where("id", "=", params.songId)
      .select("playedCount")
      .executeTakeFirst();

    if (!song) {
      throw new Error("Song not found.");
    }

    return this.db
      .updateTable("songs")
      .set("playedCount", song?.playedCount + params.count)
      .where("id", "=", params.songId)
      .execute();
  }
}

type UpdatePlayedCountParams = {
  songId: string;
  count: number;
};

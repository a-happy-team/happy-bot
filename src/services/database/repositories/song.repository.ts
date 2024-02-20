import { Insertable, Kysely } from "kysely";
import { DB, Songs } from "kysely-codegen";

export default class SongRepository {
  constructor(private db: Kysely<DB>) {}

  async insert(song: Insertable<Songs>) {
    return this.db.insertInto("songs").values(song).executeTakeFirst();
  }

  async findOrCreate(song: Insertable<Songs>) {
    const songOrNull = await this.db.selectFrom("songs").where("url", "=", song.url).selectAll().executeTakeFirst();

    if (songOrNull) {
      return songOrNull;
    }

    return this.insert(song);
  }
}

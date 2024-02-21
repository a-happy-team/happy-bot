import { Insertable, Kysely } from "kysely";
import { DB, Queues } from "../types";

export default class QueueRepository {
  constructor(private db: Kysely<DB>) {}

  async insert(queue: Insertable<Queues>) {
    return this.db.insertInto("queues").values(queue).execute();
  }
}

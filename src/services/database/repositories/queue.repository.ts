import { inject, injectable } from "@a-happy-team/dependo";
import { Insertable, Kysely } from "kysely";
import { DB, Queues } from "../types";

@injectable({ singleton: true })
export default class QueueRepository {
  @inject("DB") db: Kysely<DB>;

  async insert(queue: Insertable<Queues>) {
    return this.db.insertInto("queues").values(queue).execute();
  }
}

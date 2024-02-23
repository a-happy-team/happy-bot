import { Kysely } from "kysely";
import { Try } from "../../../decorators/try";
import { DB } from "../types";

export default class CommandUsageRepository {
  constructor(private db: Kysely<DB>) {}

  @Try async add(params: RecordUsageParams) {
    const commandId = params.commandId;

    this.db
      .insertInto("commandUsages")
      .values({
        channelId: params.channelId,
        guildId: params.guildId,
        usedBy: params.usedBy,
        commandId,
      })
      .execute();
  }

  @Try async countUnprocessed() {
    const response = await this.db
      .selectFrom("commandUsages")
      .where("processedAt", "is", null)
      .select(this.db.fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(response.count);
  }

  @Try async getUnprocessed(params: PaginationParams) {
    return this.db
      .selectFrom("commands")
      .select(["commands.id as commandId", this.db.fn.countAll().as("count")])
      .innerJoin("commandUsages", "commands.id", "commandUsages.commandId")
      .where("commandUsages.processedAt", "is", null)
      .groupBy("commands.id")
      .limit(params.limit)
      .offset(params.offset)
      .execute();
  }

  @Try async markAsProcessed(commandId: string) {
    return this.db
      .updateTable("commandUsages")
      .set("processedAt", new Date().toISOString())
      .where("commandId", "=", commandId)
      .where("processedAt", "is", null)
      .execute();
  }
}

type PaginationParams = {
  limit: number;
  offset: number;
};

type RecordUsageParams = {
  commandId: string;
  guildId: string;
  channelId: string;
  usedBy: string;
};

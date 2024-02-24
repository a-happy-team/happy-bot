import { Insertable, Kysely } from "kysely";
import { Try } from "../../../decorators/try";
import { Commands, DB } from "../types";

export default class CommandRepository {
  constructor(private db: Kysely<DB>) {}

  @Try async insert(command: Insertable<Commands>) {
    return this.db
      .insertInto("commands")
      .values({
        ...command,
        name: command.name.toLowerCase(),
        usageCount: command.usageCount,
      })
      .returningAll()
      .executeTakeFirst();
  }

  @Try async findOrCreate(command: Insertable<Commands>) {
    const commandOrNull = await this.db
      .selectFrom("commands")
      .where("name", "=", command.name)
      .selectAll()
      .executeTakeFirst();

    if (commandOrNull) {
      return commandOrNull;
    }

    return this.insert(command);
  }

  @Try async updatePlayedCount(params: UpdateUsageCountParams) {
    const command = await this.db
      .selectFrom("commands")
      .where("name", "=", params.name)
      .select("usageCount")
      .executeTakeFirst();

    if (!command) {
      throw new Error("Command not found.");
    }

    return this.db
      .updateTable("commands")
      .set("usageCount", Number(command?.usageCount) + params.count)
      .where("name", "=", params.name)
      .execute();
  }
}

type UpdateUsageCountParams = {
  name: string;
  count: number;
};

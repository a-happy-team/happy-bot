import { container } from "@a-happy-team/dependo";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DB } from "./types";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

const db = new Kysely<DB>({ dialect, plugins: [new CamelCasePlugin()] });

container.register("DB", db, true);

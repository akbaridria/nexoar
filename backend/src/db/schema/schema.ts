import { pgTable, varchar, integer, unique } from "drizzle-orm/pg-core";

export const userHistory = pgTable(
  "user-history",
  {
    walletAddress: varchar("wallet_address", { length: 40 }).notNull(),
    optionId: integer("option_id").notNull(),
  },
  (table) => ({
    walletOptionUnique: unique("wallet_option_unique").on(
      table.walletAddress,
      table.optionId
    ),
  })
);

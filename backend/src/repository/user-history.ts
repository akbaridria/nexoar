import { eq, sql } from "drizzle-orm";
import { userHistory } from "../db/schema/schema.js";
import { db, type NewUser } from "../db/db.js";

export class UserRepository {
  public async create(users: NewUser[]) {
    return db
      .insert(userHistory)
      .values(users)
      .onConflictDoUpdate({
        target: [userHistory.walletAddress, userHistory.optionId],
        set: { optionId: sql.raw(`excluded.${userHistory.optionId.name}`) },
      });
  }

  public async findByWalletAddress(walletAddress: string) {
    return db.query.userHistory.findMany({
      where: eq(userHistory.walletAddress, walletAddress),
    });
  }
}

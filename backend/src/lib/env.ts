import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  LOG_LEVEL: z.string().default("info"),
  REDIS_URL: z.string(),
  REDIS_DB: z.string().default("0"),
  MNEMONIC: z.string(),
  PASSWORD_WALLET: z.string(),
});

export default envSchema.parse(process.env);

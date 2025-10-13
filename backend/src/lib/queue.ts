import { Queue } from "bullmq";
import IORedis from "ioredis";
import env from "./env.js";

const QUEUE = {
  default: "default",
};

const connection = new IORedis.default(env.REDIS_URL, { maxRetriesPerRequest: null, db: Number.parseInt(env.REDIS_DB) });

const defaultQueue = new Queue(QUEUE.default, {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export { connection, defaultQueue, QUEUE };

import { type Job, Worker } from "bullmq";
import { logger } from "../lib/logger.js";
import { connection, QUEUE } from "../lib/queue.js";
import { exerciseOption } from "../lib/stacks.js";

interface JobData {
  optionId: number;
  expiry: number;
}

class WorkerService {
  constructor() {}

  public setup() {
    const worker = new Worker(QUEUE.default, this.processor, { connection });

    worker.on("completed", (job: Job) => {
      logger.info(`Job ${job.id} completed, task name: ${job.name}`);
    });

    worker.on("failed", (job: Job | undefined, error: Error) => {
      if (job) {
        logger.error(
          `Job ${job.id} failed, task name: ${job.name}, error: ${error.message}`
        );
      } else {
        logger.error(`Job failed, error: ${error.message}`);
      }
    });

    worker.on("error", (err) => {
      logger.error(err);
    });

    return worker;
  }

  private async processor(job: Job<JobData>) {
    logger.info(`Processing job ${job.id}, task name: ${job.name}`);
    await exerciseOption(job.data.optionId);
  }
}

export { WorkerService, type JobData };

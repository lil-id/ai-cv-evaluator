import { Worker, Queue } from 'bullmq';
import prisma from '../helpers/db/prisma.js';
import logger from '../utils/logger/logger.js';
import redisClient from '../helpers/db/redis.js';
import { runEvaluationPipeline } from '../models/pipelineModel.js';

/**
 * Initialize a BullMQ queue for handling evaluation jobs.
 */
export const evaluationQueue = new Queue('evaluationQueue', {
  connection: redisClient,
});

/**
 * @description BullMQ worker responsible for processing jobs from the 'evaluationQueue'.
 *
 * This worker listens for new jobs and executes the candidate evaluation pipeline.
 * It manages the job's lifecycle by updating its status in the database.
 *
 * The processing steps are as follows:
 * 1.  Sets the job status to **'PROCESSING'**.
 * 2.  Calls the `runEvaluationPipeline` function to perform the core evaluation logic.
 * 3.  If the pipeline succeeds, it updates the status to **'COMPLETED'** and stores the result.
 * 4.  If the pipeline fails, it logs the error, updates the status to **'FAILED'**, and allows BullMQ to handle the failed job.
 *
 * @param {string} 'evaluationQueue' - The name of the queue this worker will process.
 * @param {Function} async (job) - The processor function that handles each job.
 * @param {object} job - The job object from the queue.
 * @param {object} job.data - The data payload of the job.
 * @param {string} job.data.jobId - The unique ID of the EvaluationJob record in the database.
 * @param {object} { connection: redisClient } - Worker options, including the Redis connection.
 */
export const evaluationWorker = new Worker('evaluationQueue', async (job) => {
  const { jobId } = job.data;
  logger.info(`Processing job ${jobId}...`);

  try {
    await prisma.evaluationJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    const result = await runEvaluationPipeline(jobId);

    await prisma.evaluationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        result: result,
      },
    });

  } catch (error) {
    logger.error(`Job ${jobId} failed:`, error);
    await prisma.evaluationJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}, { connection: redisClient });

evaluationQueue.on('completed', (job) => {
  logger.info(`Job ${job.data.jobId} has completed.`);
});

evaluationQueue.on('failed', (job, err) => {
  logger.info(`Job ${job.data.jobId} has failed with ${err.message}.`);
});
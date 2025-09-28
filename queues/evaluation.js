import { Worker, Queue } from 'bullmq';
import { runEvaluationPipeline } from '../models/pipelineCVModel.js';
import prisma from '../helpers/db/prisma.js';
import logger from '../utils/logger/logger.js';
import redisClient from '../helpers/db/redis.js';

export const evaluationQueue = new Queue('evaluationQueue', {
  connection: redisClient,
});

// Membuat worker yang mendengarkan antrian 'evaluationQueue'
export const evaluationWorker = new Worker('evaluationQueue', async (job) => {
  const { jobId } = job.data;
  logger.info(`Processing job ${jobId}...`);

  try {
    // 1. Update status pekerjaan menjadi 'PROCESSING'
    await prisma.evaluationJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    // 2. Menjalankan pipeline AI yang kompleks
    const result = await runEvaluationPipeline(jobId);

    // 3. Menyimpan hasil dan update status menjadi 'COMPLETED'
    await prisma.evaluationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        result: result,
      },
    });

  } catch (error) {
    logger.error(`Job ${jobId} failed:`, error);
    // 4. Update status menjadi 'FAILED' jika terjadi error
    await prisma.evaluationJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    });
    // Melempar error lagi agar BullMQ bisa menangani retry jika dikonfigurasi
    throw error;
  }
}, { connection: redisClient });

// Event listener untuk logging
evaluationQueue.on('completed', (job) => {
  logger.info(`Job ${job.data.jobId} has completed.`);
});

evaluationQueue.on('failed', (job, err) => {
  logger.info(`Job ${job.data.jobId} has failed with ${err.message}.`);
});
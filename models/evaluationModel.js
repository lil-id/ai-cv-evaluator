import prisma from "../helpers/db/prisma.js";
import { evaluationQueue } from "../queues/evaluation.js";

/**
 * Destructures the jobData object to extract specific properties.
 *
 * @typedef {Object} JobData
 * @property {string} jobId - The unique identifier for the job.
 * @property {string} cvFileId - The identifier for the CV file associated with the job.
 * @property {string} projectReportFileId - The identifier for the project report file associated with the job.
 *
 * @param {JobData} jobData - The object containing job-related data.
 */
export const createAndQueueJob = async (jobData) => {
    const { jobId, cvFileId, projectReportFileId } = jobData;

    // Store job in DB first
    const newEvaluationJob = await prisma.evaluationJob.create({
        data: {
            jobPostingId: jobId,
            cvFileId: cvFileId,
            projectReportFileId: projectReportFileId,
            status: "QUEUED",
        },
    });

    // After saved to DB, add to queue
    await evaluationQueue.add(
        "process-evaluation",
        { jobId: newEvaluationJob.id },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000, // Delay in milliseconds (e.g., 5 seconds)
            },
        }
    );

    return newEvaluationJob;
};

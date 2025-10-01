import prisma from '../helpers/db/prisma.js';
/**
 * Finds a job by its ID and returns the job details along with the result.
 * 
 * @async
 * @function findJobById
 * @param {string} jobId - The ID of the job to find.
 * @returns {Promise<Object|null>} The job object if found, otherwise null.
 */
export const findJobById = async (jobId) => {
  const job = await prisma.evaluationJob.findUnique({
    where: {
      id: jobId,
    },
  });

  if (job && job.result) {
    job.result = {
      cv_match_rate: job.result.cv_match_rate,
      cv_feedback: job.result.cv_feedback,
      project_score: job.result.project_score,
      project_feedback: job.result.project_feedback,
      overall_summary: job.result.overall_summary,
    };
  }

  return job;
};
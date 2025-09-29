import prisma from '../helpers/db/prisma.js';
/**
 * Mencari sebuah pekerjaan evaluasi di database berdasarkan ID-nya.
 * @param {string} jobId - ID dari pekerjaan yang akan dicari.
 * @returns {Promise<object|null>} - Objek pekerjaan jika ditemukan, atau null jika tidak.
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
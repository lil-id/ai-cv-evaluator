import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createAndQueueJob } from "../models/evaluationModel.js";

const evaluateCVController = Router();

/**
 * @route POST /evaluate
 * @desc Accepts a CV evaluation request, creates a job, and queues it for processing.
 * @access Protected (requires authentication)
 * @returns {Object} JSON response with job ID and status.
 */
evaluateCVController.post("/evaluate", isAuthenticated, async (req, res) => {
    try {
        const { jobId, cvFileId, projectReportFileId } = req.body;

        if (!jobId || !cvFileId || !projectReportFileId) {
            return res.status(400).json({
                message:
                    "Missing required fields: jobId, cvFileId, projectReportFileId",
            });
        }

        const newEvaluationJob = await createAndQueueJob(req.body);

        res.status(202).json({
            id: newEvaluationJob.id,
            status: "queued",
        });
    } catch (error) {
        logger.error("Evaluation Request Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default evaluateCVController;

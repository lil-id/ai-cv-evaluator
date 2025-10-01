import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { findJobById } from "../models/resultModel.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const resultCVController = Router();

/**
 * @route GET /result/:id
 * @desc Retrieve the result of a CV evaluation job by its ID.
 * @access Protected (requires authentication)
 * @returns {Object} JSON response with job status and result if completed.
 */
resultCVController.get("/result/:id", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const job = await findJobById(id);

        if (!job) {
            return res
                .status(404)
                .json({ message: "Evaluation job not found." });
        }

        if (job.status === "COMPLETED") {
            res.status(200).json({
                id: job.id,
                status: job.status.toLowerCase(),
                result: job.result,
            });
        } else if (job.status === "FAILED") {
            res.status(200).json({
                id: job.id,
                status: job.status.toLowerCase(),
                message: "The evaluation process failed. Please try again.",
            });
        } else {
            res.status(200).json({
                id: job.id,
                status: job.status.toLowerCase(),
            });
        }
    } catch (error) {
        logger.error("Get Result Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default resultCVController;

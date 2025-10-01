import multer from "multer";
import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { generateRubricTemplate, processAndSaveRubrics } from "../models/rubricModel.js"; 

const upload = multer({ storage: multer.memoryStorage() });

const rubricController = Router();

/**
 * @route GET /template
 * @desc Generate and download a CSV template for rubrics.
 * @access Protected (requires authentication)
 * @returns {File} CSV file download.
 */
rubricController.get("/template", isAuthenticated, async (req, res) => {
    try {
        const csvTemplate = await generateRubricTemplate();
        res.header("Content-Type", "text/csv");
        res.attachment("rubric_template.csv");
        res.send(csvTemplate);
    } catch (error) {
        logger.error("Rubric Template Generation Error:", error);
        res.status(500).json({ message: "Failed to generate template." });
    }
});

/**
 * @route POST /upload
 * @desc Upload a CSV file containing rubrics.
 * @access Protected (requires authentication)
 * @returns {Object} JSON response with upload status.
 * @body {File} rubricFile - The CSV file containing rubrics.
 */
rubricController.post(
    "/upload",
    isAuthenticated,
    upload.single("rubricFile"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded." });
            }

            await processAndSaveRubrics(req.file.buffer);

            res.status(201).json({
                message: "Rubrics uploaded and saved successfully.",
            });
        } catch (error) {
            logger.error("Rubric Upload Error:", error);
            res.status(error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }
);

export default rubricController;

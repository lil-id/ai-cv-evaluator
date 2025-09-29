import multer from "multer";
import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { generateRubricTemplate, processAndSaveRubrics } from "../models/rubricModel.js"; 

const upload = multer({ storage: multer.memoryStorage() });

const rubricController = Router();

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
            // Memberikan pesan error yang lebih spesifik jika validasi gagal
            logger.error("Rubric Upload Error:", error);
            res.status(error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }
);

export default rubricController;

import { Router } from "express";
import logger from "../utils/logger/logger.js";
import { upload } from "../utils/file/fileUtility.js";
import { saveFileData } from "../models/uploadCVModel.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const uploadCVController = Router();

uploadCVController.post(
    "/upload",
    isAuthenticated,
    upload.fields([
        { name: "cv", maxCount: 1 },
        { name: "projectReport", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            if (
                !req.files ||
                !req.files.cv ||
                !req.files.projectReport
            ) {
                return res.status(400).json({
                    message:
                        "Missing one or more required files (cv, projectReport).",
                });
            }

            const filesData = {
                cv: req.files.cv[0],
                projectReport: req.files.projectReport[0],
            };        

            const savedFiles = await saveFileData(filesData);

            res.status(201).json({
                message: "Files uploaded successfully.",
                files: savedFiles,
            });
        } catch (error) {
            logger.error("Error uploading files:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
);

export default uploadCVController;

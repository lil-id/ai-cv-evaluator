import path from 'path';
import multer from 'multer';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import docxParser from 'docx-parser';
import logger from '../logger/logger.js';
import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Generates a unique filename by appending a unique identifier to the original filename.
 *
 * @param {string} originalName - The original name of the file, including its extension.
 * @returns {string} A new filename with a unique identifier appended before the file extension.
 */
export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const uniqueId = uuidv4().slice(0, 8);
  return `${baseName}-${uniqueId}${ext}`;
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      cb(null, uniqueFilename);
  },
});

/**
 * Middleware for handling file uploads using Multer.
 * Configures the storage and sets a file size limit of 5MB.
 */
export const upload = multer({
  storage: storage,
  limits: {
      fileSize: 5 * 1024 * 1024, // max size 5MB
  },
});


/**
 * Reads the content of a file and parses it based on its extension.
 *
 * @async
 * @function readFileContent
 * @param {string} filePath - The path to the file to be read.
 * @returns {Promise<string>} The content of the file as a string.
 * @throws {Error} If the file type is unsupported or if there is an error reading or parsing the file.
 *
 * Supported file types:
 * - `.txt`: Returns the content as plain text.
 * - `.pdf`: Extracts and returns the text content of the PDF.
 * - `.docx`: Extracts and returns the text content of the Word document.
 */
export const readFileContent = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  
  try {
    const fileBuffer = await fs.readFile(filePath);

    switch (extension) {
      case '.txt':
        return fileBuffer.toString('utf-8');

      case '.pdf':
        const pdfData = await pdf(fileBuffer);
        return pdfData.text;

      case '.docx':
        return new Promise((resolve, reject) => {
          docxParser.parseDocx(fileBuffer, (data, err) => {
            if (err) return reject(err);
            resolve(data);
          });
        });

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    logger.error(`Error reading file ${filePath}:`, error);
    throw new Error(`Could not read or parse file: ${path.basename(filePath)}`);
  }
};
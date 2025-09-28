import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs/promises';
import logger from '../logger/logger.js';
import { v4 as uuidv4 } from 'uuid';
import docxParser from 'docx-parser';

export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const uniqueId = uuidv4().slice(0, 8);
  return `${baseName}-${uniqueId}${ext}`;
};

/**
 * Membaca konten dari sebuah file berdasarkan path-nya dan mengonversinya menjadi teks.
 * Mendukung file .txt, .pdf, dan .docx.
 * @param {string} filePath - Path lengkap ke file.
 * @returns {Promise<string>} - Konten teks dari file.
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
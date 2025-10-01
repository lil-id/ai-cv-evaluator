import 'dotenv/config';
import logger from "../../utils/logger/logger.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const googleAI = new GoogleGenerativeAI(geminiApiKey);

const defaultConfig = {
    temperature: 0.2,
    topP: 1,
    topK: 32,
    maxOutputTokens: 8192,
};

/**
 * Main function to interact with Gemini, designed for JSON output.
 * 
 * @param {string} prompt - The prompt to send to the model.
 * @param {object} [configOverrides] - Options to override default configuration.
 * @returns {Promise<object>} - Parsed result from the JSON response.
 */
export const generateStructuredResponse = async (
    prompt,
    configOverrides = {}
) => {
    try {
        const model = googleAI.getGenerativeModel({
            model: "gemini-2.5-pro",
            generationConfig: { ...defaultConfig, ...configOverrides },
            responseMimeType: "application/json",
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text();

        const cleanJsonText = jsonText
            .replace(/```json\n/g, "")
            .replace(/\n```/g, "");

        return JSON.parse(cleanJsonText);
    } catch (error) {
        logger.error("Gemini API Error:", error);
        throw new Error("Failed to generate response from Gemini.");
    }
};

/**
 * Converts a text string into an embedding vector.
 * 
 * @param {string} text - The text to be embedded.
 * @returns {Promise<number[]>} - An array of numbers representing the vector.
 */
export const embedContent = async (text) => {
    try {
        const model = googleAI.getGenerativeModel({
            model: "gemini-embedding-001",
        });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        logger.error("Gemini Embedding Error:", error);
        throw new Error("Failed to create embedding.");
    }
};

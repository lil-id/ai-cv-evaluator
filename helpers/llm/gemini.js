import 'dotenv/config';
import logger from "../../utils/logger/logger.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi client sekali saja
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const googleAI = new GoogleGenerativeAI(geminiApiKey);

// Konfigurasi default yang bisa di-override
const defaultConfig = {
    temperature: 0.2,
    topP: 1,
    topK: 32,
    maxOutputTokens: 8192,
};

/**
 * Fungsi utama untuk berinteraksi dengan Gemini, dirancang untuk output JSON.
 * @param {string} prompt - Prompt yang akan dikirim ke model.
 * @param {object} [configOverrides] - Opsi untuk menimpa konfigurasi default.
 * @returns {Promise<object>} - Hasil parse dari respons JSON.
 */
export const generateStructuredResponse = async (
    prompt,
    configOverrides = {}
) => {
    try {
        const model = googleAI.getGenerativeModel({
            model: "gemini-2.5-pro",
            // Menggabungkan config default dengan override, lalu mengaktifkan JSON Mode
            generationConfig: { ...defaultConfig, ...configOverrides },
            responseMimeType: "application/json",
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text();

        // Membersihkan jika ada markdown code block di sekitar JSON
        const cleanJsonText = jsonText
            .replace(/```json\n/g, "")
            .replace(/\n```/g, "");

        return JSON.parse(cleanJsonText);
    } catch (error) {
        logger.error("Gemini API Error:", error);
        // Melempar error kembali agar bisa ditangani oleh worker (misal: retry job)
        throw new Error("Failed to generate response from Gemini.");
    }
};

/**
 * Mengubah sebuah string teks menjadi embedding vektor.
 * @param {string} text - Teks yang akan di-embed.
 * @returns {Promise<number[]>} - Array angka yang merepresentasikan vektor.
 */
export const embedContent = async (text) => {
    try {
        // Menggunakan model embedding khusus dari Google AI
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

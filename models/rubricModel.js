import fs from "fs/promises";
import pgvector from "pgvector";
import papaparse from "papaparse";
import prisma from "../helpers/db/prisma.js";
import { createId } from "@paralleldrive/cuid2";
import { embedContent } from "../helpers/llm/gemini.js";

/**
 * Asynchronously generates a rubric template in CSV format.
 *
 * This function reads default rubric data from a JSON configuration file,
 * parses it into an array of objects, and then converts the array into a CSV string.
 *
 * @async
 * @function generateRubricTemplate
 * @returns {Promise<string>} A promise that resolves to a CSV string representing the rubric template.
 * @throws {Error} If there is an issue reading the file or parsing the JSON data.
 */
export const generateRubricTemplate = async () => {
    const defaultRubricsJson = await fs.readFile(
        "config/rubrics.json",
        "utf-8"
    );
    const defaultRubrics = JSON.parse(defaultRubricsJson);
    return papaparse.unparse(defaultRubrics);
};

/**
 * Processes and saves rubric data from a CSV file buffer.
 * 
 * This function parses the CSV file, validates the data, and stores it in the database.
 * It also generates vector embeddings for each rubric and associates them with the rubrics.
 * 
 * @async
 * @function processAndSaveRubrics
 * @param {Buffer} fileBuffer - The buffer containing the CSV file data.
 * @throws {Error} Throws an error if required fields are missing in any row of the CSV file.
 * @throws {Error} Throws an error if the database transaction fails.
 * @returns {Promise<void>} Resolves when the rubrics are successfully processed and saved.
 */
export const processAndSaveRubrics = async (fileBuffer) => {
    const csvString = fileBuffer.toString("utf-8");

    const parsed = papaparse.parse(csvString, {
        header: true,
        skipEmptyLines: true,
    });
    const rubricsData = parsed.data;

    for (const [index, rubric] of rubricsData.entries()) {
        if (!rubric.parameterName || !rubric.weight || !rubric.evaluationType) {
            const error = new Error(
                `Validation failed: Missing required field in row ${index + 2}.`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    await prisma.$transaction(
        async (tx) => {
            await tx.$executeRaw`DELETE FROM rubrics`;
            await tx.$executeRaw`DELETE FROM vectorembeddings WHERE metadata->>'type' LIKE '%_evaluation'`;

            for (const rubric of rubricsData) {
                const content = `Description: ${rubric.description}. Weight: ${rubric.weight}%. Scoring Guide: ${rubric.scoringGuide}.`;
                const embeddingArray = await embedContent(content);

                const newEmbeddingId = createId();
                const newRubricId = createId();

                await tx.$executeRawUnsafe(
                    "INSERT INTO vectorembeddings (id, content, metadata, embedding) VALUES ($1, $2, $3, $4::vector)",
                    newEmbeddingId,
                    content,
                    {
                        type: `${rubric.evaluationType.toLowerCase()}_evaluation`,
                        parameter: rubric.parameterName,
                    },
                    pgvector.toSql(embeddingArray)
                );

                await tx.rubric.create({
                    data: {
                        id: newRubricId,
                        parameterName: rubric.parameterName,
                        evaluationType: rubric.evaluationType,
                        description: rubric.description,
                        weight: parseInt(rubric.weight, 10),
                        scoringGuide: rubric.scoringGuide,
                        embeddingId: newEmbeddingId,
                    },
                });
            }
        },
        {
            timeout: 10000, // Timeout in milliseconds (e.g., 10 seconds)
        }
    );
};

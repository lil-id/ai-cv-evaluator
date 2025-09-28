import prisma from "../helpers/db/prisma.js";
import { maskPII } from "../utils/file/piiUtility.js"; // Fungsi utilitas untuk anonimisasi
import { readFileContent } from "../utils/file/fileUtility.js"; // Fungsi utilitas untuk membaca file
import { generateStructuredResponse } from "../helpers/llm/gemini.js"; // Asumsi client Gemini diinisialisasi di sini
import { fetchKeyFilesFromRepo } from "../utils/github/githubUtility.js"; // Fungsi utilitas untuk mengambil file dari GitHub
import {
    createCvExtractionPrompt,
    createCvEvaluationPrompt,
    createProjectEvaluationPrompt,
} from "../utils/prompt/prompt.js"; // Fungsi untuk membuat prompt ekstraksi CV

// Placeholder untuk fungsi-fungsi AI
export const extractCvData = async (cvText) => {
    // 1. Membuat prompt yang sangat detail dengan skema yang BENAR
    const prompt = createCvExtractionPrompt(cvText);

    // 2. Memanggil Gemini untuk mendapatkan output JSON
    const extractedData = await generateStructuredResponse(prompt, {
        temperature: 0.1, // Tetap rendah untuk presisi
    });

    return extractedData;
};

export const evaluateCvMatch = async (structuredCv, jobDescription) => {
    // Langkah 1: Retrieval (Mengambil Konteks Rubrik dari Database)
    // Menggunakan query mentah untuk memfilter berdasarkan field JSONB
    const rubrics = await prisma.$queryRaw`
      SELECT content FROM vectorembeddings
      WHERE metadata->>'type' = 'cv_match_evaluation'
    `;

    if (!rubrics || rubrics.length === 0) {
        throw new Error(
            "Could not retrieve CV evaluation rubrics from the database."
        );
    }

    // Langkah 2: Augmentation (Membangun Prompt yang Komprehensif)
    const prompt = createCvEvaluationPrompt(
        structuredCv,
        jobDescription,
        rubrics
    );

    // Langkah 3: Generation (Memanggil LLM untuk Evaluasi)
    const evaluationResult = await generateStructuredResponse(prompt, {
        temperature: 0.2, // Rendah untuk penilaian yang analitis
    });

    return evaluationResult;
};

export const evaluateProject = async (
    projectReportContent,
    studyCaseBriefContent
) => {
    // Langkah 1: Retrieval (Mengambil Konteks Rubrik)
    const rubrics = await prisma.$queryRaw`
      SELECT content FROM vectorembeddings
      WHERE metadata->>'type' = 'project_deliverable_evaluation'
    `;
    if (!rubrics || rubrics.length === 0) {
        throw new Error(
            "Could not retrieve Project evaluation rubrics from the database."
        );
    }

    // Langkah 2 (Baru): Retrieval (Mengambil Konteks Kode dari GitHub)
    let codeContext = "";
    const githubUrlMatch = projectReportContent.match(/github\.com\/[^\s]+/);
    if (githubUrlMatch) {
        codeContext = await fetchKeyFilesFromRepo(githubUrlMatch[0]);
    }

    // Langkah 3: Augmentation (Membangun Prompt)
    const prompt = createProjectEvaluationPrompt(
        projectReportContent,
        studyCaseBriefContent,
        rubrics,
        codeContext
    );

    // Langkah 4: Generation (Memanggil LLM)
    const evaluationResult = await generateStructuredResponse(prompt, {
        temperature: 0.2,
    });

    return evaluationResult;
};

const refineAndVerify = async (cvEval, projectEval) => {
    /* ... Panggilan LLM ke-4 (kritikus) ... */ return {
        ...cvEval,
        ...projectEval,
        overall_summary: "...",
    };
};

export const runEvaluationPipeline = async (jobId) => {
    // Langkah 0: Ambil semua data pekerjaan dari database
    const job = await prisma.evaluationJob.findUnique({
        where: { id: jobId },
        include: {
            cvFile: true,
            projectReportFile: true,
            studyCaseBriefFile: true,
        },
    });

    if (!job) throw new Error("Job not found!");

    // Langkah 1: Baca konten dari semua file yang dibutuhkan
    const cvContent = await readFileContent(job.cvFile.storagePath);
    const projectReportContent = await readFileContent(
        job.projectReportFile.storagePath
    );
    const studyCaseBriefContent = await readFileContent(
        job.studyCaseBriefFile.storagePath
    );

    // Langkah 2: Lakukan anonimisasi PII pada konten CV
    const anonymizedCvContent = maskPII(cvContent);

    // Langkah 3: Jalankan rantai panggilan LLM (LLM Chaining)
    // Step 3a: Ekstraksi CV
    const structuredCv = await extractCvData(anonymizedCvContent);

    // Step 3b: Evaluasi Kecocokan CV (menggunakan RAG untuk rubrik CV)
    const cvEvaluation = await evaluateCvMatch(
        structuredCv,
        job.jobDescription
    );

    console.log("CV Evaluation Result:", cvEvaluation);

    // Step 3c: Evaluasi Proyek (menggunakan RAG untuk rubrik Proyek & brief)
    const projectEvaluation = await evaluateProject(
        projectReportContent,
        studyCaseBriefContent
    );

    // Step 3d: Verifikasi dan buat ringkasan final
    const finalResult = await refineAndVerify(cvEvaluation, projectEvaluation);

    // Langkah 4: Format output sesuai kontrak API
    return {
        cv_match_rate: finalResult.match_rate,
        cv_feedback: finalResult.feedback,
        project_score: finalResult.score,
        project_feedback: finalResult.feedback, // Perlu dibedakan di implementasi final
        overall_summary: finalResult.overall_summary,
    };
};

export const createCvExtractionPrompt = (cvText) => {
    const jsonSchema = `{
      "skills": ["string"],
      "experiences": [
        {
          "position": "string",
          "company": "string",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM or 'Present'",
          "responsibilities": ["string"]
        }
      ],
      "projects": [
        {
          "projectName": "string",
          "description": "string",
          "technologies": ["string"]
        }
      ]
    }`;

    return `
      Anda adalah seorang asisten rekrutmen teknis yang sangat teliti.
      Tugas Anda adalah membaca teks CV berikut dan mengekstrak informasi kunci (skills, experiences, dan projects) ke dalam format JSON yang TEPAT.
      
      ATURAN PENTING:
      1.  HANYA berikan respons dalam format JSON.
      2.  Patuhi dengan SANGAT KETAT skema JSON yang diberikan di bawah ini.
      3.  Jika sebuah informasi tidak dapat ditemukan, gunakan array kosong [].
      4.  Cari bagian "Projects" atau "Portofolio" di dalam CV untuk mengisi data proyek.
  
      Skema JSON yang harus Anda ikuti:
      ${jsonSchema}
  
      Berikut adalah teks CV yang harus Anda proses:
      ---
      ${cvText}
      ---
    `;
};

export const createCvEvaluationPrompt = (
    structuredCv,
    jobDescription,
    rubrics
) => {
    const rubricsText = rubrics.map((r) => `- ${r.content}`).join("\n");

    const jsonSchema = `{
    "evaluation_details": [
      {
        "parameter": "string (nama parameter persis dari rubrik)",
        "score": "integer (1-5)",
        "justification": "string (penjelasan singkat mengapa skor tersebut diberikan)"
      }
    ],
    "weighted_average_score": "float (skor akhir antara 1-5 setelah dihitung dengan bobot)",
    "feedback": "string (ringkasan feedback kualitatif untuk kandidat)"
  }`;

    return `
    Anda adalah seorang Manajer Perekrutan Teknis yang sangat berpengalaman dan objektif.
    Tugas Anda adalah mengevaluasi CV kandidat berdasarkan deskripsi pekerjaan dan seperangkat rubrik penilaian yang ketat.

    Berikut adalah data yang perlu Anda evaluasi:
    
    --- DESKRIPSI PEKERJAAN ---
    ${jobDescription}
    ---

    --- DATA CV KANDIDAT (dalam format JSON) ---
    ${JSON.stringify(structuredCv, null, 2)}
    ---

    --- RUBRIK PENILAIAN (WAJIB DIIKUTI) ---
    ${rubricsText}
    ---

    INSTRUKSI:
    1.  Analisis data CV kandidat dan bandingkan dengan deskripsi pekerjaan.
    2.  Untuk SETIAP parameter dalam rubrik, berikan skor dari 1 hingga 5 dan justifikasi singkat. Gunakan "Scoring Guide" di dalam setiap rubrik untuk menentukan skor.
    3.  Hitung skor rata-rata tertimbang (weighted average) berdasarkan bobot ("Weight") pada setiap parameter. Jumlahkan (skor * bobot) untuk semua parameter.
    4.  Berikan feedback ringkas dan profesional.
    5.  Kembalikan seluruh hasil Anda dalam format JSON yang valid, sesuai dengan skema berikut. JANGAN tambahkan teks lain di luar JSON.

    Skema JSON yang harus Anda ikuti:
    ${jsonSchema}
  `;
};

export const createProjectEvaluationPrompt = (
    projectReport,
    studyCaseBrief,
    rubrics,
    codeContext
) => {
    const rubricsText = rubrics.map((r) => `- ${r.content}`).join("\n");

    const jsonSchema = `{
    "evaluation_details": [
      {
        "parameter": "string",
        "score": "integer",
        "justification": "string"
      }
    ],
    "weighted_average_score": "float",
    "feedback": "string"
  }`;

    return `
    Anda adalah seorang Senior Software Engineer yang teliti dan objektif.
    Tugas Anda adalah mengevaluasi laporan proyek seorang kandidat berdasarkan brief studi kasus dan rubrik penilaian yang ketat.

    Berikut adalah data yang perlu Anda evaluasi:
    
    --- BRIEF STUDI KASUS (EKSPEKTASI) ---
    ${studyCaseBrief}
    ---

    --- LAPORAN PROYEK KANDIDAT ---
    ${projectReport}
    ---

    --- CUPLIKAN KODE DARI REPOSITORI GITHUB KANDIDAT (JIKA ADA) ---
    ${codeContext || "Kode tidak dapat diambil atau tidak tersedia."}
    ---

    --- RUBRIK PENILAIAN (WAJIB DIIKUTI) ---
    ${rubricsText}
    ---

    INSTRUKSI:
    1.  Bandingkan "LAPORAN PROYEK KANDIDAT" dengan "BRIEF STUDI KASUS".
    2.  Berikan skor (1-5) dan justifikasi untuk SETIAP parameter dalam "RUBRIK PENILAIAN".
    3.  Untuk parameter "Code Quality & Structure" dan "Resilience & Error Handling", JADIKAN "CUPLIKAN KODE" sebagai referensi utama Anda jika tersedia.
    4.  Untuk parameter "Creativity / Bonus", analisis secara spesifik bagian "Future Improvements" atau "Bonus Work" dari laporan kandidat.
    5.  Hitung skor rata-rata tertimbang berdasarkan bobot pada setiap parameter.
    6.  Kembalikan seluruh hasil dalam format JSON yang valid sesuai skema berikut. JANGAN tambahkan teks lain di luar JSON.

    Skema JSON yang harus Anda ikuti:
    ${jsonSchema}
  `;
};

export const createFinalSummaryPrompt = (longCvFeedback, longProjectFeedback) => {
  const jsonSchema = `{
    "concise_cv_feedback": "string (SATU kalimat ringkas)",
    "concise_project_feedback": "string (SATU kalimat ringkas)",
    "final_summary": "string (SATU kalimat rekomendasi akhir)"
  }`;

  return `
    Anda adalah seorang Head of Engineering yang sangat sibuk dan hanya punya waktu untuk membaca poin-poin terpenting.
    Tugas Anda adalah membaca dua paragraf feedback yang panjang dan mengubahnya menjadi tiga kalimat yang sangat singkat, padat, dan insightful.

    Berikut adalah feedback panjang yang perlu Anda ringkas:

    --- FEEDBACK EVALUASI CV (DETAIL) ---
    ${longCvFeedback}
    ---

    --- FEEDBACK EVALUASI PROYEK (DETAIL) ---
    ${longProjectFeedback}
    ---

    INSTRUKSI KETAT:
    1.  Gunakan bahasa Inggris dalam memberikan jawaban.
    2.  Buat "concise_cv_feedback": SATU kalimat dengan maksimal 10 kata yang merangkum kekuatan & kelemahan utama dari CV.
    3.  Buat "concise_project_feedback": SATU kalimat dengan maksimal 10 kata yang merangkum kekuatan & kelemahan utama dari Proyek.
    4.  Buat "final_summary": SATU kalimat yang memberikan kesimpulan dan rekomendasi akhir.
    5.  Jangan gunakan lebih dari satu kalimat untuk setiap poin.
    6.  Kembalikan HANYA dalam format JSON sesuai skema. Jangan ada teks tambahan.

    Skema JSON yang harus Anda ikuti:
    ${jsonSchema}
  `;
};

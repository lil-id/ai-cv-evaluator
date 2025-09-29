import axios from 'axios';

/**
 * Mengekstrak 'owner/repo' dari URL GitHub.
 * @param {string} url - URL lengkap repositori GitHub.
 * @returns {string|null} - String 'owner/repo' atau null jika tidak cocok.
 */
const parseGithubUrl = (url) => {
  const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
  return match ? match[1] : null;
};

/**
 * Mengambil konten dari beberapa file kunci dari repositori GitHub publik.
 * @param {string} repoUrl - URL ke repositori GitHub.
 * @returns {Promise<string>} - Gabungan konten teks dari file yang berhasil diambil.
 */
export const fetchKeyFilesFromRepo = async (repoUrl) => {
  const repoPath = parseGithubUrl(repoUrl);
  if (!repoPath) {
    console.warn("Invalid GitHub URL provided.");
    return ""; // Kembalikan string kosong jika URL tidak valid
  }

  // Daftar file kunci yang ingin kita analisis
  const filesToFetch = [
    'package.json',
    'server.js',
    'index.js',
    'src/models/pipelineCVModel.js',
    'src/controllers/evaluatationCVController.js',
  ];

  let combinedContent = '--- GITHUB CODE CONTEXT ---\n\n';

  for (const filePath of filesToFetch) {
    try {
      const apiUrl = `https://api.github.com/repos/${repoPath}/contents/${filePath}`;
      const response = await axios.get(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' } // Langsung ambil konten mentah
      });
      combinedContent += `// FILE: ${filePath}\n${response.data}\n\n---\n\n`;
    } catch (error) {
      // Abaikan jika file tidak ditemukan (404), itu wajar.
      if (error.response && error.response.status !== 404) {
        console.warn(`Could not fetch ${filePath}: ${error.message}`);
      }
    }
  }
  return combinedContent;
};
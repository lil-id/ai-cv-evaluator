import axios from 'axios';

/**
 * Extract 'owner/repo' from a GitHub URL.
 * 
 * @param {string} url - Full GitHub repository URL.
 * @returns {string|null} - 'owner/repo' string or null if not matched.
 */
const parseGithubUrl = (url) => {
  const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
  return match ? match[1] : null;
};

/**
 * Fetch content from key files in a public GitHub repository.
 * 
 * @param {string} repoUrl - URL to the GitHub repository.
 * @returns {Promise<string>} - Combined text content from successfully fetched files.
 */
export const fetchKeyFilesFromRepo = async (repoUrl) => {
  const repoPath = parseGithubUrl(repoUrl);
  if (!repoPath) {
    console.warn("Invalid GitHub URL provided.");
    return "";
  }

  const filesToFetch = [
    'package.json',
    'server.js',
    'index.js',
    'src/models/pipelineModel.js',
    'src/controllers/evaluatationController.js',
  ];

  let combinedContent = '--- GITHUB CODE CONTEXT ---\n\n';

  for (const filePath of filesToFetch) {
    try {
      const apiUrl = `https://api.github.com/repos/${repoPath}/contents/${filePath}`;
      const response = await axios.get(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      });
      combinedContent += `// FILE: ${filePath}\n${response.data}\n\n---\n\n`;
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.warn(`Could not fetch ${filePath}: ${error.message}`);
      }
    }
  }
  return combinedContent;
};
/**
 * Menyamarkan informasi pribadi (PII) seperti email dan nomor telepon dari sebuah teks.
 * @param {string} text - Teks input yang mungkin mengandung PII.
 * @returns {string} - Teks yang sudah disamarkan.
 */
export const maskPII = (text) => {
    if (!text) return '';
  
    // Pola RegEx untuk mendeteksi email
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  
    // Pola RegEx untuk mendeteksi nomor telepon (format umum internasional)
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  
    let maskedText = text.replace(emailRegex, '[EMAIL_REDACTED]');
    maskedText = maskedText.replace(phoneRegex, '[PHONE_REDACTED]');
  
    return maskedText;
  };
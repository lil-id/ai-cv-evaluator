/**
 * Masks Personally Identifiable Information (PII) such as email addresses and phone numbers
 * in the given text by replacing them with placeholder strings.
 *
 * @param {string} text - The input text that may contain PII to be masked.
 * @returns {string} - The text with email addresses replaced by "[EMAIL_REDACTED]"
 * and phone numbers replaced by "[PHONE_REDACTED]". Returns an empty string if the input is falsy.
 */
export const maskPII = (text) => {
    if (!text) return "";

    // Pola RegEx untuk mendeteksi email
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;

    // Pola RegEx untuk mendeteksi nomor telepon (format umum internasional)
    const phoneRegex =
        /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

    let maskedText = text.replace(emailRegex, "[EMAIL_REDACTED]");
    maskedText = maskedText.replace(phoneRegex, "[PHONE_REDACTED]");

    return maskedText;
};

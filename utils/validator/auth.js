import Joi from "joi";

/**
 * @description Joi validation schema for user registration.
 *
 * @property {string} name - The user's name. Must be a string with a minimum of 3 characters. **(Required)**
 * @property {string} email - The user's email address. Must be a valid email format. **(Required)**
 * @property {string} password - The user's password. Must be a string with a minimum of 8 characters. **(Required)**
 * @property {string} role - The user's role. Must be either "ADMIN" or "RECRUITER". **(Optional)**
 */
export const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters long.",
    }),
    role: Joi.string().valid("ADMIN", "RECRUITER").optional(),
});

/**
 * @description Joi validation schema for user login.
 *
 * @property {string} email - The user's email address. Must be a valid email format. **(Required)**
 * @property {string} password - The user's password. **(Required)**
 */
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

/**
 * @description Joi validation schema for refreshing an access token.
 *
 * @property {string} refreshToken - The refresh token provided to the user upon login. **(Required)**
 */
export const refreshSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters long.",
    }),
    role: Joi.string().valid("ADMIN", "RECRUITER").optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

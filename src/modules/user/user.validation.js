import Joi from "joi";

export const loginSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});

export const getUserByIdSchema = Joi.object({
  userId: Joi.number().integer().required()
});

export const uploadProfileImageSchema = Joi.object({
  folder: Joi.string().max(50).optional()
});

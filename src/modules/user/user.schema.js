import Joi from 'joi';

// Enum for allowed roles
const roles = ['PARTNER_USER', 'ADMIN', 'BANK_USER'];

export const createUserSchema = Joi.object({
  auth0Id: Joi.string()
    .required()
    .messages({
      'string.empty': 'Auth0 ID is required',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required',
    }),

  fullName: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Full name cannot be longer than 255 characters',
    }),

  picture: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Profile picture must be a valid URL',
    }),

  role: Joi.string()
    .valid(...roles)
    .default('PARTNER_USER')
    .messages({
      'any.only': `Role must be one of: ${roles.join(', ')}`,
    }),

  bankId: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.base': 'Bank ID must be a number',
      'number.integer': 'Bank ID must be an integer',
    }),
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string().max(255).optional(),
  picture: Joi.string().uri().optional(),
  role: Joi.string().valid(...roles).optional(),
  bankId: Joi.number().integer().optional(),
});

export const getUserByIdSchema = Joi.object({
  userId: Joi.number().integer().required(),
});

export const loginSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string()
      .pattern(/^auth0\|.+|^google-oauth2\|.+|^facebook\|.+/)
      .required()
      .messages({
        "string.pattern.base": "Invalid user identifier (sub).",
        "any.required": "User ID (sub) is required.",
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": "Email must be valid.",
        "any.required": "Email is required.",
      }),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional(),
    nickname: Joi.string().optional(),
    given_name: Joi.string().optional(),
    family_name: Joi.string().optional(),
    locale: Joi.string().optional(),
    email_verified: Joi.boolean().optional(),
    updated_at: Joi.date().iso().optional(),
  }).required(),
});


export const logoutSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});


export const refreshSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});

export const checkAuthSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});

export const checkAdminSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});

export const checkBankUserSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});

export const checkPartnerUserSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});

export const checkSuperAdminSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).optional(),
    picture: Joi.string().uri().optional()
  }).required()
});



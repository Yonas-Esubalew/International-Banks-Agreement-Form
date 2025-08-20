import Joi from "joi";

export const createAgreementSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().optional(),
  agreementDate: Joi.date().default(() => new Date()),
  expiryDate: Joi.date().optional(),
  status: Joi.string()
    .valid("PENDING", "ACTIVE", "EXPIRED", "REJECTED")
    .default("PENDING"),
  agreementType: Joi.string()
    .valid("LOAN", "PARTNERSHIP", "NDA", "SERVICE", "OTHER")
    .required(),
  digitalSignature: Joi.string().optional(),
  pdfFilePath: Joi.string().optional(),
  bankId: Joi.number().integer().optional(),
  createdById: Joi.number().required()
});

export const updateAgreementSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  agreementDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  status: Joi.string()
    .valid("PENDING", "ACTIVE", "EXPIRED", "REJECTED")
    .optional(),
  agreementType: Joi.string()
     .valid("LOAN", "PARTNERSHIP", "NDA", "SERVICE", "OTHER")
    .optional(),
  digitalSignature: Joi.string().optional(),
  pdfFilePath: Joi.string().optional(),
  bankId: Joi.number().integer().optional()
});

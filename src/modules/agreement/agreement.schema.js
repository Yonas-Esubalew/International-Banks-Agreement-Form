import Joi from "joi";

export const createAgreementSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().allow("", null),
  agreementDate: Joi.date().optional(), // default at DB
  expiryDate: Joi.date().greater(Joi.ref("agreementDate")).allow(null),
  status: Joi.string()
    .valid("PENDING", "ACTIVE", "EXPIRED", "CANCELLED")
    .optional(),
  agreementType: Joi.string()
    .valid(
      "COMMERCIAL",
      "MICROFINANCE",
      "COOPERATIVE",
      "INVESTMENT",
      "DEVELOPMENT",
      "CENTRAL",
      "SWIFT",
      "OTHER"
    )
    .required(),
  digitalSignature: Joi.string().allow("", null), // can be base64 or URL
  pdfFilePath: Joi.string().uri().allow("", null),
  bankIds: Joi.array().items(Joi.number().integer().positive()).default([]),
});

export const updateAgreementSchema = createAgreementSchema.fork(
  Object.keys(createAgreementSchema.describe().keys),
  (s) => s.optional()
);

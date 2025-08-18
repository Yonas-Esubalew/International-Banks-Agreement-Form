// /schemas/bank.schema.js
import Joi from "joi";

export const createBankSchema = Joi.object({
  name: Joi.string().max(255).required(),
  registrationNumber: Joi.string().max(255).optional().allow(null, ""),
  taxId: Joi.string().max(255).optional().allow(null, ""),
  contactEmail: Joi.string().email().max(255).required(),
  phone: Joi.string().max(20).optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
  city: Joi.string().max(100).optional().allow(null, ""),
  state: Joi.string().max(100).optional().allow(null, ""),
  country: Joi.string().max(100).optional().allow(null, ""),
  postalCode: Joi.string().max(20).optional().allow(null, ""),
  bankType: Joi.string().valid("MICROFINANCE", "COMMERCIAL", "INVESTMENT").optional(),
  ceoName: Joi.string().max(100).optional().allow(null, ""),
  ceoEmail: Joi.string().email().max(255).optional().allow(null, ""),
  ctoName: Joi.string().max(100).optional().allow(null, ""),
  ctoEmail: Joi.string().email().max(255).optional().allow(null, ""),
  licenseNumber: Joi.string().optional().allow(null, ""),
  branchCount: Joi.number().integer().min(0).optional(),
  isKYCCompliant: Joi.boolean().optional(),
  isAMLCompliant: Joi.boolean().optional(),
  supportedCurrencies: Joi.array().items(Joi.string()).optional(),
  swiftCode: Joi.string().max(20).optional().allow(null, ""),
  notes: Joi.string().optional().allow(null, "")
});

export const updateBankSchema = createBankSchema.fork(Object.keys(createBankSchema.describe().keys), (schema) =>
  schema.optional()
);


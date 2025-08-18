import {
  createAgreement,
  listAgreements,
  getAgreementById,
  updateAgreement,
  deleteAgreement,
  setAgreementSignatureUrl,
  setAgreementPdfUrl,
} from "../agreement/agreement.service.js";
import {
  createAgreementSchema,
  updateAgreementSchema,
} from "../agreement/agreement.schema.js";
import { prismaErrorToResponse } from "../../utils/prismaErrors.js";
import {
  cloudinaryStreamUpload,
  cloudinaryUploadBase64,
} from "../../utils/cloudinaryUpload.js";

/** CREATE */
export async function createAgreementForm(req, res) {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid request format",
        details: "Body must be a JSON object",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "❌ Authentication required" });
    }

    const { error, value } = createAgreementSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "❌ Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    const { bankIds, digitalSignature, pdfFilePath, ...rest } = value;

    // optional base64 signature upload
    let signatureUrl = null;
    if (digitalSignature && digitalSignature.startsWith("data:")) {
      const result = await cloudinaryUploadBase64({
        base64: digitalSignature,
        folder: "agreements/signatures",
        resource_type: "image",
      });
      signatureUrl = result.secure_url;
    }

    const created = await createAgreement({
      data: {
        ...rest,
        createdById: Number(userId),
        ...(signatureUrl ? { digitalSignature: signatureUrl } : {}),
        ...(pdfFilePath ? { pdfFilePath } : {}), // if you already have a url
      },
      bankIds,
    });

    return res.status(201).json({
      success: true,
      message: "✅ Agreement created successfully",
      data: created,
    });
  } catch (err) {
    console.error("❌ Create agreement error:", err);
    const { status, body } = prismaErrorToResponse(err);
    return res.status(status).json(body);
  }
}


export async function getAllAgreementForm(req, res) {
  try {
    const { q, status, type, dateFrom, dateTo, bankId, page, pageSize } =
      req.query;
    const result = await listAgreements({
      q,
      status,
      type,
      dateFrom,
      dateTo,
      bankId,
      page,
      pageSize,
    });
    return res.status(200).json({
      success: true,
      message: "✅ Agreements fetched successfully",
      ...result,
    });
  } catch (err) {
    console.error("❌ Fetch agreements error:", err);
    const { status, body } = prismaErrorToResponse(err);
    return res.status(status).json(body);
  }
}


export async function getAgreementFormById(req, res) {
  try {
    const { id } = req.params;
    const agreement = await getAgreementById(id);
    if (!agreement) {
      return res
        .status(404)
        .json({ success: false, message: "❌ Agreement not found" });
    }
    return res.status(200).json({
      success: true,
      message: "✅ Agreement fetched successfully",
      data: agreement,
    });
  } catch (err) {
    console.error("❌ Get agreement error:", err);
    const { status, body } = prismaErrorToResponse(err);
    return res.status(status).json(body);
  }
}

export async function updateAgreementForm(req, res) {
  try {
    const { id } = req.params;

    const { error, value } = updateAgreementSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "❌ Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    const { bankIds, digitalSignature, pdfFilePath, ...data } = value;

    // optional base64 signature upload on update
    let signatureUrl = undefined;
    if (digitalSignature && digitalSignature.startsWith("data:")) {
      const result = await cloudinaryUploadBase64({
        base64: digitalSignature,
        folder: "agreements/signatures",
        resource_type: "image",
      });
      signatureUrl = result.secure_url;
    }

    const updated = await updateAgreement(id, {
      data: {
        ...data,
        ...(signatureUrl ? { digitalSignature: signatureUrl } : {}),
        ...(pdfFilePath ? { pdfFilePath } : {}),
      },
      bankIds,
    });

    return res.status(200).json({
      success: true,
      message: "✅ Agreement updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Update agreement error:", err);
    const { status, body } = prismaErrorToResponse(err);
    return res.status(status).json(body);
  }
}

export async function deleteAgreementForm(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteAgreement(id);
    return res.status(200).json({
      success: true,
      message: "✅ Agreement deleted successfully",
      data: deleted,
    });
  } catch (err) {
    console.error("❌ Delete agreement error:", err);
    const { status, body } = prismaErrorToResponse(err);
    return res.status(status).json(body);
  }
}

export async function uploadAgreementSignature(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "❌ No signature file provided" });
    }
    const result = await cloudinaryStreamUpload({
      buffer: req.file.buffer,
      folder: "agreements/signatures",
      resource_type: "image",
    });

    await setAgreementSignatureUrl(id, result.secure_url);
    return res.status(200).json({
      success: true,
      message: "✅ Signature uploaded",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("❌ Upload signature error:", err);
    const { status, body } = prismaErrorToResponse(err);
    return res.status(status).json(body);
  }
}

export async function uploadAgreementPdf(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "❌ No PDF file provided" });
    }
    const result = await cloudinaryStreamUpload({
      buffer: req.file.buffer,
      folder: "agreements/pdfs",
      resource_type: "raw", // important for PDF
    });

    await setAgreementPdfUrl(id, result.secure_url);
    return res.status(200).json({
      success: true,
      message: "✅ PDF uploaded",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("❌ Upload pdf error:", err);
    const { status, body } = prismaErrorToResponse(err);
    return res.status(status).json(body);
  }
}

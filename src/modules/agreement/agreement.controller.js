// agreement.controller.js
import {
  createAgreementService,
  getAllAgreementsService,
  getAgreementByIdService,
  updateAgreementService,
  deleteAgreementService,
  getAgreementsByStatusService,
  getAgreementsByUserService,
  getAgreementsByAgreementTypeService,
  uploadAgreementFileService,
  uploadSignatureFileService,
  deleteAllAgreementsService,
} from "./agreement.service.js";

// 🔥 Centralized error handler
const handleErrors = (res, error, context) => {
  console.error(`❌ ${context} Error:`, error);

  if (error.code === "P2025") {
    return res.status(404).json({ success: false, message: "❌ Agreement not found" });
  }

  res.status(500).json({
    success: false,
    message: error.message || `❌ Unexpected error during ${context}`,
  });
};

/* 1. Create Agreement */
export async function createAgreement(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "❌ User not authenticated",
      });
    }

    const agreement = await createAgreementService(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "✅ Agreement created",
      data: agreement,
    });
  } catch (err) {
    console.error("Create Agreement Error:", err);
    res.status(500).json({
      success: false,
      message: `❌ Create Agreement Error: ${err.message}`,
    });
  }
}

/* 2. Get All Agreements */
export async function getAllAgreements(req, res) {
  try {
    const agreements = await getAllAgreementsService();
    res.json({ 
        message: "✅ Agreements fetched successfully",
        success: true, count: agreements.length, data: agreements });
  } catch (err) {
    handleErrors(res, err, "Get All Agreements");
  }
}

/* 3. Get Agreement by ID */
export async function getAgreement(req, res) {
  try {
    const agreement = await getAgreementByIdService(req.params.id);

    if (!agreement) {
      return res.status(404).json({ success: false, message: "❌ Agreement not found" });
    }

    res.json({
        message: "✅ Agreement fetched successfully by ID",
        success: true, data: agreement });
  } catch (err) {
    handleErrors(res, err, "Get Agreement");
  }
}

/* 4. Update Agreement */
export async function updateAgreement(req, res) {
  try {
    const updated = await updateAgreementService(req.params.id, req.body);
    res.json({ success: true, message: "✅ Agreement updated successfully", data: updated });
  } catch (err) {
    handleErrors(res, err, "Update Agreement");
  }
}

/* 5. Delete Agreement */
export async function deleteAgreement(req, res) {
  try {
    const deleted = await deleteAgreementService(req.params.id);
    res.json({ success: true, message: "✅ Agreement deleted successfully", data: deleted });
  } catch (err) {
    handleErrors(res, err, "Delete Agreement");
  }
}


export async function deleteAllAgreements(req, res) {
  try {
    const result = await deleteAllAgreementsService();
    res.json({
      success: true,
      message: `✅ All agreements deleted successfully (${result.count} records removed)`,
      data: result,
    });
  } catch (err) {
    handleErrors(res, err, "Delete All Agreements");
  }
}

/* 6. Get Agreements by Status */
export async function getAgreementsByStatus(req, res) {
  try {
    const agreements = await getAgreementsByStatusService(req.params.status);
    res.json({
        message: "✅ Agreements fetched successfully by Status",
        success: true, count: agreements.length, data: agreements });
  } catch (err) {
    handleErrors(res, err, "Get Agreements by Status");
  }
}

/* 7. Get Agreements by User */
export async function getAgreementsByUser(req, res) {
  try {
    const agreements = await getAgreementsByUserService(req.params.userId);
    res.json({
        message: "✅ Agreements fetched successfully by User",
        success: true, count: agreements.length, data: agreements });
  } catch (err) {
    handleErrors(res, err, "Get Agreements by User");
  }
}

export async function getAgreementsByAgreementType(req, res) {
  try {
    const agreements = await getAgreementsByAgreementTypeService(req.params.agreementType);
    res.json({ 
        message: "✅ Agreements fetched successfully by Agreement Type",
        success: true, count: agreements.length, data: agreements });
  } catch (err) {
    handleErrors(res, err, "Get Agreements by Agreement Type");
  }
} 

export const uploadAgreementFile = async (req, res) => {
  try {
    const agreementId = Number(req.params.id);
    if (!agreementId) throw new Error("Agreement ID is required");

    const file = req.file; 
    if (!file) throw new Error("Missing required parameter - file");

    const updatedAgreement = await uploadAgreementFileService(agreementId, file);

    res.status(200).json({
      success: true,
      message: "✅ File uploaded successfully to Cloudinary",
      data: updatedAgreement,
    });
    
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadSignatureFile = async (req, res) => {
  try {
    const agreementId = Number(req.params.id);

    if (!agreementId) {
      return res.status(400).json({ success: false, message: "❌ Agreement ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "❌ No signature file uploaded" });
    }

    const updatedAgreement = await uploadSignatureFileService(agreementId, req.file);

    res.status(200).json({
      success: true,
      message: "✅ Signature uploaded successfully to Cloudinary",
      data: updatedAgreement,
    });
  } catch (error) {
    console.error("❌ Upload Signature Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

import { Router } from "express";
import {
  createAgreementForm,
  getAllAgreementForm,
  getAgreementFormById,
  updateAgreementForm,
  deleteAgreementForm,
  uploadAgreementSignature,
  uploadAgreementPdf,
} from "../agreement/agreement.controller.js";
import { uploadSignature, uploadPdf } from "../../middlewares/multer.js";

// Optionally add your auth middleware here, e.g. requireAuth

const AgreementRouter = Router();

AgreementRouter.post("/", /* requireAuth, */ createAgreementForm);
AgreementRouter.get("/", /* requireAuth, */ getAllAgreementForm);
AgreementRouter.get("/:id", /* requireAuth, */ getAgreementFormById);
AgreementRouter.put("/:id", /* requireAuth, */ updateAgreementForm);
AgreementRouter.delete("/:id", /* requireAuth, */ deleteAgreementForm);

// uploads
AgreementRouter.post("/:id/signature", /* requireAuth, */ uploadSignature, uploadAgreementSignature);
AgreementRouter.post("/:id/pdf", /* requireAuth, */ uploadPdf, uploadAgreementPdf);

export default AgreementRouter;

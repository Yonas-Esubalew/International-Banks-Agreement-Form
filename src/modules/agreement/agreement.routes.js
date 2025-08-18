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

const AgreementRouter = Router();

AgreementRouter.post("/create/agreement", createAgreementForm);
AgreementRouter.get("/fetch/agreements", getAllAgreementForm);
AgreementRouter.get("/fetch/agreement/:id",  getAgreementFormById);
AgreementRouter.put("/update/agreement/:id", updateAgreementForm);
AgreementRouter.delete("/delete/agreement/:id", deleteAgreementForm);

// uploads
AgreementRouter.post("/upload/:id/signature", /* requireAuth, */ uploadSignature, uploadAgreementSignature);
AgreementRouter.post("/upload/:id/pdf", uploadPdf, uploadAgreementPdf);


export default AgreementRouter;

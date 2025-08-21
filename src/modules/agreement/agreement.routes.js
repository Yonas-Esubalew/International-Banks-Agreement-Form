// agreement.routes.js
import express from "express";
import {
  createAgreement,
  getAllAgreements,
  getAgreement,
  updateAgreement,
  deleteAgreement,
  getAgreementsByStatus,
  getAgreementsByUser,
  getAgreementsByAgreementType,
  uploadAgreementFile,
  uploadSignatureFile,
  deleteAllAgreements,
} from "./agreement.controller.js";
import { Admin, User, verifyAccessToken } from "../../middlewares/auth0.middleware.js";
import { uploadPdf, uploadSignature } from "../../middlewares/multer.js";

const AgreementRouter = express.Router();

AgreementRouter.post("/create/agreement-form", verifyAccessToken, createAgreement);          
AgreementRouter.get("/fetch/agreements", verifyAccessToken,Admin, getAllAgreements);         
AgreementRouter.get("/fetch/agreement/:id", verifyAccessToken, getAgreement);           
AgreementRouter.put("/update/agreement/:id", verifyAccessToken, User, updateAgreement);       
AgreementRouter.delete("/delete/agreement/:id", verifyAccessToken, deleteAgreement); 
AgreementRouter.delete("/delete/all/agreements", verifyAccessToken,Admin, deleteAllAgreements); 
AgreementRouter.get("/agreements/status/:status", verifyAccessToken,Admin, getAgreementsByStatus); 
AgreementRouter.get("/agreements/user/:userId", verifyAccessToken,Admin, getAgreementsByUser);    
AgreementRouter.get("/agreements/agreement-type/:agreementType", verifyAccessToken, Admin, getAgreementsByAgreementType);   
AgreementRouter.post("/upload/agreement-file/:id", verifyAccessToken ,uploadPdf, uploadAgreementFile);
AgreementRouter.post("/upload/signature-image/:id", verifyAccessToken ,uploadSignature, uploadSignatureFile);


export default AgreementRouter;

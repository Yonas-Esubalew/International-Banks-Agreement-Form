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
} from "./agreement.controller.js";
import { verifyAccessToken } from "../../middlewares/auth0.middleware.js";
import { uploadPdf, uploadSignature } from "../../middlewares/multer.js";

const AgreementRouter = express.Router();

AgreementRouter.post("/create/agreement-form", verifyAccessToken, createAgreement);          
AgreementRouter.get("/fetch/agreements", verifyAccessToken, getAllAgreements);         
AgreementRouter.get("/fetch/agreement/:id", verifyAccessToken, getAgreement);           
AgreementRouter.put("/update/agreement/:id", verifyAccessToken, updateAgreement);       
AgreementRouter.delete("/delete/agreement/:id", verifyAccessToken, deleteAgreement);     
AgreementRouter.get("/agreements/status/:status", verifyAccessToken, getAgreementsByStatus); 
AgreementRouter.get("/agreements/user/:userId", verifyAccessToken, getAgreementsByUser);    
AgreementRouter.get("/agreements/agreement-type/:agreementType", verifyAccessToken, getAgreementsByAgreementType);   
AgreementRouter.post("/upload/agreement-file/:id", verifyAccessToken ,uploadPdf, uploadAgreementFile);
AgreementRouter.post("/upload/signature-image/:id", verifyAccessToken ,uploadSignature, uploadAgreementFile);


export default AgreementRouter;

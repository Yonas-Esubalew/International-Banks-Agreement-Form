// /routes/bank.routes.js
import express from "express";
import {
  createBankInfo,
  getAllBanks,
  getBankInfoById,
  updateBankInfoById,
  removeBankInfoById,
  deleteAllBanks
} from "../bank/bank.controller.js";
import { Admin, User, verifyAccessToken } from "../../middlewares/auth0.middleware.js";

const BankRouter = express.Router();

BankRouter.post("/create/bank-information",verifyAccessToken, createBankInfo);
BankRouter.get("/fetch/banks-information", verifyAccessToken, Admin, getAllBanks);
BankRouter.get("/fetch/bank-information/:id", verifyAccessToken, getBankInfoById);
BankRouter.put("/update/bank-information/:id", verifyAccessToken,User, updateBankInfoById);
BankRouter.delete("/delete/bank-information/:id", verifyAccessToken, removeBankInfoById);
BankRouter.delete("/delete/all/banks-information", verifyAccessToken, Admin, deleteAllBanks);




export default BankRouter;



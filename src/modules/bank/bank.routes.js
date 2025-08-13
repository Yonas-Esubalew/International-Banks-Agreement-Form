// /routes/bank.routes.js
import express from "express";
import {
  createBankInfo,
  getBanks,
  getBank,
  updateBankInfo,
  removeBank
} from "../bank/bank.controller.js";

const BankRouter = express.Router();

BankRouter.post("/", createBankInfo);
BankRouter.get("/", getBanks);
BankRouter.get("/:id", getBank);
BankRouter.put("/:id", updateBankInfo);
BankRouter.delete("/:id", removeBank);

export default BankRouter;

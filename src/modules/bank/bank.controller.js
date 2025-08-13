// /controllers/bank.controller.js
import {
  createBank,
  getAllBanks,
  getBankById,
  updateBank,
  deleteBank
} from "../bank/bank.service.js";
import { createBankSchema, updateBankSchema } from "../bank/bank.schema.js";

export async function createBankInfo(req, res) {
  try {
    const { error } = createBankSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "❌ Validation error",
        errors: error.details.map((err) => err.message)
      });
    }

    const bank = await createBank(req.body);
    return res.status(201).json({
      success: true,
      message: "✅ Bank created successfully",
      data: bank
    });
  } catch (err) {
    console.error("❌ Create bank error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
}

export async function getBanks(req, res) {
  try {
    const banks = await getAllBanks();
    return res.status(200).json({
      success: true,
      message: "✅ Banks fetched successfully",
      count: banks.length,
      data: banks
    });
  } catch (err) {
    console.error("❌ Fetch banks error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
}

export async function getBank(req, res) {
  try {
    const { id } = req.params;
    const bank = await getBankById(id);
    if (!bank) {
      return res.status(404).json({ success: false, message: "❌ Bank not found" });
    }
    return res.status(200).json({
      success: true,
      message: "✅ Bank fetched successfully",
      data: bank
    });
  } catch (err) {
    console.error("❌ Get bank error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
}

export async function updateBankInfo(req, res) {
  try {
    const { id } = req.params;
    const { error } = updateBankSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "❌ Validation error",
        errors: error.details.map((err) => err.message)
      });
    }
    const bank = await updateBank(id, req.body);
    return res.status(200).json({
      success: true,
      message: "✅ Bank updated successfully",
      data: bank
    });
  } catch (err) {
    console.error("❌ Update bank error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
}

export async function removeBank(req, res) {
  try {
    const { id } = req.params;
    const bank = await deleteBank(id);
    return res.status(200).json({
      success: true,
      message: "✅ Bank deleted successfully",
      data: bank
    });
  } catch (err) {
    console.error("❌ Delete bank error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
}

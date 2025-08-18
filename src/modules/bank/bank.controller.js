// /controllers/bank.controller.js
import {
  createBank
} from "../bank/bank.service.js";
import { createBankSchema, updateBankSchema } from "../bank/bank.schema.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      message: "✅ Bank data created successfully",
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

/* -------------------- Get bank by ID -------------------- */
export async function getBankInfoById(req, res) {
  try {
    const { id } = req.params;
    const bank = await prisma.bank.findUnique({
      where: { id: Number(id) },
    });

    if (!bank) {
      return res.status(404).json({
        success: false,
        message: "❌ Bank not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Bank fetched successfully",
      data: bank,
    });
  } catch (err) {
    console.error("❌ Get bank error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

/* -------------------- Update bank -------------------- */
export async function updateBankInfoById(req, res) {
  try {
    const { id } = req.params;

    const { error } = updateBankSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "❌ Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    const updatedBank = await prisma.bank.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "✅ Bank updated successfully",
      data: updatedBank,
    });
  } catch (err) {
    console.error("❌ Update bank error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "❌ Bank not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

/* -------------------- Delete bank -------------------- */
export async function removeBankInfoById(req, res) {
  try {
    const { id } = req.params;
    const deletedBank = await prisma.bank.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "✅ Bank deleted successfully",
      data: deletedBank,
    });
  } catch (err) {
    console.error("❌ Delete bank error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "❌ Bank not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

/* -------------------- Get all banks -------------------- */
export async function getAllBanks(req, res) {
  try {
    const banks = await prisma.bank.findMany();
    return res.status(200).json({
      success: true,
      message: "✅ Banks fetched successfully",
      count: banks.length,
      data: banks,
    });
  } catch (err) {
    console.error("❌ Get all banks error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function deleteAllBanks(req, res) {
  try {
    // Deletes all bank records
    await prisma.bank.deleteMany();

    return res.json({
      message: "All banks deleted successfully",
      error: false,
      success: true
    });
  } catch (error) {
    console.error("Error deleting all banks:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete banks",
      error: true,
      success: false
    });
  }
}
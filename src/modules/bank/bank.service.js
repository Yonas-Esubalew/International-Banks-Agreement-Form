// /services/bank.service.js
import prisma from "../../config/prisma.js";

export async function createBank(data) {
  return prisma.bank.create({ data });
}

export async function getAllBanks() {
  return prisma.bank.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getBankById(id) {
  return prisma.bank.findUnique({ where: { id: Number(id) } });
}

export async function updateBank(id, data) {
  return prisma.bank.update({
    where: { id: Number(id) },
    data
  });
}

export async function deleteBank(id) {
  return prisma.bank.delete({ where: { id: Number(id) } });
}

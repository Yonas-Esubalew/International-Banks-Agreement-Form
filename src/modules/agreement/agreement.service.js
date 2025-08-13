import prisma from "../../config/prisma.js";

export async function createAgreement({ data, bankIds = [] }) {
  return prisma.agreement.create({
    data: {
      ...data,
      // connect many-to-many banks
      banks: bankIds.length ? { connect: bankIds.map((id) => ({ id })) } : undefined,
    },
    include: { banks: true, createdBy: { select: { id: true, name: true, email: true } } },
  });
}

export async function listAgreements({ q, status, type, dateFrom, dateTo, bankId, page = 1, pageSize = 20 }) {
  const where = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status } : {}),
    ...(type ? { agreementType: type } : {}),
    ...(bankId ? { banks: { some: { id: Number(bankId) } } } : {}),
    ...(dateFrom || dateTo
      ? {
          agreementDate: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
  };

  const skip = (Number(page) - 1) * Number(pageSize);
  const [data, total] = await Promise.all([
    prisma.agreement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(pageSize),
      include: { banks: true, createdBy: { select: { id: true, name: true, email: true } } },
    }),
    prisma.agreement.count({ where }),
  ]);

  return { data, total, page: Number(page), pageSize: Number(pageSize) };
}

export async function getAgreementById(id) {
  return prisma.agreement.findUnique({
    where: { id: Number(id) },
    include: { banks: true, createdBy: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateAgreement(id, { data, bankIds }) {
  return prisma.agreement.update({
    where: { id: Number(id) },
    data: {
      ...data,
      ...(Array.isArray(bankIds)
        ? {
            banks: {
              set: bankIds.map((bid) => ({ id: bid })), // replace links
            },
          }
        : {}),
    },
    include: { banks: true, createdBy: { select: { id: true, name: true, email: true } } },
  });
}

export async function deleteAgreement(id) {
  return prisma.agreement.delete({ where: { id: Number(id) } });
}

export async function setAgreementSignatureUrl(id, url) {
  return prisma.agreement.update({ where: { id: Number(id) }, data: { digitalSignature: url } });
}

export async function setAgreementPdfUrl(id, url) {
  return prisma.agreement.update({ where: { id: Number(id) }, data: { pdfFilePath: url } });
}

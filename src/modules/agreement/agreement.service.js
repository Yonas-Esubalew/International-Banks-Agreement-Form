// agreement.service.js
import prisma from "../../../prisma/prisma.js";
import cloudinary from "../../config/cloudinary.js";

export async function createAgreementService(data, userId) {
  // 1️⃣ Validate user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} does not exist`);
  }

  // 2️⃣ Validate required fields
  if (!data.title || !data.agreementDate || !data.expiryDate) {
    throw new Error("Missing required agreement fields: title, agreementDate, expiryDate");
  }

  // 3️⃣ Validate bankId if provided
  let bankConnect = undefined;
  if (data.bankId) {
    const bankIdNum = Number(data.bankId);
    if (isNaN(bankIdNum)) {
      throw new Error("Invalid bankId");
    }

    const bank = await prisma.bank.findUnique({ where: { id: bankIdNum } });
    if (!bank) {
      throw new Error(`Bank with id ${bankIdNum} does not exist`);
    }

    bankConnect = { connect: { id: bankIdNum } };
  }

  // 4️⃣ Create the agreement
  const agreement = await prisma.agreement.create({
    data: {
      title: data.title,
      description: data.description || "",
      agreementDate: new Date(data.agreementDate),
      expiryDate: new Date(data.expiryDate),
      status: data.status || "PENDING",
      agreementType: data.agreementType || "OTHER",
      digitalSignature: data.digitalSignature || "",
      pdfFilePath: data.pdfFilePath || "",
      createdBy: { connect: { id: userId } }, // ✅ taken from logged-in user
      bank: bankConnect, // ✅ single bank relation
    },
    include: {
      createdBy: true,
      bank: true,
    },
  });

  return agreement;
}

// Get all
export async function getAllAgreementsService() {
  return prisma.agreement.findMany({
    include: { bank: true, createdBy: true },
  });
}

// Get by ID
export async function getAgreementByIdService(id) {
  return prisma.agreement.findUnique({
    where: { id: Number(id) },
    include: { bank: true, createdBy: true },
  });
}

// Update
export async function updateAgreementService(id, data) {
  return prisma.agreement.update({
    where: { id: Number(id) },
    data: {
      ...data,
      bank: data.bank
        ? { set: data.bank.map(id => ({ id })) }
        : undefined,
    },
    include: { bank: true, createdBy: true },
  });
}

// Delete
export async function deleteAgreementService(id) {
  return prisma.agreement.delete({
    where: { id: Number(id) },
  });
}

// Get by Status
export async function getAgreementsByStatusService(status) {
  return prisma.agreement.findMany({
    where: { status },
    include: { bank: true, createdBy: true },
  });
}

// Get by User
export async function getAgreementsByUserService(userId) {
  return prisma.agreement.findMany({
    where: { createdById: Number(userId) },
    include: { bank: true, createdBy: true },
  });
}

export async function getAgreementsByAgreementTypeService(agreementType) {
  return prisma.agreement.findMany({
    where: { agreementType },
    include: { bank: true, createdBy: true },
  });
}


export const uploadAgreementFileService = async (agreementId, file) => {
  if (!file) throw new Error("Missing required parameter - file");

  // 1️⃣ Upload PDF to Cloudinary
  const result = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'agreements',
      resource_type: 'raw',
      public_id: file.originalname.split('.')[0], // optional: keep original name
      use_filename: true,
      unique_filename: false, // prevents Cloudinary from renaming
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
  );
  stream.end(file.buffer);
});


  // 2️⃣ Update agreement in DB
  const updatedAgreement = await prisma.agreement.update({
    where: { id: agreementId },
    data: { pdfFilePath: result.secure_url },
  });

  return updatedAgreement;
};


export const uploadSignatureFileService = async (agreementId, file) => {
  if (!file) throw new Error("Missing required parameter - file");
// upload image to cloudinary

const result = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'signatures',
      resource_type: 'image',
      public_id: file.originalname.split('.')[0], 
      use_filename: true,
      unique_filename: false, 
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
  );
  stream.end(file.buffer);
});

  // 2️⃣ Update agreement in DB
  const updatedAgreement = await prisma.agreement.update({
    where: { id: agreementId },
    data: { digitalSignature: result.secure_url },
  });

  return updatedAgreement;
};
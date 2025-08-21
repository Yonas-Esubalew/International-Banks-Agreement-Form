// agreement.service.js
import prisma from "../../../prisma/prisma.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

export async function createAgreementService(data, userId) {
  // 1️⃣ Validate user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} does not exist`);
  }

  // 2️⃣ Validate required fields
  if (!data.title || !data.agreementDate || !data.expiryDate) {
    throw new Error(
      "Missing required agreement fields: title, agreementDate, expiryDate"
    );
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
      bank: data.bank ? { set: data.bank.map((id) => ({ id })) } : undefined,
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


// Service: delete all agreements
export async function deleteAllAgreementsService() {
  return prisma.agreement.deleteMany(); // deletes all records
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
  if (!file) throw new Error("❌ Missing required parameter - file");

  // Extract filename and extension
  const originalName = file.originalname;
  const baseName = originalName.replace(/\.[^/.]+$/, ""); // remove extension
  const extension = originalName.split(".").pop().toLowerCase(); // e.g. pdf
  const publicId = `${baseName}`; // let Cloudinary handle extension

  // 1️⃣ Upload file to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "agreements",
        resource_type: "raw", // ✅ auto handles pdf correctly
        public_id: publicId, 
        format: "pdf",
        use_filename: true,
        unique_filename: false,
        overwrite: true,       // allow re-upload
      },
      (error, result) => {
        if (error) {
          return reject(
            new Error(`❌ Cloudinary upload failed: ${error.message}`)
          );
        }
        resolve(result);
      }
    );

    // send file buffer
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  // 2️⃣ Update agreement in DB
  const updatedAgreement = await prisma.agreement.update({
    where: { id: agreementId },
    data: { pdfFilePath: result.secure_url },
  });

  // 3️⃣ Return updated agreement with clean URL
  return {
    ...updatedAgreement,
    pdfFileUrl: result.secure_url,   // ✅ always ends with .pdf
    cloudinaryId: result.public_id,  // ✅ optional for delete later
    resourceType: result.resource_type,
  };
};

export const uploadSignatureFileService = async (agreementId, file) => {
  if (!file) throw new Error("❌ Missing required parameter - file");

  // 1️⃣ Upload signature image to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "signatures", // or profile_pictures, etc.
        resource_type: "image", // ✅ tell Cloudinary it’s an image
        format: "jpg", // ✅ force jpg extension
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  // 2️⃣ Update agreement record in DB with Cloudinary URL
  const updatedAgreement = await prisma.agreement.update({
    where: { id: agreementId },
    data: { digitalSignature: result.secure_url },
    include: { createdBy: true, bank: true },
  });

  return updatedAgreement;
};

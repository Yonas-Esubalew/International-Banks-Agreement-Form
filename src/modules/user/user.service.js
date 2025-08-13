import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findOrCreateUser = async (userInfo) => {
  return await prisma.user.upsert({
    where: { auth0Id: userInfo.sub },
    update: {
      email: userInfo.email,
      fullName: userInfo.name,
      picture: userInfo.picture,
      updatedAt: new Date()
    },
    create: {
      auth0Id: userInfo.sub,
      email: userInfo.email,
      fullName: userInfo.name,
      picture: userInfo.picture
    }
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, auth0Id: true, email: true, fullName: true, picture: true, role: true }
  });
};

export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true, auth0Id: true, email: true, fullName: true, picture: true, role: true }
  });
};

export const updateUserProfileImage = async (id, url) => {
  return await prisma.user.update({
    where: { id: Number(id) },
    data: { picture: url }
  });
};

export const updateUserRole = async (id, role) => {
  return await prisma.user.update({
    where: { id: Number(id) },
    data: { role }
  });
};
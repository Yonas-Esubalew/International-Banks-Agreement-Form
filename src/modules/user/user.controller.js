import chalk from "chalk";
import axios from "axios";
import { findOrCreateUser, getAllUsers, getUserById } from "../user/user.service.js";
import { loginSchema } from "./user.schema.js";
import { PrismaClient } from "@prisma/client";

 export async function authCallback (req, res) {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: "Authorization code is required" 
      });
    }

    try {
      const tokenRes = await axios.post(
        `${AUTH_CONFIG.domain}/oauth/token`,
        {
          grant_type: "authorization_code",
          client_id: AUTH_CONFIG.clientId,
          client_secret: AUTH_CONFIG.clientSecret,
          code,
          redirect_uri: AUTH_CONFIG.callbackUrl,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { access_token, id_token } = tokenRes.data;

      // Get user info
      const userInfo = await axios.get(`${AUTH_CONFIG.domain}/userinfo`, {
        headers: { 
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json"
        },
      });

      const { sub, email, name, profile_picture } = userInfo.data;

      // Create or update user
      const user = await UserModel.findOneAndUpdate(
        { auth0Id: sub },
        {
          auth0Id: sub,
          email,
          name,
          profile_picture,
          lastLogin: new Date(),
          accessToken: access_token,
          isVerified: true,
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );

      // Secure redirect with state validation
      const frontendRedirect = validateRedirectUrl(state);
      res.redirect(`${frontendRedirect}?token=${access_token}`);
      
    } catch (err) {
      console.error(chalk.red("🔥 Auth Callback Error:"), err);
      res.status(500).json({ 
        success: false, 
        message: "Authentication failed",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  }
const prisma = new PrismaClient();

export async function loginUser(req, res) {
  try {
    // 1. Validate request
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: error.details.map(d => d.message),
      });
    }

    const { user } = value;

    // 2. Check access token
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Missing access token in Authorization header",
      });
    }

    // 3. Upsert user
    const existingUser = await prisma.user.upsert({
      where: { auth0Id: user.sub },
      update: {
        email: user.email,
        fullName: user.name,
        firstName: user.given_name,
        lastName: user.family_name,
        nickname: user.nickname,
        picture: user.picture,
        accessToken: accessToken,
        isVerified: user.email_verified ?? true,
        lastLogin: new Date(),
      },
      create: {
        auth0Id: user.sub,
        email: user.email,
        fullName: user.name,
        firstName: user.given_name,
        lastName: user.family_name,
        nickname: user.nickname,
        picture: user.picture,
        accessToken: accessToken,
        isVerified: user.email_verified ?? true,
        lastLogin: new Date(),
      },
    });

    // 4. Return user
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: existingUser,
    });

  } catch (err) {
    console.error("🔥 Login Error:", err);

    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: err.message,
    });
  }
}

export async function adminGetUsers(req, res) {
  try {
    const { search = "", page = "1", limit = "20" } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { nickname: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        auth0Id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        nickname: true,
        picture: true,
        isVerified: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit, 10),
    });

    const total = await prisma.user.count({ where });

    return res.json({
      message: "Users fetched successfully",
      error: false,
      success: true,
      data: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        count: users.length,
        users,
      },
    });
  } catch (error) {
    console.error("❌ Failed to fetch users:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function adminGetUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        auth0Id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        nickname: true,
        picture: true,
        isVerified: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "❌ User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "✅ User fetched successfully",
      error: false,
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("❌ Failed to fetch user by ID:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function adminDeleteUserById(req, res) {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res.json({
      message: "✅ User deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "❌ User not found",
        error: true,
        success: false,
      });
    }
    console.error("❌ Failed to delete user:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function adminDeleteAllUsers(req, res) {
  try {
    await prisma.user.deleteMany();

    return res.json({
      message: "✅ All users deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("❌ Failed to delete all users:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

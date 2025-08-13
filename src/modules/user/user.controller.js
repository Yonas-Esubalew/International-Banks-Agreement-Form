import chalk from "chalk";
import axios from "axios";
import cloudinary from "../../config/Cloudinary.js";
import streamifier from "streamifier";
import { findOrCreateUser, getAllUsers, getUserById, updateUserProfileImage } from "../user/user.service.js";
// import { AUTH_CONFIG } from "../";
// import { validateRedirectUrl } from "../utils/validateRedirect.js";

// Auth0 Callback
export const authCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ success: false, message: "Authorization code required" });

  try {
    const tokenRes = await axios.post(`${AUTH_CONFIG.domain}/oauth/token`, {
      grant_type: "authorization_code",
      client_id: AUTH_CONFIG.clientId,
      client_secret: AUTH_CONFIG.clientSecret,
      code,
      redirect_uri: AUTH_CONFIG.callbackUrl
    }, { headers: { "Content-Type": "application/json" }});

    const { access_token } = tokenRes.data;

    const { data: userInfo } = await axios.get(`${AUTH_CONFIG.domain}/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = await findOrCreateUser(userInfo);
    const frontendRedirect = validateRedirectUrl(state);
    res.redirect(`${frontendRedirect}?token=${access_token}`);
  } catch (err) {
    console.error(chalk.red("🔥 Auth Callback Error:"), err);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { user } = req.body;
  try {
    const existingUser = await findOrCreateUser(user);
    res.status(200).json({ success: true, user: existingUser });
  } catch (err) {
    console.error(chalk.red("🔥 Login Error:"), err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Admin: Get all users
export const adminGetUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Get user by ID
export const adminGetUserById = async (req, res) => {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Upload Profile Picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No image provided" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: req.body.folder || "profile_pictures" }, (err, result) => {
        if (result) resolve(result);
        else reject(err);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const updatedUser = await updateUserProfileImage(userId, result.secure_url);
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

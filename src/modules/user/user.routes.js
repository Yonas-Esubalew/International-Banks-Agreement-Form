import express from "express";
import multer from "multer";
import { authCallback, loginUser, adminGetUsers, adminGetUserById, uploadProfilePicture } from "../user/user.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { loginSchema, getUserByIdSchema, uploadProfileImageSchema,  } from "./user.schema.js";
// import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const UserRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

UserRouter.get("/auth/callback", authCallback);
UserRouter.post("/login", validateRequest(loginSchema), loginUser);

// Admin
UserRouter.get("/admin/users", adminGetUsers);
UserRouter.get("/admin/users/:userId", validateRequest(getUserByIdSchema, "params"), adminGetUserById);

// Upload profile image
UserRouter.post("/profile/upload", upload.single("picture"), validateRequest(uploadProfileImageSchema), uploadProfilePicture);

export default UserRouter;

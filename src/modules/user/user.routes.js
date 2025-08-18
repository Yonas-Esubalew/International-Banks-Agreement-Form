import express from "express";
import { authCallback, loginUser, adminGetUsers, adminGetUserById, adminDeleteUserById, adminDeleteAllUsers } from "../user/user.controller.js";
import { Admin, verifyAccessToken } from "../../middlewares/auth0.middleware.js";

const UserRouter = express.Router();

UserRouter.get("/auth/callback", authCallback);
UserRouter.post("/user/login", loginUser);

// Protected admin route
UserRouter.get("/admin/fetch/users",Admin, verifyAccessToken, adminGetUsers);
UserRouter.get("/admin/fetch/users/:id",Admin, verifyAccessToken, adminGetUserById);
UserRouter.delete("/admin/delete/users/:id",Admin, verifyAccessToken, adminDeleteUserById);
UserRouter.delete("/admin/delete/users",Admin, verifyAccessToken, adminDeleteAllUsers);

export default UserRouter;

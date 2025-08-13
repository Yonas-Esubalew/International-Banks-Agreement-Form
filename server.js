import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import chalk from "chalk";
import prisma from "./prisma/prisma.js"; // <-- Your Prisma client import
import BankRouter from "./src/modules/bank/bank.routes.js";
import UserRouter from "./src/modules/user/user.routes.js";
import AgreementRouter from "./src/modules/agreement/agreement.routes.js";

// Configuration
dotenv.config();
const app = express();

// Constants
const AUTH_CONFIG = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  audience: process.env.AUTH0_AUDIENCE,
  callbackUrl: process.env.AUTH0_CALLBACK_URL,
};

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://*.auth0.com"],
        connectSrc: ["'self'", AUTH_CONFIG.domain],
      },
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// Routes
app.use("/api", UserRouter);
app.use("/api", AgreementRouter);
app.use("/api", BankRouter);

app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    message: "🌟 LuxeTime Auth API is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth setup
const setupAuth = () => {
  const verifyJwt = expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${AUTH_CONFIG.domain}/.well-known/jwks.json`,
    }),
    audience: AUTH_CONFIG.audience,
    issuer: AUTH_CONFIG.domain,
    algorithms: ["RS256"],
  }).unless({
    path: [
      "/",
      "/api/auth/callback",
      "/api/healthcheck",
      { url: "/api/user/login", methods: ["POST"] },
    ],
  });

  app.use(verifyJwt);
};

const validateRedirectUrl = (state) => {
  const defaultUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  try {
    if (!state) return defaultUrl;
    const decoded = decodeURIComponent(state);
    return new URL(decoded).origin === new URL(defaultUrl).origin
      ? decoded
      : defaultUrl;
  } catch {
    return defaultUrl;
  }
};

// Error handling
const setupErrorHandling = () => {
  app.use((err, req, res, next) => {
    console.error(chalk.red("❌ Server Error:"), err);

    const status = err.status || 500;
    const message = status === 500 ? "Internal Server Error" : err.message;

    res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        details: err,
      }),
    });
  });
};

// Server initialization with DB connection
const startServer = async () => {
  try {
    validateRedirectUrl();
    setupAuth();
    setupErrorHandling();

    // Connect to PostgreSQL
    await prisma.$connect();
    console.log(chalk.green("✅ Successfully connected to PostgreSQL database"));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(chalk.blue(`🚀 Server running on http://localhost:${PORT}`));
      console.log(chalk.blue(`🔒 Auth0 Domain: ${AUTH_CONFIG.domain}`));
    });
  } catch (err) {
    console.error(chalk.red("❌ Database connection failed:"), err);
    process.exit(1);
  }
};

startServer();

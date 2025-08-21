// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import chalk from "chalk";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

import prisma from "./prisma/prisma.js";
import BankRouter from "./src/modules/bank/bank.routes.js";
import UserRouter from "./src/modules/user/user.routes.js";
import AgreementRouter from "./src/modules/agreement/agreement.routes.js";
// import { sendEmail } from "./src/config/emailSendGrid.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy:
      NODE_ENV === "production"
        ? {
            useDefaults: true,
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:"],
              connectSrc: [
                "'self'",
                FRONTEND_URL,
                ...(AUTH_CONFIG.domain
                  ? [new URL(AUTH_CONFIG.domain).origin]
                  : []),
              ],
            },
          }
        : false,
  })
);

app.use("/api", UserRouter);
app.use("/api", BankRouter);
app.use("/api", AgreementRouter);

const AUTH_CONFIG = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  audience: process.env.AUTH0_AUDIENCE,
};



// --------------------- 1️⃣ Fetch Access Token ---------------------
async function getAccessToken() {
  try {
    const res = await fetch(`${AUTH_CONFIG.domain}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: AUTH_CONFIG.clientId,
        client_secret: AUTH_CONFIG.clientSecret,
        audience: AUTH_CONFIG.audience,
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Auth0 token request failed: ${res.status} - ${errText}`);
    }

    const { access_token } = await res.json();
    console.log(chalk.green("✅ Access token fetched successfully"));
    return access_token;
  } catch (err) {
    console.error(chalk.red("❌ Error fetching token:"), err.message);
    throw err;
  }
}

// --------------------- 2️⃣ Verify Token ---------------------
async function verifyToken(token) {
  try {
    const client = jwksRsa({
      jwksUri: `${AUTH_CONFIG.domain}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });

    const getKey = (header, callback) => {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    };

    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: AUTH_CONFIG.audience,
          issuer: `${AUTH_CONFIG.domain}/`,
          algorithms: ["RS256"],
        },
        (err, decoded) => {
          if (err) {
            return reject(
              new Error(`Token verification failed: ${err.message}`)
            );
          }
          console.log(chalk.blue("🔑 Token verified successfully"));
          resolve(decoded);
        }
      );
    });
  } catch (err) {
    console.error(chalk.red("❌ Error verifying token:"), err.message);
    throw err;
  }
}

(async () => {
  try {
    const token = await getAccessToken();
    const decoded = await verifyToken(token);
    console.log(chalk.gray("Decoded token payload:"), decoded);
  } catch (err) {
    console.error(chalk.red("🔥 Auth process failed:"), err);
  }
})();

const start = async () => {
  try {
    await prisma.$connect();
    console.log(chalk.yellow("✅ Connected to PostgreSQL via Prisma"));

    app.listen(port, () => {
      console.log(chalk.blue(`🚀 Server running on http://localhost:${port}`));
      console.log(chalk.green(`🌐 CORS origin: ${FRONTEND_URL}`));
    });
  } catch (e) {
    console.error(chalk.red("❌ Database connection failed:"), e);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(chalk.cyan(`\n${signal} received. Shutting down...`));
  try {
    await prisma.$disconnect();
    console.log(chalk.yellow("🔌 Prisma disconnected"));
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();

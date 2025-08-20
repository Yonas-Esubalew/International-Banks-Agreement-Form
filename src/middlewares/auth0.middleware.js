import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const accessToken = authHeader.split(" ")[1];
    console.log("🔑 Received Token:", accessToken);

    if (!accessToken || accessToken.trim() === "") {
      return res.status(401).json({ message: "Unauthorized: Empty token" });
    }

    const response = await axios.get(`https://dev-lb7ute8ee6lu4fpr.us.auth0.com/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
    });

    const auth0User = response.data;
    console.log("🔍 Auth0 User Info:", auth0User);

   // 🔒 Step 3: Normalize email
    const email = auth0User.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Auth0 did not return an email" });
    }

    // 🔒 Step 4: Check database
    let user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "❌ User not found in database" });
    }

    // Attach user info to request
    req.user = { id: user.id, email: user.email, role: user.role };
    console.log("✅ User Authenticated:", req.user);

    next();
  } catch (error) {
    console.error(
      "❌ Token verification failed:",
      error.response ? error.response.data : error
    );

    if (error.response) {
      if (error.response.status === 401) {
        return res.status(401).json({ message: "Invalid or expired token", success: false });
      }
      if (error.response.status === 400) {
        return res.status(400).json({ message: "Bad request: Token might be malformed", success: false });
      }
    }

    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// ✅ Admin role middleware
export const Admin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admins only", success: false });
  }
  next();
};

// ✅ User role middleware
export const User = (req, res, next) => {
  if (req.user?.role !== "PARTNER_USER") {
    return res.status(403).json({ message: "Forbidden: for Users Only", success: false });
  }
  next();
};


/* ✅ Agreement Status Guard */
export const PendingAgreement = async (req, res, next) => {
  try {
    const { id } = req.params; // expect :id in route
    if (!id) {
      return res.status(400).json({
        message: "Agreement ID required in request params",
        success: false,
      });
    }

    const agreement = await prisma.agreement.findUnique({
      where: { id: Number(id) },
    });

    if (!agreement) {
      return res.status(404).json({
        message: "❌ Agreement not found",
        success: false,
      });
    }

    if (agreement.status !== "PENDING") {
      return res.status(403).json({
        message: "❌ Forbidden: Agreement is not in PENDING status",
        success: false,
      });
    }

    // attach to req if needed later
    req.agreement = agreement;
    console.log("✅ Agreement is pending:", agreement.id);

    next();
  } catch (err) {
    console.error("❌ PendingAgreement Middleware Error:", err);
    res.status(500).json({
      message: "Internal Server Error in Agreement Middleware",
      success: false,
    });
  }
};
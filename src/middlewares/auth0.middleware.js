import axios from "axios";
// i hava shema use prisma make by this code

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

    const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json"  
      },
    });

    const auth0User = response.data; 

    console.log("🔍 Auth0 User Info:", auth0User);

    const user = await UserModel.findOne({ email: auth0User.email });

    if (!user) {
      return res.status(404).json({ message: "❌ User not found in database" });
    }

    req.user = {
      id: user._id,  
      email: user.email,
      role: user.role 
    };

    console.log("✅ User Authenticated:", req.user);

    next();  
  } catch (error) {
    console.error("❌ Token verification failed:", error.response ? error.response.data : error);

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

export const Admin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admins only", success: false });
  }
  next();
};

// user role middleware
export const User = (req,res,next)=>{
  if(req.user?.role!== "USER"){
    return res.status(403).json({message: "Forbidden: for Users Only", success: false})
  }
  next()
}
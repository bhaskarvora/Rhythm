// import { NextFunction, Request, Response } from "express";
// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// interface IUser {
//   _id: string;
//   name: string;
//   email: string;
//   password: string;
//   role: string;
//   playlist: string[];
// }

// interface AuthenticatedRequest extends Request {
//   user?: IUser | null;
// }

// export const isAuth = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const token = req.headers.token as string;

//     if (!token) {
//       res.status(403).json({
//         message: "Please Login",
//       });
//       return;
//     }

//     const { data } = await axios.get(`${process.env.User_URL}/api/v1/user/me`, {
//       headers: {
//         token,
//       },
//     });

//     req.user = data;

//     next();
//   } catch (error) {
//     res.status(403).json({
//       message: "Please Login",
//     });
//   }
// };

// //multer setup
// import multer from "multer";

// const storage = multer.memoryStorage();

// const uploadFile = multer({ storage }).single("file");

// export default uploadFile;




import { NextFunction, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

/** ───────────────────────────────
 * Interface Definitions
 * ─────────────────────────────── */
interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  playlist: string[];
}

interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

/** ───────────────────────────────
 * Authentication Middleware
 * ─────────────────────────────── */
export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.token as string;
    console.log("🪪 Incoming token:", token);

    if (!token) {
      console.log("❌ No token found in headers");
      res.status(403).json({ message: "Please Login" });
      return;
    }

    const verifyUrl = `${process.env.User_URL}/api/v1/user/me`;
    console.log("🔗 Verifying token with:", verifyUrl);

    const { data } = await axios.get(verifyUrl, {
      headers: { token },
    });

    console.log("✅ Verified user from user-service:", data);

    req.user = data;
    next();
  } catch (error: any) {
    console.error("❌ Auth verification failed:", error.message);
    res.status(403).json({ message: "Please Login" });
  }
};

/** ───────────────────────────────
 * Multer Setup (for File Uploads)
 * ─────────────────────────────── */
const storage = multer.memoryStorage();
const uploadFile = multer({ storage }).single("file");

export default uploadFile;

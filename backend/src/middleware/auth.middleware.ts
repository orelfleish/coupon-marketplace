import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../services/coupon.service";

declare global {
  namespace Express {
    interface Request {
      reseller?: any;
    }
  }
}

export const resellerAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      error_code: "UNAUTHORIZED",
      message: "Missing or invalid authorization header",
    });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret);
    req.reseller = payload;
    next();
  } catch {
    res.status(401).json({
      error_code: "UNAUTHORIZED",
      message: "Token is invalid or expired",
    });
  }
};

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers["x-admin-key"];

  if (!key || key !== process.env.ADMIN_API_KEY) {
    res.status(401).json({
      error_code: "UNAUTHORIZED",
      message: "Invalid admin key",
    });
    return;
  }

  next();
};
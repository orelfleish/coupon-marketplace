import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// Temporary token generator for testing
// In a real app this would verify reseller credentials from DB
router.post("/auth/token", (req: Request, res: Response) => {
  const { secret } = req.body;

  // Only generate a token if they know the reseller secret
  if (secret !== process.env.RESELLER_SECRET) {
    res.status(401).json({
      error_code: "UNAUTHORIZED",
      message: "Invalid secret",
    });
    return;
  }

  const token = jwt.sign(
    { role: "RESELLER" },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );

  res.json({ token });
});

export default router;

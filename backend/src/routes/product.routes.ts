import { Router } from "express";
import { resellerAuth, adminAuth } from "../middleware/auth.middleware";
import {
  adminGetAll,
  adminCreate,
  adminUpdate,
  adminDelete,
  resellerGetAll,
  resellerGetById,
  resellerPurchase,
  customerGetAll,
  customerPurchase,
} from "../controllers/coupon.controller";

const router = Router();

// ─── ADMIN ROUTES ─────────────────────────────────────────
// Protected by adminAuth middleware (x-admin-key header)

router.get("/admin/products",        adminAuth, adminGetAll);
router.post("/admin/products",       adminAuth, adminCreate);
router.put("/admin/products/:id",    adminAuth, adminUpdate);
router.delete("/admin/products/:id", adminAuth, adminDelete);

// ─── RESELLER ROUTES ──────────────────────────────────────
// Protected by resellerAuth middleware (Bearer token)

router.get("/products",                        resellerAuth, resellerGetAll);
router.get("/products/:productId",             resellerAuth, resellerGetById);
router.post("/products/:productId/purchase",   resellerAuth, resellerPurchase);

// ─── CUSTOMER ROUTES ──────────────────────────────────────
// Public — no auth needed

router.get("/customer/products",                      customerGetAll);
router.post("/customer/products/:productId/purchase", customerPurchase);

export default router;
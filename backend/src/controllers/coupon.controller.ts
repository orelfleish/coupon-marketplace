import { Request, Response } from "express";
import { couponService, AppError } from "../services/coupon.service";

const handleError = (res: Response, err: unknown) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error_code: err.error_code,
      message: err.message,
    });
  } else {
    console.error("UNEXPECTED ERROR:", err);
    res.status(500).json({
      error_code: "INTERNAL_ERROR",
      message: "Something went wrong",
    });
  }
};

// ─── ADMIN ───────────────────────────────────────────────

export const adminGetAll = async (_req: Request, res: Response) => {
  try {
    const products = await couponService.getAllForAdmin();
    res.json(products);
  } catch (err) {
    handleError(res, err);
  }
};

export const adminCreate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      image_url,
      cost_price,
      margin_percentage,
      value_type,
      value,
    } = req.body;

    if (!name || !image_url || cost_price == null || margin_percentage == null || !value_type || !value) {
      res.status(400).json({
        error_code: "MISSING_FIELDS",
        message: "name, image_url, cost_price, margin_percentage, value_type and value are required",
      });
      return;
    }

    const product = await couponService.createCoupon({
      name,
      description,
      image_url,
      cost_price: Number(cost_price),
      margin_percentage: Number(margin_percentage),
      value_type,
      value,
    });

    res.status(201).json(product);
  } catch (err) {
    handleError(res, err);
  }
};

export const adminUpdate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await couponService.updateCoupon(id, req.body);
    res.json(product);
  } catch (err) {
    handleError(res, err);
  }
};

export const adminDelete = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await couponService.deleteCoupon(id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

// ─── RESELLER ────────────────────────────────────────────

export const resellerGetAll = async (_req: Request, res: Response) => {
  try {
    const products = await couponService.getAvailableProducts();
    res.json(products);
  } catch (err) {
    handleError(res, err);
  }
};

export const resellerGetById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const product = await couponService.getProductById(productId);
    res.json(product);
  } catch (err) {
    handleError(res, err);
  }
};

export const resellerPurchase = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const { reseller_price } = req.body;

    if (reseller_price == null) {
      res.status(400).json({
        error_code: "MISSING_FIELDS",
        message: "reseller_price is required",
      });
      return;
    }

    const result = await couponService.resellerPurchase(productId, Number(reseller_price));
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

// ─── CUSTOMER ────────────────────────────────────────────

export const customerGetAll = async (_req: Request, res: Response) => {
  try {
    const products = await couponService.getAvailableProducts();
    res.json(products);
  } catch (err) {
    handleError(res, err);
  }
};

export const customerPurchase = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const result = await couponService.customerPurchase(productId);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};
import { productRepository } from "../repositories/product.repository";

// This is our standard error class
// It carries an error_code (for the API response) and an HTTP status
export class AppError extends Error {
  constructor(
    public error_code: string,
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export const couponService = {

  // ─── ADMIN ───────────────────────────────────────────────

  async createCoupon(data: {
    name: string;
    description?: string;
    image_url: string;
    cost_price: number;
    margin_percentage: number;
    value_type: "STRING" | "IMAGE";
    value: string;
  }) {
    // THIS is where minimum_sell_price is computed — never from the client
    const minimum_sell_price =
      data.cost_price * (1 + data.margin_percentage / 100);

    return productRepository.create({
      ...data,
      minimum_sell_price,
    });
  },

  async getAllForAdmin() {
    return productRepository.findAllForAdmin();
  },

  async updateCoupon(id: string, data: {
    name?: string;
    description?: string;
    image_url?: string;
    cost_price?: number;
    margin_percentage?: number;
    value_type?: "STRING" | "IMAGE";
    value?: string;
  }) {
    // If price fields are being updated, recompute minimum_sell_price
    const product = await productRepository.findById(id);
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", 404, "Product not found");

    const currentCoupon = product.coupon!;
    const newCostPrice = data.cost_price ?? currentCoupon.cost_price;
    const newMargin = data.margin_percentage ?? currentCoupon.margin_percentage;
    const minimum_sell_price = newCostPrice * (1 + newMargin / 100);

    return productRepository.update(id, { ...data, minimum_sell_price });
  },

  async deleteCoupon(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", 404, "Product not found");

    return productRepository.delete(id);
  },

  // ─── RESELLER ────────────────────────────────────────────

  async getAvailableProducts() {
    const products = await productRepository.findAllUnsold();

    // Shape the response — clean format, no sensitive fields
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image_url: p.image_url,
      price: p.coupon?.minimum_sell_price,
    }));
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", 404, "Product not found");
    if (product.coupon?.is_sold) throw new AppError("PRODUCT_ALREADY_SOLD", 409, "Product already sold");

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      price: product.coupon?.minimum_sell_price,
    };
  },

  async resellerPurchase(productId: string, reseller_price: number) {
    // Step 1 — does it exist?
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", 404, "Product not found");

    // Step 2 — is it still available?
    if (product.coupon?.is_sold) throw new AppError("PRODUCT_ALREADY_SOLD", 409, "Product already sold");

    // Step 3 — is the reseller price high enough?
    const minimum = product.coupon!.minimum_sell_price;
    if (reseller_price < minimum) {
      throw new AppError(
        "RESELLER_PRICE_TOO_LOW",
        400,
        `Reseller price must be at least ${minimum}`
      );
    }

    // Step 4 — atomically mark as sold
    const result = await productRepository.atomicMarkSold(productId);
    if (result.count === 0) {
      // Someone else bought it between our check and our update
      throw new AppError("PRODUCT_ALREADY_SOLD", 409, "Product already sold");
    }

    // Step 5 — return the coupon value (only revealed after purchase)
    return {
      product_id: productId,
      final_price: reseller_price,
      value_type: product.coupon!.value_type,
      value: product.coupon!.value,
    };
  },

  // ─── CUSTOMER ────────────────────────────────────────────

  async customerPurchase(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", 404, "Product not found");
    if (product.coupon?.is_sold) throw new AppError("PRODUCT_ALREADY_SOLD", 409, "Product already sold");

    const result = await productRepository.atomicMarkSold(productId);
    if (result.count === 0) {
      throw new AppError("PRODUCT_ALREADY_SOLD", 409, "Product already sold");
    }

    return {
      product_id: productId,
      final_price: product.coupon!.minimum_sell_price,
      value_type: product.coupon!.value_type,
      value: product.coupon!.value,
    };
  },
};
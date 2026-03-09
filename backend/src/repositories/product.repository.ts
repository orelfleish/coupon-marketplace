import prisma from "../prisma";

export const productRepository = {

  // Create a full product + coupon in one atomic operation
  async create(data: {
    name: string;
    description?: string;
    image_url: string;
    cost_price: number;
    margin_percentage: number;
    minimum_sell_price: number;
    value_type: "STRING" | "IMAGE";
    value: string;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        coupon: {
          create: {
            cost_price: data.cost_price,
            margin_percentage: data.margin_percentage,
            minimum_sell_price: data.minimum_sell_price,
            value_type: data.value_type,
            value: data.value,
          },
        },
      },
      include: { coupon: true },
    });
  },

  // Get all unsold products (for resellers and customers)
  // Notice: we never return cost_price or margin_percentage here
  async findAllUnsold() {
    return prisma.product.findMany({
      where: { coupon: { is_sold: false } },
      select: {
        id: true,
        name: true,
        description: true,
        image_url: true,
        coupon: {
          select: {
            minimum_sell_price: true,
          },
        },
      },
    });
  },

  // Get one product by ID (unsold only)
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { coupon: true },
    });
  },

  // Get all products for admin (includes cost_price, margin etc.)
  async findAllForAdmin() {
    return prisma.product.findMany({
      include: { coupon: true },
    });
  },

  // Atomically mark a coupon as sold
  // The key trick: we only update if is_sold is still false
  // This prevents two people buying the same coupon at the same time
  async atomicMarkSold(productId: string) {
    return prisma.coupon.updateMany({
      where: {
        productId: productId,
        is_sold: false,
      },
      data: {
        is_sold: true,
        sold_at: new Date(),
      },
    });
  },

  // Update a product (admin only)
  async update(id: string, data: {
    name?: string;
    description?: string;
    image_url?: string;
    cost_price?: number;
    margin_percentage?: number;
    minimum_sell_price?: number;
    value_type?: "STRING" | "IMAGE";
    value?: string;
  }) {
    const { name, description, image_url, ...couponData } = data;
    return prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(image_url && { image_url }),
        coupon: {
          update: { ...couponData },
        },
      },
      include: { coupon: true },
    });
  },

  // Delete a product and its coupon
  async delete(id: string) {
    await prisma.coupon.deleteMany({ where: { productId: id } });
    return prisma.product.delete({ where: { id } });
  },
};
# Digital Coupon Marketplace — Backend

A backend system for a digital coupon marketplace supporting two selling channels: direct customers and external resellers via REST API.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: MongoDB
- **ORM**: Prisma
- **Auth**: JWT (resellers) + API Key (admin)
- **Infrastructure**: Docker + docker-compose

## Project Structure
```
src/
├── controllers/     # Route handlers
├── services/        # Business logic
├── repositories/    # Database access
├── routes/          # Express routers
├── middleware/       # Auth middleware
└── index.ts         # Entry point
```

## Getting Started

### Prerequisites
- Docker Desktop installed and running

### Run the project

1. Clone the repository
2. Navigate to the project root:
```bash
cd coupon-marketplace
```

3. Start everything with Docker:
```bash
docker-compose up --build
```

4. Open your browser at `http://localhost:3000`

That's it — no need to install Node.js or MongoDB locally.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| DATABASE_URL | MongoDB connection string | mongodb://mongo:27017/coupon_marketplace |
| PORT | Server port | 3000 |
| JWT_SECRET | Secret for signing JWT tokens | - |
| ADMIN_API_KEY | Admin authentication key | - |
| RESELLER_SECRET | Secret for generating reseller tokens | - |

> ⚠️ Never commit your `.env` file. Use `.env.example` as a template.

## API Overview

### Admin API (x-admin-key header required)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/admin/products | List all products |
| POST | /api/v1/admin/products | Create a coupon |
| PUT | /api/v1/admin/products/:id | Update a coupon |
| DELETE | /api/v1/admin/products/:id | Delete a coupon |

### Reseller API (Bearer token required)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/token | Get a reseller token |
| GET | /api/v1/products | List available products |
| GET | /api/v1/products/:id | Get product by ID |
| POST | /api/v1/products/:id/purchase | Purchase a product |

### Customer API (public)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/customer/products | List available products |
| POST | /api/v1/customer/products/:id/purchase | Purchase a product |

## Pricing Logic
```
minimum_sell_price = cost_price × (1 + margin_percentage / 100)
```

- Computed server-side only — never accepted from client input
- Reseller price must be ≥ minimum_sell_price
- Customer always pays exactly minimum_sell_price

## Frontend

A minimal frontend is served at `http://localhost:3000`:
- **Customer mode** — browse and purchase available coupons
- **Admin mode** — create, view, and delete coupons

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import productRoutes from "./routes/product.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
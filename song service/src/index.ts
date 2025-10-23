import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "redis";
import songRoutes from "./route.js";

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

await redisClient.connect();
console.log("✅ Connected to Redis. PING =", await redisClient.ping());

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", songRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`🚀 server is running on ${port}`);
});

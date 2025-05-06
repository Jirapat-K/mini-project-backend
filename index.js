import express from "express"
import helmet from "helmet";
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { connectMongo } from "./config/mongo.js";
import { connectTurso, db } from "./config/turso.js";
import { createClient } from "@libsql/client"
import apiRoutes from "./api/v1/routes.js"
import limiter from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";

dotenv.config()

const app = express()

const PORT = process.env.PORT


// Global middlewares
app.use(helmet());
const corsOptions = {
  origin: "http://localhost:5173",// your frontend domain
  credentials: true, // ✅ allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

// Centralized error handling
app.use(errorHandler);



app.use("/", apiRoutes(db));

(async () => {
  try {
    await connectMongo();
    await connectTurso();
    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT} ✅`);
    });
  } catch (error) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();

// app.listen(PORT, () => {
//   console.log(`server running on http://localhost:${PORT} ✅`);
// });

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  process.exit(1);
});



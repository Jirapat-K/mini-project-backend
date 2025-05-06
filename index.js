import express from "express"
import helmet from "helmet";
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
// import { connectMongo } from "./config/mongo.js";
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

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

//Initialize the tables (users, notes)
(async () => {
  /// Connect to MongoDB via Mongoose
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo database ✅");
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }

  // Ping Turso
  try {
    await db.execute("SELECT 1");
    console.log("Checked successful communication with Turso database ✅");
  } catch (err) {
    console.error("❌ Failed to connect to Turso:", err);
    process.exit(1);
  }



  /// Intialize Turso tables (users, notes)
  await db.execute(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT, --JSON-encoded array of strings
        is_pinned INTEGER DEFAULT 0, -- 0 = false, 1 = true
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updateed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER
      );
      `);

  await db.execute(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
    `);

})();

app.use("/", apiRoutes(db));

// (async () => {
//   try {
//     await connectMongo();
//     app.listen(PORT, () => {
//       console.log(`server running on http://localhost:${PORT} ✅`);
//     });
//   } catch (error) {
//     console.error("❌ Startup error:", err);
//     process.exit(1);
//   }
// })();

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT} ✅`);
});

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  process.exit(1);
});



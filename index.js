import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

import userRoutes from "./routes/user.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import schemesRoutes from "./routes/schemes.routes.js";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export { pool };

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/user", userRoutes);
app.use("/quiz", quizRoutes);
app.use("/habit", habitRoutes);
app.use("/schemes", schemesRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Mitra Learning Backend is running 🚀");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

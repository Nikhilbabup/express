import express from "express";
import { connectDB } from "./utils/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

dotenv.config();

// connectDB();

const PORT = process.env.PORT || 5000;

const app = express();
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//   })
// );
// app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

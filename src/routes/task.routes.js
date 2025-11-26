import express from "express";
import {
  createTask,
  getTasks,
  taskPerUser,
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, createTask);

router.get("/task", protect, getTasks);

router.get("/user-tasks", protect, taskPerUser);

export default router;

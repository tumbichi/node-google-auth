import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controllers";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.post("/users", createUser);

router.get("/users", authMiddleware, getUsers);

router.put("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);

router.get("/users/:id", getUser);

export default router;

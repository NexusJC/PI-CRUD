import { Router } from "express";
import { getUsers, login, register } from "../controllers/auth.controller.js";

const router = Router();

router.get("/users", getUsers);
router.post("/login", login);
router.post("/register", register);

export default router;

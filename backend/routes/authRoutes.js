import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { updateProfile, getProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", authMiddleware, updateProfile);
router.get("/profile", authMiddleware, getProfile);


export default router;

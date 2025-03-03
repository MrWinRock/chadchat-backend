import express from "express";
import {
  verifyToken,
  register,
  login,
  logout,
  unregister,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-token", verifyToken);
router.delete("/unregister", unregister);

export default router;

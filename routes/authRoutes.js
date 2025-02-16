import express from "express";
import {
  verifyToken,
  register,
  login,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello from authRoutes!");
});
router.get("/verify-token", verifyToken);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;

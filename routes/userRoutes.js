import express from "express";
import {
  getUsername,
  getEmail,
  getPhone,
  getUserInfo,
  updatePassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/username", getUsername);
router.get("/email", getEmail);
router.get("/phone", getPhone);
router.get("/info/:userId", getUserInfo);
router.post("/update-password", updatePassword);

export default router;

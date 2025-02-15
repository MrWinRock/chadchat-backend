import express from "express";
import {
  getUsername,
  getEmail,
  getPhone,
  updatePassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/username", getUsername);
router.get("/email", getEmail);
router.get("/phone", getPhone);
router.post("/update-password", updatePassword);

export default router;

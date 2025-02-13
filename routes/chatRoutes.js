import express from "express";
import { getChatList } from "../controllers/chatController.js";

const router = express.Router();

router.get("/chat-list", getChatList);

export default router;

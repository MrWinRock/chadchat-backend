import express from "express";
import {
  getChatList,
  sendMessage,
  getMessagesByChatId,
  createChat,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/chat-list/:username", getChatList);
router.get("/messages/:chatId", getMessagesByChatId);
router.post("/send-message/:chatId", sendMessage);
router.post("/create-chat", createChat);
router.delete("/delete-chat", deleteChat);

export default router;

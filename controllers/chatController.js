import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import { client } from "../server.js"; // Import the connected MongoDB client

dotenv.config();

export const getChatList = async (req, res) => {
  const { username } = req.params;

  try {
    const database = client.db("chadchat");
    const chats = database.collection("chats");
    const messages = database.collection("messages");

    const chatList = await chats
      .aggregate([
        { $match: { participants: username } },
        {
          $lookup: {
            from: "messages",
            let: { chatId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$chatId", "$$chatId"] } } },
              { $sort: { timestamp: -1 } },
              { $limit: 1 },
            ],
            as: "lastMessage",
          },
        },
        {
          $project: {
            chatId: "$_id",
            receiver: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$participants",
                    as: "participant",
                    cond: { $ne: ["$$participant", username] },
                  },
                },
                0,
              ],
            },
            lastMessage: { $arrayElemAt: ["$lastMessage.message", 0] },
            timestamp: { $arrayElemAt: ["$lastMessage.timestamp", 0] },
          },
        },
      ])
      .toArray();
    res.json(chatList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { chatId, sender, receiver, message } = req.body;
  console.log("Sending message:", req.body);

  try {
    const database = client.db("chadchat");
    const messages = database.collection("messages");

    const chatMessage = {
      chatId: new ObjectId(chatId),
      participants: [sender, receiver],
      sender,
      message,
      timestamp: new Date(),
    };

    const result = await messages.insertOne(chatMessage);
    console.log("Message inserted:", result);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error inserting message:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  try {
    const database = client.db("chadchat");
    const messages = database.collection("messages");

    const chatMessages = await messages
      .find({ chatId: new ObjectId(chatId) })
      .toArray();

    res.json(chatMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createChat = async (req, res) => {
  const { participants } = req.body;

  try {
    const database = client.db("chadchat");
    const chats = database.collection("chats");

    const existingChat = await chats.findOne({
      $or: [
        { participants: [participants[0], participants[1]] },
        { participants: [participants[1], participants[0]] },
      ],
    });

    if (existingChat) {
      return res.status(200).json({ chatId: existingChat._id });
    }

    const chat = {
      participants,
      createdAt: new Date(),
    };

    const result = await chats.insertOne(chat);
    res.status(201).json({ chatId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

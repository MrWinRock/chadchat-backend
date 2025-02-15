import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const getChatList = async (req, res) => {
  const { username } = req.params;

  try {
    await client.connect();
    const database = client.db("chadchat");
    const chats = database.collection("chats");

    const chatList = await chats
      .aggregate([
        { $match: { participants: username } },
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
            timestamp: "$createdAt",
          },
        },
      ])
      .toArray();
    res.json(chatList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const sendMessage = async (req, res) => {
  const { chatId, sender, receiver, message } = req.body;

  try {
    await client.connect();
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
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  try {
    await client.connect();
    const database = client.db("chadchat");
    const messages = database.collection("messages");

    const chatMessages = await messages
      .find({ chatId: new ObjectId(chatId) })
      .toArray();

    res.json(chatMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const createChat = async (req, res) => {
  const { participants } = req.body;

  try {
    await client.connect();
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
  } finally {
    await client.close();
  }
};

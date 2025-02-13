import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const getChatList = async (req, res) => {
  try {
    await client.connect();
    const database = client.db("chadchat");
    const chats = database.collection("chats");

    const chatList = await chats.find({}).toArray();
    res.json(chatList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

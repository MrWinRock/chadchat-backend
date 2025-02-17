import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("privateMessage", async (data) => {
      const { chatId, sender, receiver, message } = data;

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
        io.to(receiver).emit("receiveMessage", chatMessage);
      } catch (error) {
        console.error(error);
      } finally {
        await client.close();
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

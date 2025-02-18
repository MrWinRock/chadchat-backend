import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
      console.log(`User left chat: ${chatId}`);
    });

    socket.on("privateMessage", async (data) => {
      console.log("privateMessage event received");
      const { chatId, sender, receiver, message } = data;
      console.log("Received message data:", data);

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
        console.log("Message inserted:", result);
        io.to(chatId).emit("receiveMessage", chatMessage);
      } catch (error) {
        console.error("Error inserting message:", error);
      } finally {
        await client.close();
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

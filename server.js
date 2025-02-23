import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import {
  verifyToken,
  register,
  login,
  logout,
} from "./controllers/authController.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { handleSocketConnection } from "./socket/chatSocket.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.MONGODB_URI;
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToMongoDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  }
}

connectToMongoDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

// Example of a protected route
app.get("/api/protected-route", verifyToken, (req, res) => {
  res
    .status(200)
    .json({ message: "This is a protected route", userId: req.userId });
});

// Socket.io connection
handleSocketConnection(io);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

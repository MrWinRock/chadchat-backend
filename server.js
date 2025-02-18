import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// Endpoint to verify token
app.get("/api/auth/verify-token", verifyToken);

// Other endpoints
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

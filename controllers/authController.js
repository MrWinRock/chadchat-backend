import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { client } from "../server.js"; // Import the connected MongoDB client

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Failed to authenticate token" });
    }
    req.userId = decoded.userId;
    res.status(200).json({ message: "Token is valid", userId: req.userId });
  });
};

export const register = async (req, res) => {
  const { username, email, password, phone } = req.body;
  console.log("Received registration data:", req.body);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const database = client.db("chadchat");
    const users = database.collection("users");

    const existingUser = await users.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      console.log("Username or email already exists:", existingUser);
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const user = {
      _id: new ObjectId(),
      username,
      email,
      passwordHash: hashedPassword,
      phone,
      status: "offline",
      lastLogin: null,
      groupIds: [],
    };

    const result = await users.insertOne(user);
    console.log("User registered successfully:", result);
    res.status(201).json({ userId: result.insertedId });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const database = client.db("chadchat");
    const users = database.collection("users");

    const user = await users.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    await users.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date(), status: "online" } }
    );

    res.json({ token, userId: user._id.toString() }); // Ensure userId is a string
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  const { userId } = req.body;

  try {
    const database = client.db("chadchat");
    const users = database.collection("users");

    const objectId = new ObjectId(userId);

    const result = await users.updateOne(
      { _id: objectId },
      { $set: { status: "offline" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

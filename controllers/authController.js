import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const register = async (req, res) => {
  const { username, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.connect();
    const database = client.db("chadchat");
    const users = database.collection("users");

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
    res.status(201).json({ userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    await client.connect();
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

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const logout = async (req, res) => {
  const { userId } = req.body;

  try {
    await client.connect();
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
  } finally {
    await client.close();
  }
};

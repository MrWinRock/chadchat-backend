import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const getUsername = async (req, res) => {
  const { userId } = req.body;

  try {
    await client.connect();
    const database = client.db("chadchat");
    const users = database.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1 } }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const getEmail = async (req, res) => {
  const { userId } = req.body;

  try {
    await client.connect();
    const database = client.db("chadchat");
    const users = database.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { email: 1 } }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const getPhone = async (req, res) => {
  const { userId } = req.body;

  try {
    await client.connect();
    const database = client.db("chadchat");
    const users = database.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { phone: 1 } }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ phone: user.phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const getUserInfo = async (req, res) => {
  const { userId } = req.params;

  try {
    await client.connect();
    const database = client.db("chadchat");
    const users = database.collection("users");

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

export const updatePassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await client.connect();
    const database = client.db("chadchat");
    const users = database.collection("users");

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { passwordHash: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};

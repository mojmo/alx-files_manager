import { ObjectId } from 'mongodb';
import Queue from 'bull';

import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

module.exports = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = dbClient.db.collection('users');

    // Check if the email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Insert the new user into the database
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });

    // Add a job to the userQueue
    await userQueue.add({ userId: result.insertedId.toString() });

    // Return the new user with only the email and id
    res.status(201).json({
      id: result.insertedId,
      email,
    });
    return null;
  },

  getMe: async (req, res) => {
    const token = req.headers['x-token'];
    console.log('token:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ _id: ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id, email: user.email });
  },
};

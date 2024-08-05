const { hash } = require('crypto');
const dbClient = require('../utils/db');

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
    const hashedPassword = hash('sha1').update(password).digest('hex');

    // Insert the new user into the database
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });

    // Return the new user with only the email and id
    res.status(201).json({
      id: result.insertedId,
      email,
    });
    return null;
  },
};

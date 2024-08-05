import redisClient from '../utils/redis';
import dbClient from '../utils/db';

module.exports = {
  getStatus: (req, res) => {
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive()
    });
  },
  getStats: async (req, res) => {
    const userCount = await dbClient.nbUsers();
    const fileCount = await dbClient.nbFiles();
    res.status(200).json({
      users: userCount,
      files: fileCount
    });
  }
};

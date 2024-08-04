// import MongoClient from 'mongodb/lib/mongo_client';
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'file_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    MongoClient.connect(url, { useUnifiedTopology: true }, (client, err) => {
      if (err) {
        console.error(err);
      } else {
        this.db = client.db(database);
        console.log('Connected to MongoDB');
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    const users = this.db.collection('users');
    const nbUsers = users.countDocuments({});
    return nbUsers;
  }

  async nbFiles() {
    const files = this.db.collection('files');
    const nbFiles = files.countDocuments({});
    return nbFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;

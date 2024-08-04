import MongoClient from 'mongodb/lib/mongo_client';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'file_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useNewUrlParser: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const db = this.client.db();
    const users = db.collection('users');
    const nbUsers = users.countDocuments({});
    return nbUsers;
  }

  async nbFiles() {
    const db = this.client.db();
    const files = db.collection('files');
    const nbFiles = files.countDocuments({});
    return nbFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;

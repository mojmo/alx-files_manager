import MongoClient from 'mongodb/lib/mongo_client';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'file_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect();
    try {
      this.db = this.client.db(database);
    } catch (err) {
      this.db = false;
    }
  }

  isAlive() {
    return Boolean(this.db);
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

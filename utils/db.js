import { MongoClient, ObjectId } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.isConnected = false;

    this.client.connect()
      .then(() => {
        this.isConnected = true;
        this.db = this.client.db(database);
      })
      .catch((err) => {
        this.isConnected = false;
        this.db = false;
        console.log(err);
      });
  }

  isAlive() {
    return this.isConnected;
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

  // eslint-disable-next-line class-methods-use-this
  ObjectId(id) {
    return new ObjectId(id);
  }
}

const dbClient = new DBClient();
export default dbClient;

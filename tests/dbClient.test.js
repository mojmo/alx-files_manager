const chai = require('chai');
const dbClient = require('../utils/db');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { expect } = chai;

describe('dbClient', () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.DB_HOST = mongoUri.split('://')[1].split(':')[0];
    process.env.DB_PORT = mongoUri.split('://')[1].split(':')[1].split('/')[0];
    process.env.DB_DATABASE = mongoUri.split('/').pop();
    await dbClient.client.connect();
  });

  after(async () => {
    await dbClient.client.close();
    await mongoServer.stop();
  });

  it('should connect to MongoDB', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should count users', async () => {
    const count = await dbClient.nbUsers();
    expect(count).to.equal(0);
  });

  it('should count files', async () => {
    const count = await dbClient.nbFiles();
    expect(count).to.equal(0);
  });
});

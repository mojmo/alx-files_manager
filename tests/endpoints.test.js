const chai = require('chai');
const request = require('supertest');
const app = require('../server');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { expect } = chai;

describe('Endpoints', () => {
  let mongoServer;
  let token;

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
    await redisClient.client.quit();
    app.close();
  });

  it('GET /status', async () => {
    const res = await request(app).get('/status');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ redis: true, db: true });
  });

  it('GET /stats', async () => {
    const res = await request(app).get('/stats');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ users: 0, files: 0 });
  });

  it('POST /users', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('email', 'test@example.com');
  });

  it('GET /connect', async () => {
    const res = await request(app)
      .get('/connect')
      .set('Authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA==');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
    token = res.body.token;
  });

  it('GET /disconnect', async () => {
    const res = await request(app)
      .get('/disconnect')
      .set('X-Token', token);
    expect(res.status).to.equal(204);
  });

  it('GET /users/me', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('X-Token', token);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('email', 'test@example.com');
  });

  it('POST /files', async () => {
    const res = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'testFile', type: 'file', data: 'aGVsbG8gd29ybGQ=' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('name', 'testFile');
  });

  it('GET /files/:id', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'testFile', type: 'file', data: 'aGVsbG8gd29ybGQ=' });
    const fileId = fileRes.body.id;

    const res = await request(app)
      .get(`/files/${fileId}`)
      .set('X-Token', token);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id', fileId);
    expect(res.body).to.have.property('name', 'testFile');
  });

  it('GET /files', async () => {
    const res = await request(app)
      .get('/files')
      .set('X-Token', token);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('PUT /files/:id/publish', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'testFile', type: 'file', data: 'aGVsbG8gd29ybGQ=' });
    const fileId = fileRes.body.id;

    const res = await request(app)
      .put(`/files/${fileId}/publish`)
      .set('X-Token', token);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('isPublic', true);
  });

  it('PUT /files/:id/unpublish', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'testFile', type: 'file', data: 'aGVsbG8gd29ybGQ=' });
    const fileId = fileRes.body.id;

    const res = await request(app)
      .put(`/files/${fileId}/unpublish`)
      .set('X-Token', token);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('isPublic', false);
  });

  it('GET /files/:id/data', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'testFile', type: 'file', data: 'aGVsbG8gd29ybGQ=' });
    const fileId = fileRes.body.id;

    const res = await request(app)
      .get(`/files/${fileId}/data`)
      .set('X-Token', token);
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('hello world');
  });
});

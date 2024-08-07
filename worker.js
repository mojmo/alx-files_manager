import Queue from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    return done(new Error('Missing fileId'));
  }

  if (!userId) {
    return done(new Error('Missing userId'));
  }

  const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!file) {
    return done(new Error('File not found'));
  }

  const widths = [500, 250, 100];

  await Promise.all(widths.map(async (width) => {
    const thumbnail = await imageThumbnail(file.localPath, { width, responseType: 'base64' });
    const thumbnailPath = `${file.localPath}_${width}`;
    fs.writeFileSync(thumbnailPath, thumbnail, 'base64');
  }));

  done();
});

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieparse from 'cookie-parser';

import cache from './util/cache.js';

import userRoutes from './routes/user.js';
import dirRoutes from './routes/directory.js';
import bkmrkRoutes from './routes/bookmark.js';
import tagRoutes from './routes/tag.js';
import accessRoutes from './routes/access.js';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './util/auth.js';
import { ErrorHandling } from './util/error.js';

dotenv.config();
const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieparse())
app.use(morgan('dev'))

app.use(authRoutes);
app.use('/api/v1/access', authenticateToken, accessRoutes)
app.use('/api/v1/user', authenticateToken, userRoutes)
app.use('/api/v1/dir', authenticateToken, dirRoutes)
app.use('/api/v1/bkmrk', authenticateToken, bkmrkRoutes)
app.use('/api/v1/tag', authenticateToken, tagRoutes)

app.use('/', (req, reply, next) => {
    reply.json({ message: "MAGIC BOX" });
})

app.use(ErrorHandling);

if (process.env.NODE_ENV !== 'test') {
    (async () => {
        console.log('db url: ', process.env.DATABASE_URL);
        await cache.connect();
        await cache.flushAll()
        app.listen(3000);
    })()
}

export const server = app;
export const redis = cache;

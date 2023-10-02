import express from 'express';
import cors from 'cors';
import morgan from 'morgan';


import userRoutes from './routes/user.js';
import dirRoutes from './routes/directory.js';
import bkmrkRoutes from './routes/bookmark.js';
import tagRoutes from './routes/tag.js';
import accessRoutes from './routes/access.js';
import authRoutes from './routes/auth.js';
import authenticateToken from './util/auth.js';

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use(authRoutes);


app.use('/api/v1/access', authenticateToken, accessRoutes)
app.use('/api/v1/user', authenticateToken, userRoutes)
app.use('/api/v1/dir', authenticateToken, dirRoutes)
app.use('/api/v1/bkmrk', authenticateToken, bkmrkRoutes)
app.use('/api/v1/tag', authenticateToken, tagRoutes)

app.use('/', (req, reply, next) => {
    console.log('im in the magic middleware');
    reply.json({ message: "MAGIC BOX" });
})

app.use((err, req, reply, next) => {
    console.log(err)
    console.log("error:", err.name);

    reply.json(err)
})

app.listen(3000);

export default app;
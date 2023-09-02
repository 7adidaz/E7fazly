import express from 'express';
import cors from 'cors';
import morgan from 'morgan';


import userRoutes from './routes/user.js';
import dirRoutes from './routes/directory.js';
import bkmrkRoutes from './routes/bookmark.js';
import tagRoutes from './routes/tag.js';
import accessRoutes from './routes/access.js';

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use('/access', accessRoutes)
app.use('/user', userRoutes)
app.use('/dir', dirRoutes)
app.use('/bkmrk', bkmrkRoutes)
app.use('/tag', tagRoutes)


app.listen(3000);

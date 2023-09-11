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

/**
 * //TODO: 
 * all of the GET operations extract 
 * the user from params or some form of 
 * data in the body, this is WRONG! 
 * 
 * the user's id or sensitive data
 * should be in the authZ header! 
 * 
 * i will leave it like this for now 
 * until the auth middleware is finished. 
 */

app.use('/access', accessRoutes)
app.use('/user', userRoutes)
app.use('/dir', dirRoutes)
app.use('/bkmrk', bkmrkRoutes)
app.use('/tag', tagRoutes)

app.use((err, req, reply, next) => {
    console.log(err)
    console.log("error:", err.name, err.errorObject.description);

    reply.json(err)
})

app.listen(3000);

export default app;
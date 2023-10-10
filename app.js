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
import { BaseError, AuthorizationError, ValidationError, APIError, ConflictError, NotFoundError } from './util/error.js';

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use((req, reply, next) => {
    console.log('req.body', req.body);
    console.log('req.params', req.params);
    console.log('req.query', req.query);
    next();
})

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
    if (err instanceof BaseError) {
        if (err instanceof AuthorizationError) {
            return reply
                .status(err.statusCode)
                .json({ message: "You are not authorized to perform this action." });
        }

        if (err instanceof ValidationError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "Error Validating the request data",
                    error: err.errorObject
                });
        }

        if (err instanceof APIError) {
            return reply
                .status(err.statusCode)
                .json({ message: "Something went wrong with the database." });
        }

        if (err instanceof ConflictError) {
            return reply
                .status(err.statusCode)
                .json({ message: "Data Conflict Error." });
        }

        if (err instanceof NotFoundError) {
            return reply
                .status(err.statusCode)
                .json({ message: "Record/s Not Found." });
        }
    } else {
        return reply.json({ message: "Something went wrong." });
    }
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(3000);
}

export default app;
import bcrypt from 'bcrypt';
import prisma from '../util/prismaclient.js'
import { userDataValidation } from '../validators/user.js';
import Joi from 'joi';

export async function createUser(req, reply, next) {
    const validateresult = userDataValidation.validate(req.body, {abortEarly: false})
    if(validateresult){
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = validateresult.error.details.map(err => err.message);
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const found = await prisma.user.findFirst({
        where: {
            email: email
        }
    });

    if(found){
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = ['email already exists'];
    }
    
    return reply.json({
    });
}

export async function getUser(req, reply, next) {
    const id = req.body.id;
}

export async function getByEmail(req, reply, next) {
    // can be used for showing user's data when someone invites him
    const email = req.body.email;  
}

export async function updateUser(req, reply, next) {
    const id = req.body.id;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
}

export async function deleteUser(req, reply, next) {
    const id = req.body.id;
}

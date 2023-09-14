import { Router } from 'express';
import { createUser, getUser, getByEmail, updateUser, deleteUser } from '../controllers/user.js';
import { createUserDataValidator, emailValidator, idValidator, updateUserDataValidator } from '../validators/user.js';
const router = Router();


router.post('/create', createUserDataValidator, createUser);
router.get('/me', idValidator, getUser);
router.get('/find/:email', emailValidator, getByEmail)
router.patch('/:id', updateUserDataValidator, updateUser);
router.delete('/:id', idValidator, deleteUser);


export default router;

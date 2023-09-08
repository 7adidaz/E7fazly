import { Router } from 'express';
import { createUser, getUser, getByEmail, updateUser, deleteUser } from '../controllers/user.js';
const router = Router();


router.post('/create', createUser);
router.get('/me', getUser);
router.get('/find/:email', getByEmail)
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);


export default router;

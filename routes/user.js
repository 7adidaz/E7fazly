import { Router } from 'express';
import { getUser, getByEmail, updateUser, deleteUser } from '../controllers/user.js';
import { emailValidator, idValidator, updateUserDataValidator } from '../validators/user.js';
const router = Router();


router.get('/me', idValidator, getUser);
router.get('/find/:email', emailValidator, getByEmail)
router.patch('/:id', updateUserDataValidator, updateUser);
router.delete('/:id', idValidator, deleteUser);


export default router;

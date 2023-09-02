import { Router } from 'express';
import { createUser } from '../controllers/user.js';
const router = Router();


router.post('/create', createUser);
router.get('/me')
router.patch('/:id');
router.delete('/:id');


export default router;

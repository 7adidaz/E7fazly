import { Router } from 'express';
const router = Router();

router.post('create');
router.patch('/:id');
router.delete('/:id');


export default router;

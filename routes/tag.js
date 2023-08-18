import { Router } from 'express';
const router = Router();

router.post('create');

router.get('/:id');
router.get('/bkmrk/:id'); // tags for a specific bkmrk.
router.get('/all/:user_id'); // tags for a specific user.

router.patch('/:id');
router.delete('/:id');


export default router;


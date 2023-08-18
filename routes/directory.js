import { Router } from "express";
const router = Router();

router.post('create');

router.get('/:id')
router.get('/content/:prntdir_id')
router.get('/all');

router.patch('/:id'); // maybe should changed to handle a list of ids.
router.delete('/:ids');


export default router;

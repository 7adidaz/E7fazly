import { Router } from 'express';
const router = Router();

router.post('create');

router.get('/:id')
router.get('/all')
router.get('/tag/:tag_id') // gets bkmrks under a specific tag. 

router.patch('/:ids');  

router.delete('/:ids'); 


export default router;

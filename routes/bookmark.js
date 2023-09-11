import { Router } from 'express';
import { createBookmark, getAllBookmarks, getBookmarkById, getBookmarksByTag, updateBookmarks } from '../controllers/bookmark.js';
const router = Router();

router.post('create', createBookmark);

router.get('/:id', getBookmarkById)
router.get('/all', getAllBookmarks)
router.get('/tag/:tag_id', getBookmarksByTag) // gets bkmrks under a specific tag. 

router.patch('/:ids', updateBookmarks);

router.delete('/:ids', deleteBookmarks);


export default router;

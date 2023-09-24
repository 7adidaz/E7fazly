import { Router } from 'express';
import { createBookmark, getAllBookmarks, getBookmarkById, getBookmarksByTag, updateBookmarks, deleteBookmarks } from '../controllers/bookmark.js';
import { bookmarkIdValidator, createBookmarkDataValidator, deleteBookmarkDataValidator, tagIdValidator, updateBookmarkDataValidator } from '../validators/bookmark.js';
import { userIdValidator } from '../validators/directory.js';
const router = Router();

router.post('create', createBookmarkDataValidator, createBookmark);

router.get('/:id', bookmarkIdValidator, getBookmarkById)
router.get('/all',  getAllBookmarks)
router.get('/tag/:tagId', tagIdValidator, getBookmarksByTag) // gets bkmrks under a specific tag. 

router.patch('', updateBookmarkDataValidator, updateBookmarks);

router.delete('', deleteBookmarkDataValidator, deleteBookmarks);

export default router;

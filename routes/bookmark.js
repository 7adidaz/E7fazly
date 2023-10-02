import { Router } from 'express';
import {
    createBookmark,
    getAllBookmarks,
    getBookmarkById,
    getBookmarksByTag,
    updateBookmarks,
    deleteBookmarks
} from '../controllers/bookmark.js';

import {
    bookmarkIdValidator,
    createBookmarkDataValidator,
    deleteBookmarkDataValidator,
    tagIdValidator,
    updateBookmarkDataValidator
} from '../validators/bookmark.js';

import {
    createBookmarkAuthorization,
    getBookmarkByIdAuthorization,
    getBookmarksByTagAuthorization,
    updateBookmarksAuthorization
} from '../authorization/bookmark.js';

const router = Router();

router.post('/create', createBookmarkDataValidator, createBookmarkAuthorization, createBookmark);

router.get('/all', getAllBookmarks)
router.get('/:id', bookmarkIdValidator, getBookmarkByIdAuthorization, getBookmarkById)
router.get('/tag/:tagId', tagIdValidator, getBookmarksByTagAuthorization, getBookmarksByTag) // gets bkmrks under a specific tag. 

router.patch('', updateBookmarkDataValidator, updateBookmarksAuthorization, updateBookmarks);

router.delete('', deleteBookmarkDataValidator, deleteBookmarkDataValidator, deleteBookmarks);

export default router;
//
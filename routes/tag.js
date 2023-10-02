import { Router } from 'express';
import {
    addTagForBookmark,
    getTagsForBookmark,
    getTagsForUser,
    removeTagFromBookmark,
    updateTagName
} from '../controllers/tag.js';

import {
    addTagValidator,
    bookmarkIdValidator,
    removeTagValidator,
    updateTagNameValidator
} from '../validators/tag.js';

import {
    addTagToBookmarkAuthorizor,
    getTagsForBookmarkAuthorizor,
    removeTagFromBookmarkAuthorizor,
    updateTagNameAuthorizor
} from '../authorization/tag.js';

const router = Router();

router.post('/create', addTagValidator, addTagToBookmarkAuthorizor, addTagForBookmark);

router.get('/bkmrk/:bookmarkId', bookmarkIdValidator, getTagsForBookmarkAuthorizor, getTagsForBookmark); // tags for a specific bkmrk.
router.get('/all', getTagsForUser); // tags for a specific user.

router.patch('', updateTagNameValidator, updateTagNameAuthorizor, updateTagName);
router.delete('', removeTagValidator, removeTagFromBookmarkAuthorizor, removeTagFromBookmark);


export default router 

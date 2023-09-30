import { Router } from 'express';
import { addTagForBookmark, getTagsForBookmark, getTagsForUser, removeTagFromBookmark, updateTagName } from '../controllers/tag.js';
import { addTagValidator, bookmarkIdValidator, removeTagValidator, updateTagNameValidator } from '../validators/tag.js';

const router = Router();

router.post('/create', addTagValidator, addTagForBookmark);

router.get('/bkmrk/:bookmarkId', bookmarkIdValidator, getTagsForBookmark); // tags for a specific bkmrk.
router.get('/all', getTagsForUser); // tags for a specific user.

router.patch('', updateTagNameValidator, updateTagName);
router.delete('', removeTagValidator, removeTagFromBookmark);


export default router 

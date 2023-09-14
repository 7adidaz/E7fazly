import { Router } from "express";
import { contentByParent, createDirectory, deleteDirectoriesByIds, getAllDirectories, updateDirectory } from "../controllers/directory.js";
import { createDirectoryDataValidator, deleteIdsValidator, parentIdValidator, updateDirectoryDataValidator, userIdValidator } from "../validators/directory.js";
const router = Router();

router.post('/create', createDirectoryDataValidator, createDirectory);

router.get('/:id') //TODO: Do i really need this? 
router.get('/content/:parentId', parentIdValidator, contentByParent);
router.get('/all/:userId', userIdValidator, getAllDirectories); //TODO: fix this, the id should be extracted from auth

router.patch('/:id', updateDirectoryDataValidator, updateDirectory); //TODO: maybe should changed to handle a list of ids.
router.delete('', deleteIdsValidator, deleteDirectoriesByIds);

export default router;

import { Router } from "express";
import { contentByParent, createDirectory, deleteDirectoriesByIds, getAllDirectories, updateDirectoriesByIds } from "../controllers/directory.js";
import { createDirectoryDataValidator, deleteIdsValidator, parentIdValidator, updateDirectoryDataValidator, userIdValidator } from "../validators/directory.js";
const router = Router();

router.post('/create', createDirectoryDataValidator, createDirectory);

router.get('/:id') //Do i really need this? 
router.get('/content/:parentId', parentIdValidator, contentByParent);
router.get('/all/:userId', userIdValidator, getAllDirectories); 

router.patch('/:ids', updateDirectoryDataValidator, updateDirectoriesByIds); 
router.delete('/:ids', deleteIdsValidator, deleteDirectoriesByIds);

export default router;

import { Router } from "express";
import { contentByParent, createDirectory, deleteDirectoriesByIds, getAllDirectories, updateDirectoriesByIds } from "../controllers/directory.js";
import { createDirectoryDataValidator, deleteDirectoryDataValidator, parentIdValidator, updateDirectoryDataValidator, userIdValidator } from "../validators/directory.js";
const router = Router();

router.post('/create', createDirectoryDataValidator, createDirectory);

router.get('/content/:parentId', parentIdValidator, contentByParent);
router.get('/all', getAllDirectories); 

router.patch('', updateDirectoryDataValidator, updateDirectoriesByIds); 
router.delete('', deleteDirectoryDataValidator, deleteDirectoriesByIds);

export default router;

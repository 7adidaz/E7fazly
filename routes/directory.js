import { Router } from "express";
import { contentByParent, createDirectory, deleteDirectoriesByIds, getAllDirectories,  updateDirectory } from "../controllers/directory.js";
const router = Router();

router.post('/create', createDirectory);

router.get('/:id') //TODO: Do i really need this? 
router.get('/content/:parent_id', contentByParent);
router.get('/all/:userId', getAllDirectories); //TODO: fix this, the id should be extracted from auth

router.patch('/:id', updateDirectory); //TODO: maybe should changed to handle a list of ids.
router.delete('', deleteDirectoriesByIds);


export default router;

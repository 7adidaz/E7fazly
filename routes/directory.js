import { Router } from "express";
import {
    contentByParent,
    createDirectory,
    deleteDirectoriesByIds,
    getAllDirectories,
    updateDirectoriesByIds
} from "../controllers/directory.js";

import {
    createDirectoryDataValidator,
    deleteDirectoryDataValidator,
    parentIdValidator,
    updateDirectoryDataValidator
} from "../validators/directory.js";

import {
    createDirectoryAuthorizer,
    deleteDirectoriesByIdsAuthorizer,
    getParentContentAuthorizer,
    updateDirectoriesByIdsAuthorizer
} from "../authorization/directory.js";

const router = Router();

router.post('/create', createDirectoryDataValidator, createDirectoryAuthorizer, createDirectory);

router.get('/content/:parentId', parentIdValidator, getParentContentAuthorizer, contentByParent);
router.get('/all', getAllDirectories);

router.patch('', updateDirectoryDataValidator, updateDirectoriesByIdsAuthorizer, updateDirectoriesByIds);
router.delete('', deleteDirectoryDataValidator, deleteDirectoriesByIdsAuthorizer, deleteDirectoriesByIds);

export default router;

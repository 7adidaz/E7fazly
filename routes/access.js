import { Router } from 'express';
import { getAccessValidator, grantAccessValidator, revokeAccessValidator } from '../validators/access.js';
import { getUsersWithAccess, grantAccess, revokeAccess } from '../controllers/access.js';
const router = Router();

router.post('/grant', grantAccessValidator, grantAccess);
router.get('/:directoryId', getAccessValidator, getUsersWithAccess);
router.delete('/revoke', revokeAccessValidator, revokeAccess);

export default router;

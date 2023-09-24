import { Router } from 'express';
import { getAccessValidator, grantAccessValidator, revokeAccessValidator } from '../validators/access';
import { getUsersWithAccess, grantAccess, revokeAccess } from '../controllers/access';
const router = Router();

router.post('/grant', grantAccessValidator, grantAccess);
router.get('/directoryId', getAccessValidator, getUsersWithAccess);
router.delete('/revoke', revokeAccessValidator, revokeAccess);

export default router;

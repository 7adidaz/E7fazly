import { Router } from 'express';
import {
    getAccessValidator,
    grantAccessValidator,
    revokeAccessValidator
} from '../validators/access.js';

import {
    getUsersWithAccess,
    grantAccess,
    revokeAccess
} from '../controllers/access.js';

import {
    getAccessAuthorizor,
    grantAccessAuthorizor,
    revokeAccessAuthorizor
} from '../authorization/access.js';

const router = Router();

router.post('/grant', grantAccessValidator, grantAccessAuthorizor, grantAccess);
router.get('/:directoryId', getAccessValidator, getAccessAuthorizor, getUsersWithAccess);
router.delete('/revoke', revokeAccessValidator, revokeAccessAuthorizor, revokeAccess);

export default router;

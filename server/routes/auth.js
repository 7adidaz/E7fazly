import { Router } from 'express';
import { signup, login,  verify, } from "../controllers/auth.js";
import { signupDataValidator, loginDataValidator } from "../validators/auth.js";
const router = Router();


router.post('/api/v1/signup', signupDataValidator, signup);
router.post('/api/v1/login', loginDataValidator, login);
router.post('/api/v1/verify/:code', verify);

export default router;

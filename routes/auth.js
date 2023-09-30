import { Router } from 'express';
import { signup, login } from "../controllers/auth.js";
import { signupDataValidator, loginDataValidator } from "../validators/auth.js";
const router = Router();


router.post('/api/v1/signup', signupDataValidator, signup);
router.post('/api/v1/login', loginDataValidator, login);

export default router;

import { Router } from 'express';
import { signup, login } from "../controllers/auth.js";
import { signupDataValidator, loginDataValidator } from "../validators/user.js";
const router = Router();


router.post('/signup', signupDataValidator, signup);
router.post('/login', loginDataValidator, login);

export default router;

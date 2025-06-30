import { Router } from 'express';
import {
  login,
  recoverPassword,
  registerStep1,
  registerStep2,
  resetPassword
} from '../controller/authController';

const router = Router();

router.post('/register-step1', registerStep1);
router.post('/register-step2', registerStep2);
router.post('/login', login);
router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

export default router;
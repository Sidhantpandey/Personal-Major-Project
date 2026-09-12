import express from 'express';
import { register, login, logout, getCurrentUser, sendOtp } from '../controllers/authController.js';
import { validateRegister, validateLogin, validateSendOtp } from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/send-otp', validateSendOtp, sendOtp);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;

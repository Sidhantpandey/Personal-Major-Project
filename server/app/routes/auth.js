import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Register
router.post('/register', validateRegister, register);

// Login
router.post('/login', validateLogin, login);

// Logout (protected route)
router.post('/logout', authenticate, logout);

export default router;
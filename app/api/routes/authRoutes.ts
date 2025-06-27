const express = require('express');
const router = express.Router();

const {
  login,
  recoverPassword,
  registerStep1,
  registerStep2,
  resetPassword
} = require('../controller/authController');

router.post('/register-step1', registerStep1);
router.post('/register-step2', registerStep2);
router.post('/login', login);
router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
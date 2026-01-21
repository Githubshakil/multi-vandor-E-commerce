const express = require('express');
const router = express.Router();
const { register, login, refreshToken } = require('../controllers/authController')
const { verifyEmail } = require('../controllers/verifyEmail')


router.post('/register' , register)
router.get('/verify-email', verifyEmail)
router.post('/login' , login)
router.post('/refresh-token' , refreshToken)



module.exports = router
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController')
const { verifyEmail } = require('../controllers/verifyEmail')


router.post('/register' , register)
router.get('/verify-email', verifyEmail)



module.exports = router
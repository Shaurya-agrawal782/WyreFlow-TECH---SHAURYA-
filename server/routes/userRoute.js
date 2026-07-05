const express = require('express'); 

const { registerUser, loginUser } = require('../controllers/userController'); 
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router(); 

router.post('/register', authLimiter, registerUser);  //route for registration

router.post('/login', authLimiter, loginUser);   //route for login

module.exports = router; 
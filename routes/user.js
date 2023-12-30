const express = require('express');
const { login } = require('../controllers/userLogin');
const userRouter = express.Router();
const bodyParser = require('body-parser');
// const { Auth } = require('../middleware/auth');

const jsonparser = bodyParser.json();

console.log('aa gya 2')
userRouter.post('/login',jsonparser, login); // Assuming login function is defined in your controller

module.exports = userRouter

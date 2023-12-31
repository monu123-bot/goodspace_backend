const express = require('express');
const { fetchChats } = require('../controllers/chat');
const chatRouter = express.Router();
const bodyParser = require('body-parser');
const { Auth } = require('../middlewares/auth');

const jsonparser = bodyParser.json();

console.log('aa gya 2')
chatRouter.get('/fetch',jsonparser,Auth, fetchChats); // Assuming login function is defined in your controller

module.exports = chatRouter

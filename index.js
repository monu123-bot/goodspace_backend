require("dotenv").config();
const cors = require('cors');
const OpenAI = require('openai');
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
// const errorHandler = require("./middleware/error");

const app = express();

app.use(cors())

// SETTING UP CONNECTION WITH THE DATABASE
connectDB()
    .then(() => console.log("Connected to database"))
    .catch(error => console.log(`Error while connecting ${error.message}`))

app.use(express.json());
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
  });


  async function main(message) {

	try {
		const chatCompletion = await openai.chat.completions.create({
			messages: [{ role: 'user', content: message }],
			model: 'gpt-3.5-turbo',
		  });
		  console.log(chatCompletion.choices[0].message['content'])
          return chatCompletion.choices[0].message['content']
	} catch (error) {
		
        return "Limit excedded"
	}
  

}
// MIDDLEWARE FOR ROUTES
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/user', require('./routes/user'));
// app.use('/api/chat', require('./routes/chat'));

// THIS MIDDLEWARE WILL TAKE CARE OF ALL THE ERROS
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`listening to PORT : ${PORT}`);
})

const io = require('socket.io')(server,{
    pingTimeout : 120000,
    cors : {
        origin : "http://localhost:5000"
    }
});

io.on('connection', async (socket) => {
    console.log('A client connected');
  
    // Listen for messages from the client
    socket.on('messageFromClient', async (message) => {
      console.log('Message from client:', message);
  
      // Sending a message back to the client

      // 
      const resp = await main(message)
      console.log("resp from gpt ",resp)
      

      //
      io.emit('messageFromServer', 'Message received on the server: ' + resp);
    });
  
    // Disconnect event
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });
  

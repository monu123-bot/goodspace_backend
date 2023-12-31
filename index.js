require("dotenv").config();
const cors = require('cors');
const OpenAI = require('openai');
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const messages = require('./models/Message')
const Message = mongoose.model('messages');
const users = require('./models/User')
const Users = mongoose.model('users');
const jwt = require('jsonwebtoken')
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

  const saveMessageToDatabase = async (user,type,message)=>{
     console.log("user for save message ",user)
     
     try {
      const newMessage = new Message({
        user: user._id, // Assuming you have userId available
        type: type, // 'sent' or 'received'
        message: message, // The actual message content
        createdAt: Date.now() // Automatically set the current timestamp
      });




  
      const savedMessage = await newMessage.save();
      console.log('Message saved:', savedMessage);
      return savedMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error; // Rethrow the error to handle it where the function is called
    }
  }


  const  main = async(message)=> {

	try {
		const chatCompletion = await openai.chat.completions.create({
			messages: [{ role: 'user', content: message }],
			model: 'gpt-3.5-turbo',
		  });
		  console.log(chatCompletion.choices[0].message['content'])
          return chatCompletion.choices[0].message['content']
	} catch (error) {
		    // console.log(error)
        return "Your free limit exceeded"
	}
  

}

const userRouter = require('./routes/user')
const chatRouter = require('./routes/chat')

const Auth = require('./middlewares/auth')
// MIDDLEWARE FOR ROUTES
app.use('/api/user', userRouter);
// app.use('/api/user', require('./routes/user'));
app.use('/api/chat', chatRouter);

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

  const authToken = socket.handshake.query.authToken;


  try {
    const header = authToken
    const token = header && header.split(' ')[1]
    console.log(token)
    if (token == null) {
      io.emit('messageFromServer', 'Message received on the server: ' + "You are unauthorized");
    }
    console.log("11")
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
    console.log("verifytoken",verifyToken)
    if (verifyToken) {
        const user = await Users.findOne({ email: verifyToken._id })
        if (!user) {
          io.emit('messageFromServer', 'Message received on the server: ' + "your verification with the server failed");
        }
        console.log("1")
        

        console.log('A client connected',authToken);
  
        // Listen for messages from the client
        socket.on('messageFromClient', async (message) => {
          console.log('Message from client:', message);

          if (message===''){
            io.emit('messageFromServer', 'Please speak or type something...');
          }
          else{

          // Sending a message back to the client
         
          // 
          const resp = await main(message)
          console.log("resp from gpt ",resp)
    
          const saveResp1 = await saveMessageToDatabase(user,true,message)
          const saveResp2 = await saveMessageToDatabase(user,false,resp)

          // const saveResp = true
          //
          if (saveResp1 && saveResp2){
            io.emit('messageFromServer',{token, resp});
          }
          else{
            io.emit('messageFromServer', 'Message received on the server: ' + "chat can not be saved to database");
          }
          }
      
          
        }
        
        );


        
    } else {
      io.emit('messageFromServer', 'Message received on the server: ' + "You are unauthorized");
    }
} catch (error) {
    console.log("2")
    io.emit('messageFromServer', 'Message received on the server: ' + "some error with the server");

}



  
  
    // Disconnect event
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });
  

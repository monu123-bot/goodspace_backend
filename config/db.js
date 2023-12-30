

const mongoose = require('mongoose');

const connectDB = async () => {
        console.log(process.env.MONGO_URI)
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Other options...
        });
     
};

module.exports = connectDB;

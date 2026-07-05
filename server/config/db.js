const mongoose = require('mongoose'); 

require('dotenv').config(); 

const connectDB = async () => { 
try { 
await mongoose.connect(process.env.MONGO_URI, {   //connecting mongodb database using mongoose module.

}); 
console.log('MongoDB Connected');   

} catch (error) { 

console.error(error.message); 
process.exit(1); 
} 
}; 

module.exports = connectDB;
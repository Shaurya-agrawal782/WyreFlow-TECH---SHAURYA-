const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const UserSchema = new mongoose.Schema({     //registeration model/schema for jobseeker/employer.
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['job_seeker', 'employer', 'admin', 'recruiter'], required: true }
}, { timestamps: true });


UserSchema.pre('save', async function (next) {   //password hasing for registartion using bcrypt
  if (!this.isModified('password')) return next();  // only hash if password changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


UserSchema.methods.matchPassword = async function (enteredPassword) {  //comparing passwords between users and provide the suitable 
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 
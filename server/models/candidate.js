const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required']
  },
  email: {
    type: String,
    required: [true, 'Candidate email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative']
  },
  skills: [{
    type: String,
    trim: true
  }],
  resumeUrl: {
    type: String
  },
  status: {
    type: String,
    enum: {
      values: ['applied', 'shortlisted', 'rejected', 'hired'],
      message: '{VALUE} is not a valid status'
    },
    default: 'applied'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user reference is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', CandidateSchema);

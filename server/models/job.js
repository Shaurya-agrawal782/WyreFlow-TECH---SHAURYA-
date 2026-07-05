const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({  //Format of job model/schema which displayed to the jobseeker by employer.

  title: { type: String, required: true, text: true },
  description: { type: String, required: true },
  requirements: { type: String },
  company: { type: String, required: true, text: true },
  location: { type: String, text: true },
  salary: { type: String },
  type: { type: String }, // full-time, part-time, contract - employment type
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // NEW fields for pdf extension

  skills: [{ type: String, index: true }],  // array of skills:  ex - ['react', 'node']
  industry: { type: String, index: true },  // ex - 'fincare', 'automobile'

  createdAt: { type: Date, default: Date.now },
});

JobSchema.index({ title: 'text', description: 'text', company: 'text', location: 'text' }); //compound text index used for search for better searching across fileds.

module.exports = mongoose.model('Job', JobSchema);

const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  appointmentType: {
    type: String,
    enum: ['surgery', 'non-surgery'],
    default: 'surgery'
  },
  surgeryType: {
    type: String
  },
  healthIssue: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  surgeryDoneBy: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  address: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    trim: true,
    lowercase: true
  },
  bookedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  hospitalName: {
    type: String,
    required: true
  },
  hospitalLocation: {
    type: String,
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  approvedForSurgery: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  surgeryDone: {
    type: Boolean,
    default: false
  },
  consultationDone: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for semantic search
PatientSchema.index({ 
  name: 'text', 
  surgeryType: 'text',
  healthIssue: 'text', 
  address: 'text',
  mobileNo: 'text',
  hospitalName: 'text'
});

module.exports = mongoose.model('Patient', PatientSchema);

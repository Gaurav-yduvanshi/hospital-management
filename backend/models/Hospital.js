const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  }
});

const SurgerySchema = new mongoose.Schema({
  surgeryType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  doctor: DoctorSchema
});

const NonSurgeryServiceSchema = new mongoose.Schema({
  healthIssue: {
    type: String,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  doctor: DoctorSchema
});

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India',
    required: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  establishYear: {
    type: Number,
    required: true
  },
  opdCharge: [{
    type: Number
  }],
  surgeries: [SurgerySchema],
  nonSurgeryServices: [NonSurgeryServiceSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hospital', HospitalSchema);

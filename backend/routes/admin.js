const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { adminAuth } = require('../middleware/auth');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get all hospitals
router.get('/hospitals', adminAuth, async (req, res) => {
  try {
    const hospitals = await Hospital.find().select('-password').sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single hospital details
router.get('/hospitals/:id', adminAuth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select('-password');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Get patient count for this hospital
    const patientCount = await Patient.countDocuments({ hospitalId: hospital._id });
    const surgeryDoneCount = await Patient.countDocuments({ hospitalId: hospital._id, surgeryDone: true });
    const approvedCount = await Patient.countDocuments({ hospitalId: hospital._id, approvedForSurgery: 'approved' });

    res.json({
      ...hospital.toObject(),
      stats: {
        totalPatients: patientCount,
        surgeriesDone: surgeryDoneCount,
        approved: approvedCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create hospital
router.post('/hospitals', adminAuth, async (req, res) => {
  try {
    const { name, email, password, country, state, district, landmark, establishYear, opdCharge } = req.body;

    // Check if hospital exists
    let hospital = await Hospital.findOne({ email });
    if (hospital) {
      return res.status(400).json({ message: 'Hospital already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create hospital
    hospital = new Hospital({
      name,
      email,
      password: hashedPassword,
      country,
      state,
      district,
      landmark,
      establishYear,
      opdCharge: opdCharge || []
    });

    await hospital.save();

    res.status(201).json({
      message: 'Hospital created successfully',
      hospital: { ...hospital.toObject(), password: undefined }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hospital
router.put('/hospitals/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, country, state, district, landmark, establishYear, opdCharge, surgeries } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (country) updateData.country = country;
    if (state) updateData.state = state;
    if (district) updateData.district = district;
    if (landmark) updateData.landmark = landmark;
    if (establishYear) updateData.establishYear = establishYear;
    if (opdCharge) updateData.opdCharge = opdCharge;
    if (surgeries) updateData.surgeries = surgeries;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({
      message: 'Hospital updated successfully',
      hospital
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete hospital
router.delete('/hospitals/:id', adminAuth, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Optionally delete all patients associated with this hospital
    await Patient.deleteMany({ hospitalId: req.params.id });

    res.json({ message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all patients with filters
router.get('/patients', adminAuth, async (req, res) => {
  try {
    const { hospitalId, surgeryDone, approvedForSurgery, search, startDate, endDate } = req.query;

    let query = {};

    // Filter by hospital
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    // Filter by surgery status
    if (surgeryDone !== undefined) {
      query.surgeryDone = surgeryDone === 'true';
    }

    // Filter by approval status
    if (approvedForSurgery) {
      query.approvedForSurgery = approvedForSurgery;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let patients;

    // Semantic search
    if (search) {
      patients = await Patient.find({
        ...query,
        $text: { $search: search }
      })
        .populate('bookedByUser', 'name email')
        .populate('hospitalId', 'name location')
        .sort({ createdAt: -1 });
    } else {
      patients = await Patient.find(query)
        .populate('bookedByUser', 'name email')
        .populate('hospitalId', 'name location')
        .sort({ createdAt: -1 });
    }

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single patient details
router.get('/patients/:id', adminAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('bookedByUser', 'name email')
      .populate('hospitalId', 'name location');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { hospitalId, surgeryDone, approvedForSurgery } = req.query;

    // If filtering by hospital or surgery status, get users through patients
    if (hospitalId || surgeryDone !== undefined || approvedForSurgery) {
      let patientQuery = {};
      
      if (hospitalId) patientQuery.hospitalId = hospitalId;
      if (surgeryDone !== undefined) patientQuery.surgeryDone = surgeryDone === 'true';
      if (approvedForSurgery) patientQuery.approvedForSurgery = approvedForSurgery;

      const patients = await Patient.find(patientQuery)
        .populate('bookedByUser')
        .select('bookedByUser');

      // Get unique users
      const userIds = [...new Set(patients.map(p => p.bookedByUser?._id.toString()).filter(Boolean))];
      const users = await User.find({ _id: { $in: userIds } }).select('-password');

      return res.json(users);
    }

    // Otherwise return all users
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', adminAuth, async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPatients = await Patient.countDocuments();
    const surgeriesDone = await Patient.countDocuments({ surgeryDone: true });
    const pendingSurgeries = await Patient.countDocuments({ surgeryDone: false });
    const approvedPatients = await Patient.countDocuments({ approvedForSurgery: 'approved' });
    const rejectedPatients = await Patient.countDocuments({ approvedForSurgery: 'rejected' });
    const pendingApprovals = await Patient.countDocuments({ approvedForSurgery: 'pending' });

    res.json({
      totalHospitals,
      totalUsers,
      totalPatients,
      surgeriesDone,
      pendingSurgeries,
      approvedPatients,
      rejectedPatients,
      pendingApprovals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

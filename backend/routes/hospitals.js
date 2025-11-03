const express = require('express');
const router = express.Router();
const { hospitalAuth } = require('../middleware/auth');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');

// Get hospital profile
router.get('/profile', hospitalAuth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospital.id).select('-password');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add surgery
router.post('/surgeries', hospitalAuth, async (req, res) => {
  try {
    const { surgeryType, price, availability, doctor } = req.body;

    if (!surgeryType || !price || !doctor || !doctor.name || !doctor.degree) {
      return res.status(400).json({ message: 'Please provide all surgery details' });
    }

    const hospital = await Hospital.findById(req.hospital.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.surgeries.push({
      surgeryType,
      price,
      availability: availability !== undefined ? availability : true,
      doctor
    });

    await hospital.save();

    res.status(201).json({
      message: 'Surgery added successfully',
      surgeries: hospital.surgeries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update surgery
router.put('/surgeries/:surgeryId', hospitalAuth, async (req, res) => {
  try {
    const { surgeryType, price, availability, doctor } = req.body;

    const hospital = await Hospital.findById(req.hospital.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const surgery = hospital.surgeries.id(req.params.surgeryId);
    
    if (!surgery) {
      return res.status(404).json({ message: 'Surgery not found' });
    }

    if (surgeryType) surgery.surgeryType = surgeryType;
    if (price) surgery.price = price;
    if (availability !== undefined) surgery.availability = availability;
    if (doctor) {
      if (doctor.name) surgery.doctor.name = doctor.name;
      if (doctor.degree) surgery.doctor.degree = doctor.degree;
    }

    await hospital.save();

    res.json({
      message: 'Surgery updated successfully',
      surgeries: hospital.surgeries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete surgery
router.delete('/surgeries/:surgeryId', hospitalAuth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospital.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.surgeries.pull(req.params.surgeryId);
    await hospital.save();

    res.json({
      message: 'Surgery deleted successfully',
      surgeries: hospital.surgeries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add health issue
router.post('/health-issues', hospitalAuth, async (req, res) => {
  try {
    const { healthIssue, consultationFee, availability, doctor } = req.body;

    if (!healthIssue || !consultationFee || !doctor || !doctor.name || !doctor.degree) {
      return res.status(400).json({ message: 'Please provide all health issue details' });
    }

    const hospital = await Hospital.findById(req.hospital.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.nonSurgeryServices.push({
      healthIssue,
      consultationFee,
      availability: availability !== undefined ? availability : true,
      doctor
    });

    await hospital.save();

    res.status(201).json({
      message: 'Health issue added successfully',
      nonSurgeryServices: hospital.nonSurgeryServices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update health issue
router.put('/health-issues/:healthIssueId', hospitalAuth, async (req, res) => {
  try {
    const { healthIssue, consultationFee, availability, doctor } = req.body;

    const hospital = await Hospital.findById(req.hospital.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const service = hospital.nonSurgeryServices.id(req.params.healthIssueId);
    
    if (!service) {
      return res.status(404).json({ message: 'Health issue not found' });
    }

    if (healthIssue) service.healthIssue = healthIssue;
    if (consultationFee) service.consultationFee = consultationFee;
    if (availability !== undefined) service.availability = availability;
    if (doctor) {
      if (doctor.name) service.doctor.name = doctor.name;
      if (doctor.degree) service.doctor.degree = doctor.degree;
    }

    await hospital.save();

    res.json({
      message: 'Health issue updated successfully',
      nonSurgeryServices: hospital.nonSurgeryServices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete health issue
router.delete('/health-issues/:healthIssueId', hospitalAuth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospital.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.nonSurgeryServices.pull(req.params.healthIssueId);
    await hospital.save();

    res.json({
      message: 'Health issue deleted successfully',
      nonSurgeryServices: hospital.nonSurgeryServices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all patients for hospital
router.get('/patients', hospitalAuth, async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = { hospitalId: req.hospital.id };

    // Filter by surgery status
    if (status === 'done') {
      query.surgeryDone = true;
    } else if (status === 'pending') {
      query.surgeryDone = false;
    }

    let patients;
    
    // Semantic search
    if (search) {
      patients = await Patient.find({
        ...query,
        $text: { $search: search }
      }).populate('bookedByUser', 'name email').sort({ createdAt: -1 });
    } else {
      patients = await Patient.find(query)
        .populate('bookedByUser', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patients by surgery status (MORE SPECIFIC - MUST BE BEFORE :id)
router.get('/patients/filter/surgery-status', hospitalAuth, async (req, res) => {
  try {
    const { done } = req.query;

    const surgeryDone = done === 'true';

    const patients = await Patient.find({
      hospitalId: req.hospital.id,
      surgeryDone
    }).populate('bookedByUser', 'name email').sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single patient details
router.get('/patients/:id', hospitalAuth, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      hospitalId: req.hospital.id
    }).populate('bookedByUser', 'name email');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient comments (MORE SPECIFIC - with /comments)
router.patch('/patients/:id/comments', hospitalAuth, async (req, res) => {
  try {
    const { comments } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospital.id },
      { comments },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient comments updated',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient approval status
router.patch('/patients/:id/approval', hospitalAuth, async (req, res) => {
  try {
    const { approvedForSurgery } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(approvedForSurgery)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospital.id },
      { approvedForSurgery },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient approval status updated',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark surgery as done/not done
router.patch('/patients/:id/surgery-status', hospitalAuth, async (req, res) => {
  try {
    const { surgeryDone, surgeryDoneBy } = req.body;

    const updateData = { surgeryDone };
    if (surgeryDoneBy) {
      updateData.surgeryDoneBy = surgeryDoneBy;
    }

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospital.id },
      updateData,
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Surgery status updated',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

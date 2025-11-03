const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Patient = require('../models/Patient');

// Get patient details
router.get('/:id', auth, async (req, res) => {
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

module.exports = router;

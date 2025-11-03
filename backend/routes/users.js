const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');

// Search hospitals by surgery type
router.get('/search-hospitals', auth, async (req, res) => {
  try {
    const { surgeryType, lat, lng, maxDistance } = req.query;

    if (!surgeryType) {
      return res.status(400).json({ message: 'Surgery type is required' });
    }

    // Find hospitals that offer the surgery
    let query = {
      'surgeries.surgeryType': { $regex: surgeryType, $options: 'i' }
    };

    let hospitals = await Hospital.find(query).select('-password');

    // Filter and format results
    const results = hospitals.map(hospital => {
      const matchingSurgeries = hospital.surgeries.filter(surgery =>
        surgery.surgeryType.toLowerCase().includes(surgeryType.toLowerCase())
      );

      // Calculate distance if coordinates provided
      let distance = null;
      if (lat && lng) {
        const R = 6371; // Earth's radius in km
        const dLat = (hospital.location.coordinates.lat - parseFloat(lat)) * Math.PI / 180;
        const dLng = (hospital.location.coordinates.lng - parseFloat(lng)) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(parseFloat(lat) * Math.PI / 180) * Math.cos(hospital.location.coordinates.lat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }

      return {
        id: hospital._id,
        name: hospital.name,
        location: hospital.location,
        state: hospital.state,
        district: hospital.district,
        landmark: hospital.landmark,
        establishYear: hospital.establishYear,
        opdCharge: hospital.opdCharge,
        surgeries: matchingSurgeries,
        distance: distance
      };
    });

    // Sort by distance if coordinates provided
    if (lat && lng) {
      results.sort((a, b) => a.distance - b.distance);
      
      // Filter by max distance if provided
      if (maxDistance) {
        const filtered = results.filter(r => r.distance <= parseFloat(maxDistance));
        return res.json(filtered);
      }
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search hospitals by non-surgery health issues
router.get('/search-non-surgery', auth, async (req, res) => {
  try {
    const { healthIssue } = req.query;

    if (!healthIssue) {
      return res.status(400).json({ message: 'Health issue is required' });
    }

    // Find hospitals that offer the non-surgery service
    let query = {
      'nonSurgeryServices.healthIssue': { $regex: healthIssue, $options: 'i' }
    };

    let hospitals = await Hospital.find(query).select('-password');

    // Filter and format results
    const results = hospitals.map(hospital => {
      const matchingServices = hospital.nonSurgeryServices.filter(service =>
        service.healthIssue.toLowerCase().includes(healthIssue.toLowerCase())
      );

      return {
        id: hospital._id,
        name: hospital.name,
        location: hospital.location,
        state: hospital.state,
        district: hospital.district,
        landmark: hospital.landmark,
        establishYear: hospital.establishYear,
        opdCharge: hospital.opdCharge,
        nonSurgeryServices: matchingServices
      };
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital details
router.get('/hospitals/:id', auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select('-password');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book patient appointment (surgery or non-surgery)
router.post('/book-appointment', auth, async (req, res) => {
  try {
    const {
      name,
      age,
      appointmentType,
      surgeryType,
      healthIssue,
      description,
      date,
      weight,
      height,
      address,
      mobileNo,
      emailAddress,
      hospitalId
    } = req.body;

    // Validate required fields
    if (!name || !age || !appointmentType || !address || !mobileNo || !hospitalId) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (appointmentType === 'surgery' && !surgeryType) {
      return res.status(400).json({ message: 'Surgery type is required for surgery appointment' });
    }

    if (appointmentType === 'non-surgery' && !healthIssue) {
      return res.status(400).json({ message: 'Health issue is required for non-surgery appointment' });
    }

    // Get hospital details
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Create patient record
    const patient = new Patient({
      name,
      age,
      appointmentType,
      surgeryType: appointmentType === 'surgery' ? surgeryType : null,
      healthIssue: appointmentType === 'non-surgery' ? healthIssue : null,
      description: description || '',
      date: date || Date.now(),
      weight,
      height,
      address,
      mobileNo,
      emailAddress,
      bookedByUser: req.user.id,
      hospitalName: hospital.name,
      hospitalLocation: hospital.district ? `${hospital.district}, ${hospital.state}` : 'N/A',
      hospitalId: hospital._id
    });

    await patient.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's appointments
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const patients = await Patient.find({ bookedByUser: req.user.id })
      .populate('hospitalId', 'name location')
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

import React, { useState } from 'react';
import { userAPI } from '../api';

function UserDashboard({ user, onLogout }) {
  const [appointmentType, setAppointmentType] = useState('surgery');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    hospitalState: '',
    hospitalDistrict: '',
    minOpdCharge: '',
    maxOpdCharge: '',
    minSurgeryCharge: '',
    maxSurgeryCharge: '',
  });
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [bookingData, setBookingData] = useState({
    name: '',
    age: '',
    appointmentType: 'surgery',
    surgeryType: '',
    healthIssue: '',
    date: '',
    weight: '',
    height: '',
    address: '',
    mobileNo: '',
    emailAddress: '',
    description: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      const typeLabel = appointmentType === 'surgery' ? 'surgery type' : 'health issue';
      setMessage({ type: 'error', text: `Please enter a ${typeLabel} to search` });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      
      if (appointmentType === 'surgery') {
        const params = { surgeryType: searchQuery };
        response = await userAPI.searchHospitals(params);
      } else {
        const params = { healthIssue: searchQuery };
        response = await userAPI.searchNonSurgery(params);
      }
      
      setHospitals(response.data);
      
      if (response.data.length === 0) {
        const typeLabel = appointmentType === 'surgery' ? 'this surgery' : 'this health issue';
        setMessage({ type: 'info', text: `No hospitals found for ${typeLabel}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching hospitals' });
    } finally {
      setLoading(false);
    }
  };

  const openBookingForm = (hospital) => {
    setSelectedHospital(hospital);
    setBookingData({
      ...bookingData,
      appointmentType: appointmentType,
      surgeryType: appointmentType === 'surgery' ? searchQuery : '',
      healthIssue: appointmentType === 'non-surgery' ? searchQuery : '',
    });
    setShowBookingForm(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      hospitalState: '',
      hospitalDistrict: '',
      minOpdCharge: '',
      maxOpdCharge: '',
      minSurgeryCharge: '',
      maxSurgeryCharge: '',
    });
  };

  const getFilteredHospitals = () => {
    let filtered = hospitals;

    // Filter by state (case-insensitive substring match)
    if (filters.hospitalState) {
      filtered = filtered.filter(h =>
        h.state && h.state.toLowerCase().includes(filters.hospitalState.toLowerCase())
      );
    }

    // Filter by district (case-insensitive substring match)
    if (filters.hospitalDistrict) {
      filtered = filtered.filter(h =>
        h.district && h.district.toLowerCase().includes(filters.hospitalDistrict.toLowerCase())
      );
    }

    // Filter by min OPD charge
    if (filters.minOpdCharge) {
      const minOpdValue = parseFloat(filters.minOpdCharge);
      filtered = filtered.filter(h => {
        if (!h.opdCharge || h.opdCharge.length === 0) return true;
        const minOpd = Math.min(...h.opdCharge);
        return minOpd >= minOpdValue;
      });
    }

    // Filter by max OPD charge
    if (filters.maxOpdCharge) {
      const maxOpdValue = parseFloat(filters.maxOpdCharge);
      filtered = filtered.filter(h => {
        if (!h.opdCharge || h.opdCharge.length === 0) return true;
        const maxOpd = Math.max(...h.opdCharge);
        return maxOpd <= maxOpdValue;
      });
    }

    // Filter by min surgery charge
    if (filters.minSurgeryCharge) {
      const minSurgeryValue = parseFloat(filters.minSurgeryCharge);
      filtered = filtered.filter(h => {
        if (!h.surgeries || h.surgeries.length === 0) return true;
        const minPrice = Math.min(...h.surgeries.map(s => s.price));
        return minPrice >= minSurgeryValue;
      });
    }

    // Filter by max surgery charge
    if (filters.maxSurgeryCharge) {
      const maxSurgeryValue = parseFloat(filters.maxSurgeryCharge);
      filtered = filtered.filter(h => {
        if (!h.surgeries || h.surgeries.length === 0) return true;
        const maxPrice = Math.max(...h.surgeries.map(s => s.price));
        return maxPrice <= maxSurgeryValue;
      });
    }

    return filtered;
  };

  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await userAPI.bookAppointment({
        ...bookingData,
        hospitalId: selectedHospital.id,
      });

      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setShowBookingForm(false);
      setBookingData({
        name: '',
        age: '',
        surgeryType: '',
        date: '',
        weight: '',
        height: '',
        address: '',
        mobileNo: '',
        emailAddress: '',
        description: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Booking failed' });
    }
  };

  const loadMyAppointments = async () => {
    try {
      const response = await userAPI.getMyAppointments();
      setMyAppointments(response.data);
      setShowAppointments(true);
      setSelectedAppointment(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading appointments' });
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
  };

  return (
    <div>
      <nav className="navbar">
        <h1>User Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
          <button onClick={loadMyAppointments} className="btn btn-secondary">
            My Appointments
          </button>
          <button onClick={onLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {!showBookingForm && !showAppointments && (
          <>
            <div className="card">
              <h2>Search for Healthcare Services</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginRight: '2rem', fontWeight: 'bold' }}>
                  <input
                    type="radio"
                    name="appointmentType"
                    value="surgery"
                    checked={appointmentType === 'surgery'}
                    onChange={(e) => {
                      setAppointmentType(e.target.value);
                      setSearchQuery('');
                      setHospitals([]);
                      setFilters({
                        hospitalState: '',
                        hospitalDistrict: '',
                        minOpdCharge: '',
                        maxOpdCharge: '',
                        minSurgeryCharge: '',
                        maxSurgeryCharge: '',
                      });
                    }}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Surgery
                </label>
                <label style={{ fontWeight: 'bold' }}>
                  <input
                    type="radio"
                    name="appointmentType"
                    value="non-surgery"
                    checked={appointmentType === 'non-surgery'}
                    onChange={(e) => {
                      setAppointmentType(e.target.value);
                      setSearchQuery('');
                      setHospitals([]);
                      setFilters({
                        hospitalState: '',
                        hospitalDistrict: '',
                        minOpdCharge: '',
                        maxOpdCharge: '',
                        minSurgeryCharge: '',
                        maxSurgeryCharge: '',
                      });
                    }}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Health Consultation
                </label>
              </div>
              
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={appointmentType === 'surgery' ? "Enter surgery type (e.g., Heart Surgery, Knee Replacement)" : "Enter health issue (e.g., Diabetes, Hypertension)"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="btn" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {hospitals.length > 0 && (
              <div className="card">
                <h2>Filter Results</h2>
                
                <div className="filter-section">
                  <div className="filter-group">
                    <div className="filter-item">
                      <label>State</label>
                      <input
                        type="text"
                        name="hospitalState"
                        placeholder="Search state..."
                        value={filters.hospitalState}
                        onChange={handleFilterChange}
                      />
                    </div>

                    <div className="filter-item">
                      <label>District</label>
                      <input
                        type="text"
                        name="hospitalDistrict"
                        placeholder="Search district..."
                        value={filters.hospitalDistrict}
                        onChange={handleFilterChange}
                      />
                    </div>

                    <div className="filter-item">
                      <label>Min OPD Charge (₹)</label>
                      <input
                        type="number"
                        name="minOpdCharge"
                        placeholder="Min"
                        value={filters.minOpdCharge}
                        onChange={handleFilterChange}
                      />
                    </div>

                    <div className="filter-item">
                      <label>Max OPD Charge (₹)</label>
                      <input
                        type="number"
                        name="maxOpdCharge"
                        placeholder="Max"
                        value={filters.maxOpdCharge}
                        onChange={handleFilterChange}
                      />
                    </div>

                    <div className="filter-item">
                      <label>Min Surgery Charge (₹)</label>
                      <input
                        type="number"
                        name="minSurgeryCharge"
                        placeholder="Min"
                        value={filters.minSurgeryCharge}
                        onChange={handleFilterChange}
                      />
                    </div>

                    <div className="filter-item">
                      <label>Max Surgery Charge (₹)</label>
                      <input
                        type="number"
                        name="maxSurgeryCharge"
                        placeholder="Max"
                        value={filters.maxSurgeryCharge}
                        onChange={handleFilterChange}
                      />
                    </div>

                    <div className="filter-item" style={{ display: 'flex', alignItems: 'end' }}>
                      <button onClick={clearFilters} className="btn btn-secondary">
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hospitals.length > 0 && (
              <div className="card">
                <h2>Search Results</h2>
                <div className="grid grid-2">
                  {getFilteredHospitals().map((hospital) => (
                    <div key={hospital.id} className="hospital-card">
                      <h3>{hospital.name}</h3>
                      <p>📍 {hospital.state && hospital.district ? `${hospital.district}, ${hospital.state}` : 'Location not available'}</p>
                      {hospital.landmark && <p>🏢 {hospital.landmark}</p>}
                      <p>� Established: {hospital.establishYear}</p>
                      
                      {hospital.opdCharge && hospital.opdCharge.length > 0 && (
                        <p>💰 OPD Charges: ₹{hospital.opdCharge.join(', ₹')}</p>
                      )}
                      
                      {appointmentType === 'surgery' && hospital.surgeries && (
                        <div style={{ marginTop: '1rem' }}>
                          <strong>Available Surgeries:</strong>
                          {hospital.surgeries.map((surgery, idx) => (
                            <div key={idx} style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '5px' }}>
                              <p><strong>{surgery.surgeryType}</strong></p>
                              <p>Price: ₹{surgery.price}</p>
                              <p>Doctor: {surgery.doctor.name} ({surgery.doctor.degree})</p>
                              <span className={`badge ${surgery.availability ? 'badge-success' : 'badge-danger'}`}>
                                {surgery.availability ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {appointmentType === 'non-surgery' && hospital.nonSurgeryServices && (
                        <div style={{ marginTop: '1rem' }}>
                          <strong>Available Health Consultations:</strong>
                          {hospital.nonSurgeryServices.map((service, idx) => (
                            <div key={idx} style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '5px' }}>
                              <p><strong>{service.healthIssue}</strong></p>
                              <p>Consultation Fee: ₹{service.consultationFee}</p>
                              <p>Doctor: {service.doctor.name} ({service.doctor.degree})</p>
                              <span className={`badge ${service.availability ? 'badge-success' : 'badge-danger'}`}>
                                {service.availability ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button
                        onClick={() => openBookingForm(hospital)}
                        className="btn"
                        style={{ marginTop: '1rem', width: '100%' }}
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showBookingForm && selectedHospital && (
          <div className="card">
            <h2>Book Appointment - {selectedHospital.name}</h2>
            
            <form onSubmit={handleBookingSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={bookingData.name}
                    onChange={handleBookingChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Age <span className="required">*</span></label>
                  <input
                    type="number"
                    name="age"
                    value={bookingData.age}
                    onChange={handleBookingChange}
                    required
                  />
                </div>

                {bookingData.appointmentType === 'surgery' ? (
                  <div className="form-group">
                    <label>Surgery Type <span className="required">*</span></label>
                    <input
                      type="text"
                      name="surgeryType"
                      value={bookingData.surgeryType}
                      onChange={handleBookingChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Health Issue <span className="required">*</span></label>
                    <input
                      type="text"
                      name="healthIssue"
                      value={bookingData.healthIssue}
                      onChange={handleBookingChange}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleBookingChange}
                  />
                </div>

                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={bookingData.weight}
                    onChange={handleBookingChange}
                  />
                </div>

                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={bookingData.height}
                    onChange={handleBookingChange}
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={bookingData.mobileNo}
                    onChange={handleBookingChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={bookingData.emailAddress}
                    onChange={handleBookingChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address <span className="required">*</span></label>
                <textarea
                  name="address"
                  value={bookingData.address}
                  onChange={handleBookingChange}
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Description / Additional Notes</label>
                <textarea
                  name="description"
                  placeholder="Describe your symptoms, medical history, or any additional information for the doctor..."
                  value={bookingData.description}
                  onChange={handleBookingChange}
                  rows="4"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  Submit Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showAppointments && !selectedAppointment && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>My Appointments</h2>
              <button onClick={() => setShowAppointments(false)} className="btn btn-secondary">
                Back to Search
              </button>
            </div>
            
            {myAppointments.length === 0 ? (
              <p>No appointments found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Hospital</th>
                    <th>Surgery Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Surgery Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.name}</td>
                      <td>{appointment.hospitalName}</td>
                      <td>{appointment.surgeryType}</td>
                      <td>{new Date(appointment.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          appointment.approvedForSurgery === 'approved' ? 'badge-success' :
                          appointment.approvedForSurgery === 'rejected' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {appointment.approvedForSurgery}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${appointment.surgeryDone ? 'badge-success' : 'badge-warning'}`}>
                          {appointment.surgeryDone ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewAppointment(appointment)}
                          className="btn btn-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selectedAppointment && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Appointment Details</h2>
              <button onClick={() => setSelectedAppointment(null)} className="btn btn-secondary">
                Back to List
              </button>
            </div>

            <div className="patient-details">
              <h3>Patient Information</h3>
              <div className="grid grid-2">
                <p><strong>Name:</strong> {selectedAppointment.name}</p>
                <p><strong>Age:</strong> {selectedAppointment.age}</p>
                <p><strong>Surgery Type:</strong> {selectedAppointment.surgeryType}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                <p><strong>Weight:</strong> {selectedAppointment.weight || 'N/A'} kg</p>
                <p><strong>Height:</strong> {selectedAppointment.height || 'N/A'} cm</p>
                <p><strong>Mobile:</strong> {selectedAppointment.mobileNo}</p>
                <p><strong>Email:</strong> {selectedAppointment.emailAddress || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedAppointment.address}</p>
              </div>

              {selectedAppointment.description && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
                  <h3>Description / Notes</h3>
                  <p>{selectedAppointment.description}</p>
                </div>
              )}

              <h3 style={{ marginTop: '1.5rem' }}>Hospital Information</h3>
              <div className="grid grid-2">
                <p><strong>Hospital:</strong> {selectedAppointment.hospitalName}</p>
                <p><strong>Location:</strong> {selectedAppointment.hospitalLocation}</p>
                {selectedAppointment.surgeryDoneBy && (
                  <p><strong>Surgery Done By:</strong> {selectedAppointment.surgeryDoneBy}</p>
                )}
              </div>

              <h3 style={{ marginTop: '1.5rem' }}>Status</h3>
              <div className="grid grid-2">
                <p>
                  <strong>Approval Status:</strong>{' '}
                  <span className={`badge ${
                    selectedAppointment.approvedForSurgery === 'approved' ? 'badge-success' :
                    selectedAppointment.approvedForSurgery === 'rejected' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {selectedAppointment.approvedForSurgery}
                  </span>
                </p>
                <p>
                  <strong>Surgery Status:</strong>{' '}
                  <span className={`badge ${selectedAppointment.surgeryDone ? 'badge-success' : 'badge-warning'}`}>
                    {selectedAppointment.surgeryDone ? 'Completed' : 'Pending'}
                  </span>
                </p>
              </div>

              {selectedAppointment.comments && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e8f4f8', borderRadius: '5px', borderLeft: '4px solid #007bff' }}>
                  <h3>Hospital Feedback & Comments</h3>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>{selectedAppointment.comments}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;

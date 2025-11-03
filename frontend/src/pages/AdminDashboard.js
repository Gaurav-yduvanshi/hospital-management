import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [filters, setFilters] = useState({
    hospitalId: '',
    surgeryDone: '',
    approvedForSurgery: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  const [hospitalFormData, setHospitalFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: 'India',
    state: '',
    district: '',
    landmark: '',
    establishYear: '',
    opdCharge: '',
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    } else if (activeTab === 'hospitals') {
      loadHospitals();
    } else if (activeTab === 'patients') {
      loadPatients();
    } else if (activeTab === 'users') {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading dashboard stats' });
    }
  };

  const loadHospitals = async () => {
    try {
      const response = await adminAPI.getHospitals();
      setHospitals(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading hospitals' });
    }
  };

  const loadPatients = async () => {
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const response = await adminAPI.getPatients(params);
      setPatients(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading patients' });
    }
  };

  const loadUsers = async () => {
    try {
      const params = {};
      if (filters.hospitalId) params.hospitalId = filters.hospitalId;
      if (filters.surgeryDone) params.surgeryDone = filters.surgeryDone;
      if (filters.approvedForSurgery) params.approvedForSurgery = filters.approvedForSurgery;

      const response = await adminAPI.getUsers(params);
      setUsers(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading users' });
    }
  };

  const viewHospitalDetails = async (hospitalId) => {
    try {
      const response = await adminAPI.getHospital(hospitalId);
      setSelectedHospital(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading hospital details' });
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const response = await adminAPI.getPatient(patientId);
      setSelectedPatient(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading patient details' });
    }
  };

  const handleHospitalFormChange = (e) => {
    const { name, value } = e.target;
    setHospitalFormData({
      ...hospitalFormData,
      [name]: value,
    });
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const submitData = {
        ...hospitalFormData,
        establishYear: parseInt(hospitalFormData.establishYear),
        opdCharge: hospitalFormData.opdCharge ? hospitalFormData.opdCharge.split(',').map(c => parseFloat(c.trim())) : [],
      };

      if (editingHospital) {
        await adminAPI.updateHospital(editingHospital._id, submitData);
        setMessage({ type: 'success', text: 'Hospital updated successfully' });
      } else {
        await adminAPI.createHospital(submitData);
        setMessage({ type: 'success', text: 'Hospital created successfully' });
      }

      loadHospitals();
      setShowHospitalForm(false);
      setEditingHospital(null);
      resetHospitalForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
    }
  };

  const resetHospitalForm = () => {
    setHospitalFormData({
      name: '',
      email: '',
      password: '',
      country: 'India',
      state: '',
      district: '',
      landmark: '',
      establishYear: '',
      opdCharge: '',
    });
  };

  const handleEditHospital = (hospital) => {
    setEditingHospital(hospital);
    setHospitalFormData({
      name: hospital.name,
      email: hospital.email,
      password: '',
      country: hospital.country || 'India',
      state: hospital.state || '',
      district: hospital.district || '',
      landmark: hospital.landmark || '',
      establishYear: hospital.establishYear.toString(),
      opdCharge: hospital.opdCharge.join(', '),
    });
    setShowHospitalForm(true);
  };

  const handleDeleteHospital = async (hospitalId) => {
    if (window.confirm('Are you sure you want to delete this hospital? This will also delete all associated patients.')) {
      try {
        await adminAPI.deleteHospital(hospitalId);
        setMessage({ type: 'success', text: 'Hospital deleted successfully' });
        loadHospitals();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting hospital' });
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
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

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`btn ${activeTab === 'dashboard' ? '' : 'btn-secondary'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`btn ${activeTab === 'hospitals' ? '' : 'btn-secondary'}`}
            >
              Hospitals
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`btn ${activeTab === 'patients' ? '' : 'btn-secondary'}`}
            >
              Patients
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`btn ${activeTab === 'users' ? '' : 'btn-secondary'}`}
            >
              Users
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <>
              <h2>Dashboard Statistics</h2>
              <div className="grid grid-3" style={{ marginTop: '2rem' }}>
                <div className="stats-card">
                  <h3>{stats.totalHospitals || 0}</h3>
                  <p>Total Hospitals</p>
                </div>
                <div className="stats-card">
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stats-card">
                  <h3>{stats.totalPatients || 0}</h3>
                  <p>Total Patients</p>
                </div>
                <div className="stats-card">
                  <h3>{stats.surgeriesDone || 0}</h3>
                  <p>Surgeries Completed</p>
                </div>
                <div className="stats-card">
                  <h3>{stats.pendingSurgeries || 0}</h3>
                  <p>Pending Surgeries</p>
                </div>
                <div className="stats-card">
                  <h3>{stats.approvedPatients || 0}</h3>
                  <p>Approved Patients</p>
                </div>
                <div className="stats-card">
                  <h3>{stats.rejectedPatients || 0}</h3>
                  <p>Rejected Patients</p>
                </div>
                <div className="stats-card">
                  <h3>{stats.pendingApprovals || 0}</h3>
                  <p>Pending Approvals</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'hospitals' && !selectedHospital && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <h2>Hospital Management</h2>
                <div>
                  <a 
                    href="/hospital/signup" 
                    className="btn btn-success"
                    style={{ marginRight: '0.5rem', display: 'inline-block', textDecoration: 'none' }}
                  >
                    Register New Hospital
                  </a>
                  <button
                    onClick={() => {
                      setShowHospitalForm(!showHospitalForm);
                      setEditingHospital(null);
                      resetHospitalForm();
                    }}
                    className="btn btn-success"
                  >
                    {showHospitalForm ? 'Cancel' : 'Add Hospital'}
                  </button>
                </div>
              </div>

              {showHospitalForm && (
                <div className="card" style={{ background: '#f8f9fa', marginBottom: '2rem' }}>
                  <h3>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</h3>
                  <form onSubmit={handleHospitalSubmit}>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label>Hospital Name <span className="required">*</span></label>
                        <input
                          type="text"
                          name="name"
                          value={hospitalFormData.name}
                          onChange={handleHospitalFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={hospitalFormData.email}
                          onChange={handleHospitalFormChange}
                          required
                        />
                      </div>

                      {!editingHospital && (
                        <div className="form-group">
                          <label>Password <span className="required">*</span></label>
                          <input
                            type="password"
                            name="password"
                            value={hospitalFormData.password}
                            onChange={handleHospitalFormChange}
                            required
                            minLength="6"
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label>Establish Year <span className="required">*</span></label>
                        <input
                          type="number"
                          name="establishYear"
                          value={hospitalFormData.establishYear}
                          onChange={handleHospitalFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Country <span className="required">*</span></label>
                        <input
                          type="text"
                          name="country"
                          value={hospitalFormData.country}
                          disabled
                          style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        />
                      </div>

                      <div className="form-group">
                        <label>State/Union Territory <span className="required">*</span></label>
                        <input
                          type="text"
                          name="state"
                          value={hospitalFormData.state}
                          onChange={handleHospitalFormChange}
                          required
                          placeholder="e.g., Maharashtra"
                        />
                      </div>

                      <div className="form-group">
                        <label>District <span className="required">*</span></label>
                        <input
                          type="text"
                          name="district"
                          value={hospitalFormData.district}
                          onChange={handleHospitalFormChange}
                          required
                          placeholder="e.g., Mumbai"
                        />
                      </div>

                      <div className="form-group">
                        <label>Landmark/Location Details</label>
                        <input
                          type="text"
                          name="landmark"
                          value={hospitalFormData.landmark}
                          onChange={handleHospitalFormChange}
                          placeholder="e.g., Near City Hospital, Main Road"
                        />
                      </div>

                      <div className="form-group">
                        <label>OPD Charges (comma separated)</label>
                        <input
                          type="text"
                          name="opdCharge"
                          value={hospitalFormData.opdCharge}
                          onChange={handleHospitalFormChange}
                          placeholder="e.g., 500, 1000, 1500"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-success">
                      {editingHospital ? 'Update Hospital' : 'Create Hospital'}
                    </button>
                  </form>
                </div>
              )}

              {hospitals.length === 0 ? (
                <p>No hospitals found</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Landmark</th>
                      <th>Established</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.map((hospital) => (
                      <tr key={hospital._id}>
                        <td>{hospital.name}</td>
                        <td>{hospital.district ? `${hospital.district}, ${hospital.state}` : 'N/A'}</td>
                        <td>{hospital.landmark ? `${hospital.landmark}` : 'N/A'}</td>
                        <td>{hospital.establishYear}</td>
                        <td>{hospital.email}</td>
                        <td>
                          <button
                            onClick={() => viewHospitalDetails(hospital._id)}
                            className="btn"
                            style={{ marginRight: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditHospital(hospital)}
                            className="btn btn-warning"
                            style={{ marginRight: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHospital(hospital._id)}
                            className="btn btn-danger"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {selectedHospital && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Hospital Details</h2>
                <button onClick={() => setSelectedHospital(null)} className="btn btn-secondary">
                  Back to List
                </button>
              </div>

              <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
                <div>
                  <p><strong>Name:</strong> {selectedHospital.name}</p>
                  <p><strong>Email:</strong> {selectedHospital.email}</p>
                  <p><strong>Location:</strong> {selectedHospital.district ? `${selectedHospital.district}, ${selectedHospital.state}` : 'N/A'}</p>
                  <p><strong>Landmark:</strong> {selectedHospital.landmark || 'N/A'}</p>
                  <p><strong>Established:</strong> {selectedHospital.establishYear}</p>
                </div>
                <div>
                  <p><strong>OPD Charges:</strong> {selectedHospital.opdCharge.length > 0 ? `₹${selectedHospital.opdCharge.join(', ₹')}` : 'N/A'}</p>
                  {selectedHospital.stats && (
                    <>
                      <p><strong>Total Patients:</strong> {selectedHospital.stats.totalPatients}</p>
                      <p><strong>Surgeries Done:</strong> {selectedHospital.stats.surgeriesDone}</p>
                      <p><strong>Approved Patients:</strong> {selectedHospital.stats.approved}</p>
                    </>
                  )}
                </div>
              </div>

              {selectedHospital.surgeries && selectedHospital.surgeries.length > 0 && (
                <>
                  <h3>Available Surgeries</h3>
                  <table style={{ marginTop: '1rem' }}>
                    <thead>
                      <tr>
                        <th>Surgery Type</th>
                        <th>Price</th>
                        <th>Doctor</th>
                        <th>Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHospital.surgeries.map((surgery, idx) => (
                        <tr key={idx}>
                          <td>{surgery.surgeryType}</td>
                          <td>₹{surgery.price}</td>
                          <td>{surgery.doctor.name} ({surgery.doctor.degree})</td>
                          <td>
                            <span className={`badge ${surgery.availability ? 'badge-success' : 'badge-danger'}`}>
                              {surgery.availability ? 'Available' : 'Not Available'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {activeTab === 'patients' && !selectedPatient && (
            <>
              <h2>Patient Management</h2>

              <div className="filter-section">
                <div className="filter-group">
                  <div className="filter-item">
                    <label>Hospital</label>
                    <select name="hospitalId" value={filters.hospitalId} onChange={handleFilterChange}>
                      <option value="">All Hospitals</option>
                      {hospitals.map(h => (
                        <option key={h._id} value={h._id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-item">
                    <label>Surgery Status</label>
                    <select name="surgeryDone" value={filters.surgeryDone} onChange={handleFilterChange}>
                      <option value="">All</option>
                      <option value="true">Done</option>
                      <option value="false">Not Done</option>
                    </select>
                  </div>

                  <div className="filter-item">
                    <label>Approval Status</label>
                    <select name="approvedForSurgery" value={filters.approvedForSurgery} onChange={handleFilterChange}>
                      <option value="">All</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="filter-item">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="filter-item">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="filter-item">
                    <label>Search (Semantic)</label>
                    <input
                      type="text"
                      name="search"
                      placeholder="Search patients..."
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="filter-item" style={{ display: 'flex', alignItems: 'end' }}>
                    <button onClick={loadPatients} className="btn">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>

              {patients.length === 0 ? (
                <p>No patients found</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Hospital</th>
                      <th>Surgery</th>
                      <th>Date</th>
                      <th>Approval</th>
                      <th>Surgery Done</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td>{patient.name}</td>
                        <td>{patient.hospitalId?.name || patient.hospitalName}</td>
                        <td>{patient.surgeryType}</td>
                        <td>{new Date(patient.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${
                            patient.approvedForSurgery === 'approved' ? 'badge-success' :
                            patient.approvedForSurgery === 'rejected' ? 'badge-danger' :
                            'badge-warning'
                          }`}>
                            {patient.approvedForSurgery}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${patient.surgeryDone ? 'badge-success' : 'badge-warning'}`}>
                            {patient.surgeryDone ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => viewPatientDetails(patient._id)}
                            className="btn"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {selectedPatient && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Patient Details</h2>
                <button onClick={() => setSelectedPatient(null)} className="btn btn-secondary">
                  Back to List
                </button>
              </div>

              <div className="grid grid-2">
                <div>
                  <p><strong>Name:</strong> {selectedPatient.name}</p>
                  <p><strong>Age:</strong> {selectedPatient.age}</p>
                  <p><strong>Surgery Type:</strong> {selectedPatient.surgeryType}</p>
                  <p><strong>Date:</strong> {new Date(selectedPatient.date).toLocaleDateString()}</p>
                  <p><strong>Weight:</strong> {selectedPatient.weight || 'N/A'} kg</p>
                  <p><strong>Height:</strong> {selectedPatient.height || 'N/A'} cm</p>
                  <p><strong>Mobile:</strong> {selectedPatient.mobileNo}</p>
                  <p><strong>Email:</strong> {selectedPatient.emailAddress || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedPatient.address}</p>
                </div>
                <div>
                  <p><strong>Hospital:</strong> {selectedPatient.hospitalId?.name || selectedPatient.hospitalName}</p>
                  <p><strong>Hospital Location:</strong> {selectedPatient.hospitalLocation}</p>
                  <p><strong>Surgery Done By:</strong> {selectedPatient.surgeryDoneBy || 'N/A'}</p>
                  <p><strong>Booked By:</strong> {selectedPatient.bookedByUser?.name || 'N/A'} ({selectedPatient.bookedByUser?.email || 'N/A'})</p>
                  <p>
                    <strong>Approval Status:</strong>{' '}
                    <span className={`badge ${
                      selectedPatient.approvedForSurgery === 'approved' ? 'badge-success' :
                      selectedPatient.approvedForSurgery === 'rejected' ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {selectedPatient.approvedForSurgery}
                    </span>
                  </p>
                  <p>
                    <strong>Surgery Status:</strong>{' '}
                    <span className={`badge ${selectedPatient.surgeryDone ? 'badge-success' : 'badge-warning'}`}>
                      {selectedPatient.surgeryDone ? 'Completed' : 'Pending'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <>
              <h2>User Management</h2>

              <div className="filter-section">
                <div className="filter-group">
                  <div className="filter-item">
                    <label>Filter by Hospital</label>
                    <select name="hospitalId" value={filters.hospitalId} onChange={handleFilterChange}>
                      <option value="">All Hospitals</option>
                      {hospitals.map(h => (
                        <option key={h._id} value={h._id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-item">
                    <label>Surgery Status</label>
                    <select name="surgeryDone" value={filters.surgeryDone} onChange={handleFilterChange}>
                      <option value="">All</option>
                      <option value="true">Done</option>
                      <option value="false">Not Done</option>
                    </select>
                  </div>

                  <div className="filter-item">
                    <label>Approval Status</label>
                    <select name="approvedForSurgery" value={filters.approvedForSurgery} onChange={handleFilterChange}>
                      <option value="">All</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="filter-item" style={{ display: 'flex', alignItems: 'end' }}>
                    <button onClick={loadUsers} className="btn">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>

              {users.length === 0 ? (
                <p>No users found</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="badge badge-info">
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

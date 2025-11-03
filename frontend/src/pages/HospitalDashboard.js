import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../api';

function HospitalDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('surgeries');
  const [surgeries, setSurgeries] = useState([]);
  const [healthIssues, setHealthIssues] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showSurgeryForm, setShowSurgeryForm] = useState(false);
  const [showHealthIssueForm, setShowHealthIssueForm] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState(null);
  const [editingHealthIssue, setEditingHealthIssue] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingComments, setEditingComments] = useState(false);
  const [commentsText, setCommentsText] = useState('');

  const [surgeryFormData, setSurgeryFormData] = useState({
    surgeryType: '',
    price: '',
    availability: true,
    doctor: {
      name: '',
      degree: '',
    },
  });

  const [healthIssueFormData, setHealthIssueFormData] = useState({
    healthIssue: '',
    consultationFee: '',
    availability: true,
    doctor: {
      name: '',
      degree: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'patients') {
      loadPatients();
    } else if (activeTab === 'surgeries') {
      loadProfile();
    } else if (activeTab === 'health-issues') {
      loadProfile();
    }
  }, [activeTab, filterStatus, searchQuery]);

  const loadProfile = async () => {
    try {
      const response = await hospitalAPI.getProfile();
      setSurgeries(response.data.surgeries || []);
      setHealthIssues(response.data.nonSurgeryServices || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading profile' });
    }
  };

  const loadPatients = async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterStatus) params.status = filterStatus;

      const response = await hospitalAPI.getPatients(params);
      setPatients(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading patients' });
    }
  };

  const handleSurgeryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('doctor.')) {
      const field = name.split('.')[1];
      setSurgeryFormData({
        ...surgeryFormData,
        doctor: {
          ...surgeryFormData.doctor,
          [field]: value,
        },
      });
    } else {
      setSurgeryFormData({
        ...surgeryFormData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSurgerySubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const submitData = {
        ...surgeryFormData,
        price: parseFloat(surgeryFormData.price),
      };

      if (editingSurgery) {
        await hospitalAPI.updateSurgery(editingSurgery._id, submitData);
        setMessage({ type: 'success', text: 'Surgery updated successfully' });
      } else {
        await hospitalAPI.addSurgery(submitData);
        setMessage({ type: 'success', text: 'Surgery added successfully' });
      }

      loadProfile();
      setShowSurgeryForm(false);
      setEditingSurgery(null);
      resetSurgeryForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
    }
  };

  const resetSurgeryForm = () => {
    setSurgeryFormData({
      surgeryType: '',
      price: '',
      availability: true,
      doctor: {
        name: '',
        degree: '',
      },
    });
  };

  const handleHealthIssueFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('doctor.')) {
      const field = name.split('.')[1];
      setHealthIssueFormData({
        ...healthIssueFormData,
        doctor: {
          ...healthIssueFormData.doctor,
          [field]: value,
        },
      });
    } else {
      setHealthIssueFormData({
        ...healthIssueFormData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleHealthIssueSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const submitData = {
        ...healthIssueFormData,
        consultationFee: parseFloat(healthIssueFormData.consultationFee),
      };

      if (editingHealthIssue) {
        await hospitalAPI.updateHealthIssue(editingHealthIssue._id, submitData);
        setMessage({ type: 'success', text: 'Health issue updated successfully' });
      } else {
        await hospitalAPI.addHealthIssue(submitData);
        setMessage({ type: 'success', text: 'Health issue added successfully' });
      }

      loadProfile();
      setShowHealthIssueForm(false);
      setEditingHealthIssue(null);
      resetHealthIssueForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
    }
  };

  const resetHealthIssueForm = () => {
    setHealthIssueFormData({
      healthIssue: '',
      consultationFee: '',
      availability: true,
      doctor: {
        name: '',
        degree: '',
      },
    });
  };

  const handleEditHealthIssue = (healthIssue) => {
    setEditingHealthIssue(healthIssue);
    setHealthIssueFormData({
      healthIssue: healthIssue.healthIssue,
      consultationFee: healthIssue.consultationFee.toString(),
      availability: healthIssue.availability,
      doctor: healthIssue.doctor,
    });
    setShowHealthIssueForm(true);
  };

  const handleDeleteHealthIssue = async (healthIssueId) => {
    if (window.confirm('Are you sure you want to delete this health issue?')) {
      try {
        await hospitalAPI.deleteHealthIssue(healthIssueId);
        setMessage({ type: 'success', text: 'Health issue deleted successfully' });
        loadProfile();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting health issue' });
      }
    }
  };

  const handleEditSurgery = (surgery) => {
    setEditingSurgery(surgery);
    setSurgeryFormData({
      surgeryType: surgery.surgeryType,
      price: surgery.price.toString(),
      availability: surgery.availability,
      doctor: surgery.doctor,
    });
    setShowSurgeryForm(true);
  };

  const handleDeleteSurgery = async (surgeryId) => {
    if (window.confirm('Are you sure you want to delete this surgery?')) {
      try {
        await hospitalAPI.deleteSurgery(surgeryId);
        setMessage({ type: 'success', text: 'Surgery deleted successfully' });
        loadProfile();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting surgery' });
      }
    }
  };

  const handleApprovalChange = async (patientId, status) => {
    try {
      await hospitalAPI.updateApproval(patientId, { approvedForSurgery: status });
      setMessage({ type: 'success', text: 'Approval status updated' });
      loadPatients();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating approval status' });
    }
  };

  const handleSurgeryStatusChange = async (patientId, done) => {
    try {
      const doctorName = done ? prompt('Enter doctor name who performed the surgery:') : '';
      await hospitalAPI.updateSurgeryStatus(patientId, {
        surgeryDone: done,
        surgeryDoneBy: doctorName || '',
      });
      setMessage({ type: 'success', text: 'Surgery status updated' });
      loadPatients();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating surgery status' });
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const response = await hospitalAPI.getPatient(patientId);
      setSelectedPatient(response.data);
      setCommentsText(response.data.comments || '');
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading patient details' });
    }
  };

  const handleSaveComments = async () => {
    try {
      await hospitalAPI.updatePatientComments(selectedPatient._id, { comments: commentsText });
      setMessage({ type: 'success', text: 'Comments saved successfully' });
      setEditingComments(false);
      viewPatientDetails(selectedPatient._id);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving comments' });
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Hospital Dashboard</h1>
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
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setActiveTab('surgeries')}
              className={`btn ${activeTab === 'surgeries' ? '' : 'btn-secondary'}`}
            >
              Manage Surgeries
            </button>
            <button
              onClick={() => setActiveTab('health-issues')}
              className={`btn ${activeTab === 'health-issues' ? '' : 'btn-secondary'}`}
            >
              Manage Health Issues
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`btn ${activeTab === 'patients' ? '' : 'btn-secondary'}`}
            >
              Manage Patients
            </button>
          </div>

          {activeTab === 'surgeries' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Surgeries</h2>
                <button
                  onClick={() => {
                    setShowSurgeryForm(!showSurgeryForm);
                    setEditingSurgery(null);
                    resetSurgeryForm();
                  }}
                  className="btn btn-success"
                >
                  {showSurgeryForm ? 'Cancel' : 'Add Surgery'}
                </button>
              </div>

              {showSurgeryForm && (
                <div className="card" style={{ background: '#f8f9fa', marginBottom: '2rem' }}>
                  <h3>{editingSurgery ? 'Edit Surgery' : 'Add New Surgery'}</h3>
                  <form onSubmit={handleSurgerySubmit}>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label>Surgery Type <span className="required">*</span></label>
                        <input
                          type="text"
                          name="surgeryType"
                          value={surgeryFormData.surgeryType}
                          onChange={handleSurgeryFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Price <span className="required">*</span></label>
                        <input
                          type="number"
                          name="price"
                          value={surgeryFormData.price}
                          onChange={handleSurgeryFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Doctor Name <span className="required">*</span></label>
                        <input
                          type="text"
                          name="doctor.name"
                          value={surgeryFormData.doctor.name}
                          onChange={handleSurgeryFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Doctor Degree <span className="required">*</span></label>
                        <input
                          type="text"
                          name="doctor.degree"
                          value={surgeryFormData.doctor.degree}
                          onChange={handleSurgeryFormChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          name="availability"
                          checked={surgeryFormData.availability}
                          onChange={handleSurgeryFormChange}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Available
                      </label>
                    </div>

                    <button type="submit" className="btn btn-success">
                      {editingSurgery ? 'Update Surgery' : 'Add Surgery'}
                    </button>
                  </form>
                </div>
              )}

              {surgeries.length === 0 ? (
                <p>No surgeries added yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Surgery Type</th>
                      <th>Price</th>
                      <th>Doctor</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surgeries.map((surgery) => (
                      <tr key={surgery._id}>
                        <td>{surgery.surgeryType}</td>
                        <td>₹{surgery.price}</td>
                        <td>{surgery.doctor.name} ({surgery.doctor.degree})</td>
                        <td>
                          <span className={`badge ${surgery.availability ? 'badge-success' : 'badge-danger'}`}>
                            {surgery.availability ? 'Available' : 'Not Available'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleEditSurgery(surgery)}
                            className="btn btn-warning"
                            style={{ marginRight: '0.5rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSurgery(surgery._id)}
                            className="btn btn-danger"
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

          {activeTab === 'health-issues' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Health Issues/Consultations</h2>
                <button
                  onClick={() => {
                    setShowHealthIssueForm(!showHealthIssueForm);
                    setEditingHealthIssue(null);
                    resetHealthIssueForm();
                  }}
                  className="btn btn-success"
                >
                  {showHealthIssueForm ? 'Cancel' : 'Add Health Issue'}
                </button>
              </div>

              {showHealthIssueForm && (
                <div className="card" style={{ background: '#f8f9fa', marginBottom: '2rem' }}>
                  <h3>{editingHealthIssue ? 'Edit Health Issue' : 'Add New Health Issue'}</h3>
                  <form onSubmit={handleHealthIssueSubmit}>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label>Health Issue <span className="required">*</span></label>
                        <input
                          type="text"
                          name="healthIssue"
                          value={healthIssueFormData.healthIssue}
                          onChange={handleHealthIssueFormChange}
                          placeholder="e.g., Diabetes Consultation, Heart Checkup"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Consultation Fee <span className="required">*</span></label>
                        <input
                          type="number"
                          name="consultationFee"
                          value={healthIssueFormData.consultationFee}
                          onChange={handleHealthIssueFormChange}
                          placeholder="Enter consultation fee"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Doctor Name <span className="required">*</span></label>
                        <input
                          type="text"
                          name="doctor.name"
                          value={healthIssueFormData.doctor.name}
                          onChange={handleHealthIssueFormChange}
                          placeholder="Enter doctor name"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Doctor Degree <span className="required">*</span></label>
                        <input
                          type="text"
                          name="doctor.degree"
                          value={healthIssueFormData.doctor.degree}
                          onChange={handleHealthIssueFormChange}
                          placeholder="e.g., MD, MBBS, DM"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            name="availability"
                            checked={healthIssueFormData.availability}
                            onChange={handleHealthIssueFormChange}
                          />
                          {' '}Available
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-success">
                      {editingHealthIssue ? 'Update Health Issue' : 'Add Health Issue'}
                    </button>
                  </form>
                </div>
              )}

              {healthIssues.length === 0 ? (
                <p>No health issues added yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Health Issue</th>
                      <th>Consultation Fee</th>
                      <th>Doctor</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthIssues.map((healthIssue) => (
                      <tr key={healthIssue._id}>
                        <td>{healthIssue.healthIssue}</td>
                        <td>₹{healthIssue.consultationFee}</td>
                        <td>{healthIssue.doctor.name} ({healthIssue.doctor.degree})</td>
                        <td>
                          <span className={`badge ${healthIssue.availability ? 'badge-success' : 'badge-danger'}`}>
                            {healthIssue.availability ? 'Available' : 'Not Available'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleEditHealthIssue(healthIssue)}
                            className="btn btn-warning"
                            style={{ marginRight: '0.5rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHealthIssue(healthIssue._id)}
                            className="btn btn-danger"
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

          {activeTab === 'patients' && !selectedPatient && (
            <>
              <h2>Patient Management</h2>

              <div className="filter-section">
                <div className="filter-group">
                  <div className="filter-item">
                    <label>Search Patients (Semantic Search)</label>
                    <input
                      type="text"
                      placeholder="Search by name, surgery, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="filter-item">
                    <label>Status</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="">All</option>
                      <option value="done">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="filter-item" style={{ display: 'flex', alignItems: 'end' }}>
                    <button onClick={loadPatients} className="btn">
                      Search
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
                      <th>Age</th>
                      <th>Type</th>
                      <th>Mobile</th>
                      <th>Approval</th>
                      <th>{filterStatus === 'done' || filterStatus === 'pending' ? (patients.length > 0 && patients[0].appointmentType === 'non-surgery' ? 'Consulted with Doctor' : 'Surgery Done') : 'Status'}</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td>{patient.name}</td>
                        <td>{patient.age}</td>
                        <td>{patient.appointmentType === 'surgery' ? patient.surgeryType : patient.healthIssue}</td>
                        <td>{patient.mobileNo}</td>
                        <td>
                          <select
                            value={patient.approvedForSurgery}
                            onChange={(e) => handleApprovalChange(patient._id, e.target.value)}
                            className="badge"
                            style={{ padding: '0.5rem' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleSurgeryStatusChange(patient._id, !patient.surgeryDone)}
                            className={`btn ${patient.surgeryDone ? 'btn-success' : 'btn-warning'}`}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            {patient.appointmentType === 'non-surgery' ? (patient.surgeryDone ? 'Consulted' : 'Not Consulted') : (patient.surgeryDone ? 'Mark Undone' : 'Mark Done')}
                          </button>
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
                  <p><strong>Appointment Type:</strong> {selectedPatient.appointmentType === 'surgery' ? 'Surgery' : 'Health Consultation'}</p>
                  <p><strong>{selectedPatient.appointmentType === 'surgery' ? 'Surgery Type' : 'Health Issue'}:</strong> {selectedPatient.appointmentType === 'surgery' ? selectedPatient.surgeryType : selectedPatient.healthIssue}</p>
                  <p><strong>Date:</strong> {new Date(selectedPatient.date).toLocaleDateString()}</p>
                  <p><strong>Weight:</strong> {selectedPatient.weight || 'N/A'} kg</p>
                  <p><strong>Height:</strong> {selectedPatient.height || 'N/A'} cm</p>
                </div>
                <div>
                  <p><strong>Mobile:</strong> {selectedPatient.mobileNo}</p>
                  <p><strong>Email:</strong> {selectedPatient.emailAddress || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedPatient.address}</p>
                  {selectedPatient.appointmentType === 'surgery' && (
                    <p><strong>Surgery Done By:</strong> {selectedPatient.surgeryDoneBy || 'N/A'}</p>
                  )}
                  {selectedPatient.description && (
                    <p><strong>Patient Notes:</strong> {selectedPatient.description}</p>
                  )}
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
                    <strong>{selectedPatient.appointmentType === 'surgery' ? 'Surgery Status' : 'Consultation Status'}:</strong>{' '}
                    <span className={`badge ${selectedPatient.surgeryDone ? 'badge-success' : 'badge-warning'}`}>
                      {selectedPatient.appointmentType === 'surgery' ? (selectedPatient.surgeryDone ? 'Completed' : 'Pending') : (selectedPatient.surgeryDone ? 'Consulted with Doctor' : 'Not Consulted')}
                    </span>
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '0.5rem', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Hospital Comments & Feedback</h3>
                  {!editingComments && (
                    <button onClick={() => setEditingComments(true)} className="btn">
                      Edit Comments
                    </button>
                  )}
                </div>

                {editingComments ? (
                  <div>
                    <textarea
                      value={commentsText}
                      onChange={(e) => setCommentsText(e.target.value)}
                      placeholder="Add comments, feedback, or notes about this patient appointment..."
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '2px solid #007bff',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button onClick={handleSaveComments} className="btn btn-success">
                        Save Comments
                      </button>
                      <button 
                        onClick={() => {
                          setEditingComments(false);
                          setCommentsText(selectedPatient.comments || '');
                        }} 
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#fff',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    minHeight: '100px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {commentsText ? commentsText : <em style={{ color: '#999' }}>No comments added yet. Click "Edit Comments" to add feedback.</em>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalDashboard;

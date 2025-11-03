import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import HospitalLogin from './pages/HospitalLogin';
import HospitalSignup from './pages/HospitalSignup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');

    if (token && userData) {
      setUser({ ...JSON.parse(userData), type: userType });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token, type) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
    setUser({ ...userData, type });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Helper function to get dashboard path based on user type
  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.type === 'user' && user.role === 'admin') return '/admin/dashboard';
    if (user.type === 'hospital') return '/hospital/dashboard';
    if (user.type === 'user') return '/user/dashboard';
    return '/';
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing page - redirect if logged in */}
          <Route 
            path="/" 
            element={user ? <Navigate to={getDashboardPath()} /> : <HomePage />} 
          />
          
          {/* User routes - redirect if logged in */}
          <Route 
            path="/user/login" 
            element={user ? <Navigate to={getDashboardPath()} /> : <UserLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/user/signup" 
            element={user ? <Navigate to={getDashboardPath()} /> : <UserSignup onLogin={handleLogin} />} 
          />
          
          {/* Admin routes - Secret URLs */}
          <Route 
            path="/gkyskyadsp8956awm/login" 
            element={user ? <Navigate to={getDashboardPath()} /> : <AdminLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/sachinmsdhoni1234xyzvgss/signup" 
            element={user ? <Navigate to={getDashboardPath()} /> : <AdminSignup onLogin={handleLogin} />} 
          />
          
          {/* Old admin routes redirect to home */}
          <Route path="/admin/login" element={<Navigate to="/" />} />
          <Route path="/admin/signup" element={<Navigate to="/" />} />
          
          {/* Hospital routes - Admin only signup */}
          <Route 
            path="/hospital/login" 
            element={user ? <Navigate to={getDashboardPath()} /> : <HospitalLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/hospital/signup" 
            element={
              user && user.type === 'user' && user.role === 'admin' ? (
                <HospitalSignup onLogin={handleLogin} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          
          <Route
            path="/user/dashboard"
            element={
              user && user.type === 'user' ? (
                <UserDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/user/login" />
              )
            }
          />
          
          <Route
            path="/admin/dashboard"
            element={
              user && user.type === 'user' && user.role === 'admin' ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          
          <Route
            path="/hospital/dashboard"
            element={
              user && user.type === 'hospital' ? (
                <HospitalDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/hospital/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

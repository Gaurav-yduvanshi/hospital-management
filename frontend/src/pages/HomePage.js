import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Hospital Management System</h1>
        <p>Choose your role to continue</p>
      </div>
      
      <div className="container">
        <div className="options-grid">
          <Link to="/user/signup" className="option-card">
            <div className="icon">👤</div>
            <h2>Sign Up as User</h2>
            <p>Create a new user account</p>
          </Link>

          <Link to="/user/login" className="option-card">
            <div className="icon">🔐</div>
            <h2>Login as User</h2>
            <p>Access your account</p>
          </Link>

          <Link to="/hospital/login" className="option-card">
            <div className="icon">🏥</div>
            <h2>Login as Hospital</h2>
            <p>Hospital portal login</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

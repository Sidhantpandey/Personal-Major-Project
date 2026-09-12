import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Authform.css';

const AuthForm = () => {
  const [isActive, setIsActive] = useState(false);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/login',
      {
        email,
        password
      }
    );

    console.log('Login Response:', response.data);

    // JWT token save
    localStorage.setItem('token', response.data.data.token);

    // User data save (optional but useful)
    localStorage.setItem(
      'user',
      JSON.stringify(response.data.data.user)
    );

    toast.success('Login successful');

    setEmail('');
    setPassword('');

    navigate('/home');

  } catch (error) {
    console.error('Login Error:', error);

    toast.error(
      error.response?.data?.message || 'Login failed'
    );
  }
};

const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/register',
      {
        name: fullname,
        email,
        password
      }
    );

    console.log('Register Response:', response.data);

    toast.success('Registration successful');

    setFullname('');
    setEmail('');
    setPassword('');

    // Login panel par wapas
    setIsActive(false);

  } catch (error) {
    console.error('Register Error:', error);

    toast.error(
      error.response?.data?.message || 'Registration failed'
    );
  }
};

  return (
    <div className="papa">
      <div className={`containe ${isActive ? 'active' : ''}`}>

        {/* ================= LOGIN FORM ================= */}
        <div className="for-box logi">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <button type="submit" className="butn">
              Login
            </button>
          </form>
        </div>

        {/* ================= REGISTER FORM ================= */}
        <div className="for-box register">
          <form onSubmit={handleRegister}>
            <h1>Register</h1>

            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <button type="submit" className="butn">
              Register
            </button>
          </form>
        </div>

        {/* ================= TOGGLE PANELS ================= */}
        <div className="toggle-box">

          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don’t have an account?</p>
            <button
              type="button"
              className="butn"
              onClick={() => setIsActive(true)}
            >
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              type="button"
              className="butn"
              onClick={() => setIsActive(false)}
            >
              Login
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthForm;
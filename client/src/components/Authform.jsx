import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Authform.css';

const AuthForm = () => {
  const [isActive, setIsActive] = useState(false);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await login({ email, password });
      if (response.success) {
        toast.success('Login successful');
        setEmail('');
        setPassword('');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await register({ name: fullname, email, password });
      if (response.success) {
        toast.success('Registration successful');
        setFullname('');
        setEmail('');
        setPassword('');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setSubmitting(false);
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

            <button type="submit" className="butn" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Login'}
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

            <button type="submit" className="butn" disabled={submitting}>
              {submitting ? 'Registering…' : 'Register'}
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
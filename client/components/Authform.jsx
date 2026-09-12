import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../src/api/axios';
import './Authform.css';

const AuthForm = () => {
  const [isActive, setIsActive] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const navigate = useNavigate();

  const handlePhoneChange = (value, setter) => {
    setter(value.replace(/\D/g, '').slice(0, 10));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      toast.error('Enter a 10-digit phone number');
      return;
    }

    try {
      await api.post('/api/auth/send-otp', { phone });
      toast.success('OTP sent. Use 123456 for demo.');
      setOtpStep(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send OTP');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/auth/login', { phone, otp });

      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      toast.success('Login successful');

      setPhone('');
      setOtp('');
      setOtpStep(false);

      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      toast.error('Enter a 10-digit phone number');
      return;
    }

    try {
      await api.post('/api/auth/register', {
        name: fullname,
        phone,
      });

      toast.success('Registration successful. Login with OTP 123456.');

      setFullname('');
      setPhone('');
      setOtp('');
      setOtpStep(false);
      setIsActive(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="papa">
      <div className={`containe ${isActive ? 'active' : ''}`}>

        <div className="for-box logi">
          <form onSubmit={otpStep ? handleLogin : handleSendOtp}>
            <h1>Login</h1>

            <div className="input-box">
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit phone number"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value, setPhone)}
                disabled={otpStep}
              />
              <i className="bx bxs-phone"></i>
            </div>

            {otpStep && (
              <div className="input-box">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <i className="bx bxs-lock-alt"></i>
              </div>
            )}

            {otpStep && <p className="otp-hint">Demo OTP: 123456</p>}

            <button type="submit" className="butn">
              {otpStep ? 'Verify OTP' : 'Send OTP'}
            </button>

            {otpStep && (
              <button
                type="button"
                className="butn ghost"
                onClick={() => {
                  setOtpStep(false);
                  setOtp('');
                }}
              >
                Change number
              </button>
            )}
          </form>
        </div>

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
                type="tel"
                inputMode="numeric"
                placeholder="10-digit phone number"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value, setPhone)}
              />
              <i className="bx bxs-phone"></i>
            </div>

            <button type="submit" className="butn">
              Register
            </button>
          </form>
        </div>

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don’t have an account?</p>
            <button
              type="button"
              className="butn"
              onClick={() => {
                setIsActive(true);
                setOtpStep(false);
                setOtp('');
              }}
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

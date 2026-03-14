import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { baseUrl } from '../utils/constant';

// Background images for the left login carousel
// Using your custom phone hero images
const BG_SLIDES = [
  // '/mobile.jpg',
  '/theme3.png',
];

const Login = () => {
  const navigate = useNavigate();
  const { refreshUserData } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate left panel background every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % BG_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    if (isLoggedIn && userId) navigate("/");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/login`,
        { email: username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.ok === true) {
        localStorage.setItem("user_id", response?.data?.data?.user_id);
        localStorage.setItem("access_token", response?.data?.data?.token);
        localStorage.setItem("membership", response?.data?.data?.membership);
        localStorage.setItem("isVerified", response?.data?.data?.isVerified);
        refreshUserData();
        toast.success('Login successful!');
        navigate("/");
      } else {
        toast.error(response?.data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const response = await axios.post(
        'https://admin.ouptel.in/api/v1/password/forgot',
        { email: forgotEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.api_status === "200") {
        toast.success(response.data.message || 'Password reset link sent to your email!');
        setShowForgotPassword(false);
        setForgotEmail('');
      } else {
        toast.error(response.data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="theme-layout">

      {/* ===== LEFT PANEL — matches original sign-in.html (mockups + blue bubble + carousel) ===== */}
      <div className="authtication animated-circ">
        {/* Static mockup image overlapping the blue bubble (use first custom image) */}
        <div className="mockups">
          {/* <img src="/theme2.png" alt="login mockup" /> */}
          <img src="/theme3.png" alt="login mockup" />
        </div>

        {/* Carousel images (one visible at a time, similar to owl-carousel) */}
        <ul className="welcome-caro">
          {BG_SLIDES.map((src, i) => (
            <li
              key={src}
              className="welcome-box"
              style={{ display: activeSlide === i ? 'block' : 'none' }}
            >
              <figure>
                <img src={src} alt={`login slide ${i + 1}`} />
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {/* ===== RIGHT PANEL — login form ===== */}
      <div className="auth-login">
        <div className="logo">
          <img
            src="/op_logo.png"
            alt="Ouptel"
            style={{ maxWidth: 180, width: '160px', height: 'auto' }}
          />
        </div>

        <div className="verticle-center">
          <div className="login-form">
            <h4>Welcome back</h4>
            <span>Ouptel!</span>

            <form onSubmit={handleLogin} className="c-form">

              {/* Username / Email */}
              <div className="fileds">
                <label className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </label>
                <input
                  type="text"
                  placeholder="User Name @"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password — eye toggle as absolute span, no extra wrapper div */}
              <div className="fileds">
                <label className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="xxxxxxxxxx"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer', color: '#999', zIndex: 2,
                  }}
                >
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </span>
              </div>

              {/* Remember me + Forgot password — must be <a> to match .checkbox > a */}
              <div className="checkbox">
                <input type="checkbox" id="remember" defaultChecked />
                <label htmlFor="remember">
                  <span>Remember Me</span>
                </label>
                <a
                  href="#"
                  title=""
                  onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}
                >
                  forgot password
                </a>
              </div>

              <button className="main-btn" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>

              <span className="no-account">
                If don't have an account?{' '}
                <Link to="/signup">Signup</Link>
              </span>
            </form>


            {/* Download links */}
            <div className="download-app">
              <h5>Download Apps</h5>
              <a href="#" title=""><img src="/theme/images/google-play.svg" alt="Google Play" /></a>
              <a href="#" title=""><img src="/theme/images/apple-store.svg" alt="App Store" /></a>
            </div>

            <div className="bottambar2">
              <p>
                By Signing up you are accepting the Service Terms{' '}
                <Link to="/privacy-policy">Privacy Policy</Link> and use of{' '}
                <a href="#">Cookies</a>.
              </p>
            </div>
          </div>
        </div>

        <div className="mockup right">
          <img src="/theme/images/star-shape.png" alt="" />
        </div>
      </div>

      {/* ===== FORGOT PASSWORD MODAL ===== */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', zIndex: 9999,
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            maxWidth: '440px', width: '100%', padding: '32px', position: 'relative',
          }}>
            <button
              onClick={() => { setShowForgotPassword(false); setForgotEmail(''); }}
              style={{
                position: 'absolute', top: 16, right: 16, background: 'none',
                border: 'none', cursor: 'pointer', color: '#999', fontSize: 20,
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 64, height: 64, background: '#e0f0fd', borderRadius: '50%', marginBottom: 16,
              }}>
                <FaLock size={24} color="#1bace1" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Forgot Password?</h2>
              <p style={{ color: '#888', fontSize: 14 }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleForgotPassword}>
              <div className="fileds" style={{ marginBottom: 16 }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0',
                    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="main-btn"
                style={{ width: '100%', marginBottom: 10 }}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForgotPassword(false); setForgotEmail(''); }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  color: '#888', fontSize: 13, padding: '8px 0',
                }}
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

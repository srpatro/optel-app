import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    gender: '',
    username: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(null); // null | true | false
  const [verifying, setVerifying] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!formData.email?.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/send-signup-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setCodeSent(true);
        toast.success('Verification code sent to your email');
      } else {
        toast.error(data.message || 'Failed to send code');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.email || verificationCode.length !== 6) return;
    setVerifying(true);
    setEmailVerified(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/validate-signup-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: verificationCode }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setEmailVerified(true);
        toast.success('Email verified! You can now create your account.');
      } else {
        setEmailVerified(false);
        toast.error(data.message || 'Invalid or expired code');
      }
    } catch (err) {
      setEmailVerified(false);
      toast.error('Could not verify. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirm_password ||
      !formData.first_name || !formData.last_name || !formData.gender) {
      toast.error('All fields are required');
      return false;
    }
    if (!codeSent || !verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit code and verify your email');
      return false;
    }
    if (emailVerified !== true) {
      toast.error('Please verify your email with the code first (click Verify)');
      return false;
    }

    if (!acceptedTerms) {
      toast.error('You must accept the Terms of Service and Privacy Policy');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, verification_code: verificationCode })
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Store token and user data
        localStorage.setItem("user_id", data.data.user_id);
        localStorage.setItem("access_token", data.data.token);
        localStorage.setItem("isVerified", data.data.verified);

        // Store user data for the next pages
        localStorage.setItem("signup_user_data", JSON.stringify(data.data));

        // Show success toast
        toast.success('Account created successfully!');

        // Navigate to profile photo upload page
        navigate('/profile-photo-upload');
      } else {
        // Handle validation errors
        if (data.errors && typeof data.errors === 'object') {
          let errorMessages = [];

          // Process nested errors
          Object.keys(data.errors).forEach((field) => {
            if (Array.isArray(data.errors[field]) && data.errors[field].length > 0) {
              errorMessages.push(data.errors[field][0]);
            }
          });

          // Show toast with all error messages
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join(', '));
          } else {
            toast.error(data.message || 'Validation failed');
          }
        } else {
          // Handle simple error message
          const errorMsg = data.message || 'Signup failed. Please try again.';
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-layout">
      <section>
        <div className="gap no-gap signin whitish medium-opacity register">
          <div
            className="bg-image"
            style={{ backgroundImage: 'url(/theme/images/resources/theme-bg.jpg)' }}
          />
          <div className="container">
            <div className="row">
              {/* Left content block from signup-2.html */}
              <div className="col-lg-7">
                <div className="big-ad">
                  <figure>
                    <img
                      src="/op_logo.png"
                      alt="Ouptel"
                      style={{ maxWidth: 200, width: '100%', height: 'auto' }}
                    />
                  </figure>
                  <h1>Welcome to Ouptel</h1>
                  <p>
                    Ouptel is a social network that helps you connect and share
                    with the people in your life. Join the community and stay
                    close to what matters.
                  </p>
                  <div className="barcode">
                    <figure>
                      <img src="/theme/images/resources/Barcode.jpg" alt="Barcode" />
                    </figure>
                    <div className="app-download">
                      <span>Download Mobile App and Scan QR Code to login</span>
                      <ul className="colla-apps">
                        <li>
                          <a
                            href="#"
                            title=""
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              borderRadius: 999,
                            }}
                          >
                            <img
                              src="/theme/images/android.png"
                              alt="android"
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                objectFit: 'contain',
                              }}
                            />
                            <span>android</span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            title=""
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              borderRadius: 999,
                            }}
                          >
                            <img
                              src="/theme/images/apple.png"
                              alt="iPhone"
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                objectFit: 'contain',
                              }}
                            />
                            <span>iPhone</span>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            title=""
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              borderRadius: 999,
                            }}
                          >
                            <img
                              src="/theme/images/windows.png"
                              alt="Windows"
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                objectFit: 'contain',
                              }}
                            />
                            <span>Windows</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right registration form – React-powered but themed like signup-2.html */}
              <div className="col-lg-5">
                <div className="ver-center">
                  <div className="reg-from">
                    <span>
                      <i className="icofont-lock" /> Create an Account
                    </span>
                    <p>It&apos;s quick and easy</p>

                    <form className="c-form old-inputs" onSubmit={handleSubmit}>
                      <div className="row merged-10">
                        {/* First / Last Name */}
                        <div className="col-lg-6 col-md-6 col-sm-6">
                          <input
                            className="mb-2"
                            type="text"
                            placeholder="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6">
                          <input
                            className="mb-2"
                            type="text"
                            placeholder="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        {/* Username */}
                        <div className="col-lg-12 col-md-12 col-sm-12">
                          <input
                            className="mb-2"
                            type="text"
                            placeholder="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        {/* Email + send code button */}
                        <div className="col-lg-12 col-md-12 col-sm-12">
                          <div className="d-flex mb-2" style={{ gap: 8 }}>
                            <input
                              className="mb-0 flex-fill"
                              type="email"
                              placeholder="Email address"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={codeSent}
                              required
                              style={{ flex: 1 }}
                            />
                            {!codeSent && (
                              <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={loading || !formData.email}
                                className="main-btn2"
                              >
                                {loading ? 'Sending...' : 'Send Code'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Verification code block */}
                        {codeSent && (
                          <div className="col-lg-12 col-md-12 col-sm-12">
                            <div className="mb-2">
                              <label className="mb-1">
                                Enter 6-digit code sent to {formData.email}
                              </label>
                              <div className="d-flex" style={{ gap: 8, alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="mb-0"
                                  inputMode="numeric"
                                  maxLength={6}
                                  placeholder="000000"
                                  value={verificationCode}
                                  onChange={(e) => {
                                    setVerificationCode(
                                      e.target.value.replace(/\D/g, '').slice(0, 6),
                                    );
                                    setEmailVerified(null);
                                  }}
                                  disabled={emailVerified === true}
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyCode}
                                  disabled={
                                    verifying ||
                                    verificationCode.length !== 6 ||
                                    emailVerified === true
                                  }
                                  className="main-btn2"
                                >
                                  {verifying
                                    ? 'Checking...'
                                    : emailVerified === true
                                    ? 'Verified'
                                    : 'Verify'}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSendCode}
                                  disabled={loading}
                                  className="main-btn2"
                                  style={{ background: 'transparent', color: '#1bace1' }}
                                >
                                  Resend
                                </button>
                              </div>
                              {emailVerified === true && (
                                <p className="mt-1" style={{ color: '#2e7d32', fontSize: 13 }}>
                                  Email verified. You can now create your account below.
                                </p>
                              )}
                              {emailVerified === false && (
                                <p className="mt-1" style={{ color: '#c62828', fontSize: 13 }}>
                                  Invalid or expired code. Try again or request a new code.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Password / Confirm Password */}
                        <div className="col-lg-6 col-md-6 col-sm-6">
                          <input
                            className="mb-2"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6">
                          <input
                            className="mb-2"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Retype Password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        {/* Gender radio group (styled like theme) */}
                        <div className="col-lg-12 col-md-12 col-sm-12">
                          <div className="gender mb-2">
                            <label>Gender</label>
                            <div className="form-radio">
                              <div className="radio">
                                <label>
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleChange}
                                  />
                                  <i className="check-box" />
                                  Male
                                </label>
                              </div>
                              <div className="radio">
                                <label>
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleChange}
                                  />
                                  <i className="check-box" />
                                  Female
                                </label>
                              </div>
                              <div className="radio">
                                <label>
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="other"
                                    checked={formData.gender === 'other'}
                                    onChange={handleChange}
                                  />
                                  <i className="check-box" />
                                  Custom
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Terms checkbox */}
                        <div className="col-lg-12 col-md-12 col-sm-12 mb-2">
                          <div className="checkbox mb-1">
                            <input
                              type="checkbox"
                              id="signup-terms"
                              checked={acceptedTerms}
                              onChange={(e) => setAcceptedTerms(e.target.checked)}
                            />
                            <label htmlFor="signup-terms">
                              <span>
                                By clicking Sign Up, you agree to our{' '}
                                <Link to="/terms-and-conditions">Terms</Link>,{' '}
                                <Link to="/privacy-policy">Data Policy</Link> and Cookie Policy.
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Register / Submit buttons */}
                        <div className="col-lg-8 col-md-6 mt-2">
                          <span className="reg-with">Already have an account?</span>
                          <ul className="social-reg">
                            <li>
                              <Link
                                to="/login"
                                title=""
                                style={{
                                  color: '#1bace1',
                                  fontWeight: 600,
                                  background: '#ffffff',
                                  borderRadius: 20,
                                  padding: '6px 16px',
                                }}
                              >
                                Login
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="col-lg-4 col-md-6 mt-2">
                          <button
                            className="main-btn float-right"
                            type="submit"
                            disabled={
                              loading ||
                              !codeSent ||
                              verificationCode.length !== 6 ||
                              emailVerified !== true
                            }
                          >
                            {loading ? 'Creating...' : 'Signup'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50/80 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50/80 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50/80 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        disabled={codeSent}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50/80 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 disabled:bg-gray-100"
                        placeholder="Enter your email"
                      />
                    </div>
                    {!codeSent && (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={loading || !formData.email}
                        className="px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {loading ? 'Sending...' : 'Send Code'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Verification code input - shown after code sent */}
                {codeSent && (
                  <div className={`p-4 rounded-xl border-2 ${emailVerified === true ? 'bg-green-50 border-green-300' : emailVerified === false ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter 6-digit code sent to {formData.email}
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        id="verification_code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setEmailVerified(null);
                        }}
                        disabled={emailVerified === true}
                        className={`flex-1 min-w-[120px] px-4 py-3 rounded-full text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 border ${emailVerified === true ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verifying || verificationCode.length !== 6 || emailVerified === true}
                        className="px-4 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {verifying ? 'Checking...' : emailVerified === true ? 'Verified' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                      >
                        Resend
                      </button>
                    </div>
                    {emailVerified === true && (
                      <p className="mt-2 flex items-center gap-2 text-green-700 font-medium">
                        <FiCheckCircle className="w-5 h-5 shrink-0" />
                        Email verified. You can now create your account below.
                      </p>
                    )}
                    {emailVerified === false && (
                      <p className="mt-2 text-sm text-red-600">Invalid or expired code. Try again or request a new code.</p>
                    )}
                    {emailVerified === null && <p className="text-xs text-gray-500 mt-1">Code expires in 15 minutes</p>}
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50/80 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="confirm_password"
                        name="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50/80 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gray-50/80 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
 
};

export default Signup;

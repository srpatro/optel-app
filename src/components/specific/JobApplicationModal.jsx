import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { baseUrl } from '../../utils/constant';
import { useUser } from '../../context/UserContext';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i);

const JobApplicationModal = ({ isOpen, onClose, jobId, jobTitle, questions = [] }) => {
  const { userData } = useUser();
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [whereWorked, setWhereWorked] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [startYear, setStartYear] = useState(String(currentYear));
  const [endYear, setEndYear] = useState(String(currentYear));
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userData) {
        const first = userData.first_name || '';
        const last = userData.last_name || '';
        const fullName =
          (first || last) ? `${first} ${last}`.trim() : (userData.name || userData.username || '');
        setUserName(fullName);
        setEmail(userData.email || '');
        setPhone(userData.phone_number || userData.phone || '');
        // Do NOT auto-populate location; user will fill it manually
      }
    } else {
      setUserName('');
      setPhone('');
      setLocation('');
      setEmail('');
      setPosition('');
      setWhereWorked('');
      setExpDescription('');
      setStartYear(String(currentYear));
      setEndYear(String(currentYear));
      setCurrentlyWorking(false);
      setQuestionAnswers({});
    }
  }, [isOpen, userData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleQuestionAnswer = (num, value) => {
    setQuestionAnswers((prev) => ({ ...prev, [num]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    setLoading(true);

    try {
      const payload = {
        user_name: userName.trim(),
        phone_number: phone.trim(),
        location: location.trim(),
        email: email.trim(),
        position: position.trim(),
        where_did_you_work: whereWorked.trim(),
        experience_description: expDescription.trim(),
        experience_start_date: startYear,
        experience_end_date: currentlyWorking ? '' : endYear,
        question_one_answer: questionAnswers[1] || '',
        question_two_answer: questionAnswers[2] || '',
        question_three_answer: questionAnswers[3] || '',
      };

      const response = await axios.post(
        `${baseUrl}/api/v1/jobs/${jobId}/apply`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.ok) {
        toast.success(response.data.message || 'Application submitted successfully!');
        onClose();
      } else {
        toast.error(response.data?.message || 'Failed to submit application');
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || error?.message || 'Failed to submit application';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - WoWonder style red gradient */}
        <div className="relative bg-gradient-to-r from-red-400 to-red-500 px-6 py-5">
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="text-xl">💼</span>
            <h2 className="text-lg font-semibold truncate">{jobTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
          {/* Decorative wave */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 500 30"
            preserveAspectRatio="none"
            style={{ height: '20px' }}
          >
            <path
              d="M0,15 C150,30 350,0 500,15 L500,30 L0,30 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Location + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Experience heading */}
          <h3 className="text-lg font-medium text-blue-600 pt-2">Experience</h3>

          {/* Position + Where did you work */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Position</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Where did you work?</label>
              <input
                type="text"
                value={whereWorked}
                onChange={(e) => setWhereWorked(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows="3"
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Year range + Currently working */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <span className="text-gray-500 text-sm font-medium">To</span>
            <select
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              disabled={currentlyWorking}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={currentlyWorking}
                onChange={(e) => setCurrentlyWorking(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              I currently work here
            </label>
          </div>

          {/* Job-specific questions */}
          {questions.length > 0 &&
            questions.map((q) => (
              <div key={q.number} className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
                <label className="block text-sm font-medium text-red-500 mb-2">
                  {q.text}
                </label>
                {q.type === 'yes_no_question' ? (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={`q_${q.number}`}
                        value="Yes"
                        checked={questionAnswers[q.number] === 'Yes'}
                        onChange={() => handleQuestionAnswer(q.number, 'Yes')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={`q_${q.number}`}
                        value="No"
                        checked={questionAnswers[q.number] === 'No'}
                        onChange={() => handleQuestionAnswer(q.number, 'No')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      No
                    </label>
                  </div>
                ) : q.type === 'multiple_choice_question' && q.options?.length > 0 ? (
                  <select
                    value={questionAnswers[q.number] || ''}
                    onChange={(e) => handleQuestionAnswer(q.number, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {q.options.map((opt, idx) => (
                      <option key={idx} value={typeof opt === 'string' ? opt : opt.toString()}>
                        {typeof opt === 'string' ? opt : opt.toString()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    rows="2"
                    value={questionAnswers[q.number] || ''}
                    onChange={(e) => handleQuestionAnswer(q.number, e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                )}
              </div>
            ))}

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;

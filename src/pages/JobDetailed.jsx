import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import { baseUrl } from '../utils/constant';
import Loader from '../components/loading/Loader';
import Avatar from '../components/Avatar';
import JobApplicationModal from '../components/specific/JobApplicationModal';
import axios from 'axios';
import { useChatContext } from '../context/ChatContext';

const JobDetailed = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { setCurrentChat } = useChatContext();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const accessToken = localStorage.getItem('access_token');

  const getJob = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = response.data;
      console.log(responseData, 'job-detailed');
      
      if (responseData.ok && responseData.data) {
        const jobData = responseData.data.job;
        setJob({
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          company: jobData.company || '',
          location: jobData.location,
          status: jobData.status,
          applications_count: jobData.applications_count || 0,
          is_applied: jobData.is_applied || false,
          is_owner: jobData.is_owner || false,
          owner: jobData.owner,
          created_at: jobData.created_at,
          logo: '💼',
          // salary details from API
          minSalary: jobData.min_salary || 0,
          maxSalary: jobData.max_salary || jobData.min_salary || 0,
          salaryPeriod: jobData.salary_period || '',
          currency: jobData.currency || '₹',
          // job type & category
          type: jobData.job_type || jobData.type,
          category: jobData.category_name || jobData.job_type || jobData.type,
          questions: jobData.questions || [],
        });
        setApplications(responseData.data.applications || []);
      } else {
        throw new Error(responseData.message || 'Failed to fetch job');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      getJob();
    }
  }, [jobId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EDF6F9] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#EDF6F9] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Job not found</p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#EDF6F9]">
        {/* Header with Back Button */}
        <div className="w-full sticky top-0 z-10 bg-[#EDF6F9] pt-8 pb-4 px-4 md:px-7">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors mb-4"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Back to Jobs</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pb-8">
          {/* Job Header Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold flex-shrink-0">
                {job.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                {job.company && (
                  <p className="text-lg lg:text-xl text-gray-700 font-medium mb-3">
                    {job.company}
                  </p>
                )}
                {job.status && (
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                    job.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Salary */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
                  <span className="text-lg font-semibold text-green-700">
                    {job.currency || '₹'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 text-center mb-1">Salary</p>
                <p className="text-sm lg:text-base text-gray-900 font-semibold text-center">
                  {job.minSalary > 0 ? (
                    <>
                      {job.currency}{job.minSalary}
                      {job.maxSalary > job.minSalary ? ` - ${job.currency}${job.maxSalary}` : ''}
                      {job.salaryPeriod && (
                        <> / {job.salaryPeriod.replace('per_', '').replace('_', ' ')}</>
                      )}
                    </>
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>

              {/* Location */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                  <FiMapPin className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 text-center mb-1">Location</p>
                <p className="text-sm lg:text-base text-gray-900 font-semibold text-center truncate">
                  {job.location || 'Not specified'}
                </p>
              </div>

              {/* Job Type */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                  <FiClock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600 text-center mb-1">Type</p>
                <p className="text-sm lg:text-base text-gray-900 font-semibold text-center capitalize">
                  {job.type || 'Not specified'}
                </p>
              </div>

              {/* Applications Count */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-2">
                  <FiUser className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-xs text-gray-600 text-center mb-1">Applicants</p>
                <p className="text-sm lg:text-base text-gray-900 font-semibold text-center">
                  {job.applications_count || 0}
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-600 mb-2">Category</h3>
              <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium capitalize">
                {job.category}
              </span>
            </div>

            {/* Primary Action - Sticky on mobile */}
            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-6 px-6 pb-4">
              {/* For job owner: view candidates instead of apply */}
              {job.is_owner ? (
                <button
                  onClick={() => {
                    const el = document.getElementById('applications-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  View Interested Candidates ({applications.length})
                </button>
              ) : job.is_applied ? (
                <button 
                  disabled
                  className="w-full bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold text-lg cursor-not-allowed"
                >
                  Already Applied
                </button>
              ) : (
                <button 
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Owner Section */}
          {job.owner && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Posted by</h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar
                  src={job.owner.avatar_url}
                  name={job.owner.username || 'Unknown'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {job.owner.username || 'Unknown'}
                  </p>
                  {job.created_at && (
                    <p className="text-sm text-gray-500">
                      Posted {new Date(job.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Applications Section (if owner) */}
          {job.is_owner && applications.length > 0 && (
            <div id="applications-section" className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                Applications ({applications.length})
              </h2>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* Top profile header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 px-5 py-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-semibold">
                          {application.profile_url ? (
                            <img
                              src={application.profile_url}
                              alt={application.user_name || application.username || 'Profile'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {(application.user_name || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {application.user_name || 'Unknown'}
                            </p>
                            {application.username && (
                              <button
                                type="button"
                                onClick={() => navigate(`/profile/${application.user_id}`)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                @{application.username}
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                            {application.location && (
                              <span className="flex items-center gap-1">
                                <FiMapPin className="w-4 h-4 text-red-500" />
                                <span>{application.location}</span>
                              </span>
                            )}
                            {application.phone_number && (
                              <span className="flex items-center gap-1">
                                <span role="img" aria-label="phone">📞</span>
                                <span>{application.phone_number}</span>
                              </span>
                            )}
                            {application.email && (
                              <span className="flex items-center gap-1">
                                <span role="img" aria-label="email">📧</span>
                                <span className="truncate max-w-[160px] md:max-w-[220px]">
                                  {application.email}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 md:self-start">
                        {application.created_at && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FiClock className="w-4 h-4" />
                            {new Date(application.created_at).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {application.user_id && (
                          <button
                            type="button"
                            onClick={() => {
                              const userData = {
                                name: application.user_name || application.username || 'Unknown',
                                avatar: application.profile_url,
                                avatar_url: application.profile_url,
                                isOnline: false,
                              };

                              // Update chat context similar to Chatbox
                              setCurrentChat(application.user_id, userData);

                              // Persist for ChatDetailed fallback
                              localStorage.setItem(
                                `chat_user_${application.user_id}`,
                                JSON.stringify(userData),
                              );

                              navigate(`/chat-detailed/${application.user_id}`);
                            }}
                            className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
                          >
                            Message
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Experience + where worked */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 py-4 bg-gray-50 border-t border-gray-100">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Where did you work?
                        </p>
                        <p className="text-sm text-gray-900">
                          {application.where_did_you_work || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Start date
                        </p>
                        <p className="text-sm text-gray-900">
                          {application.experience_start_date || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Position
                        </p>
                        <p className="text-sm text-gray-900">
                          {application.position || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-900">
                          {application.experience_description || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Dynamic questions (e.g. notice period) */}
                    {application.questions && application.questions.length > 0 && (
                      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
                        {application.questions.map((q, idx) => (
                          <div key={idx} className="bg-white rounded-lg px-4 py-3">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              {q.label}
                            </p>
                            <p className="text-sm text-gray-900">
                              {q.answer || '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Application Modal */}
      {job && job.id && (
        <JobApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false);
            getJob();
          }}
          jobId={job.id}
          jobTitle={job.title}
          questions={job.questions || []}
        />
      )}
    </>
  );
};

export default JobDetailed;


import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { baseUrl } from '../utils/constant';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/loading/Loader';
import Avatar from '../components/Avatar';

const CreateJob = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedPageId = searchParams.get('pageId');

    // Page selection
    const [myPages, setMyPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);

    // Job fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [type, setType] = useState('');
    const [category, setCategory] = useState('');

    // Application questions (WoWonder-style)
    const [showQuestions, setShowQuestions] = useState(false);
    const [questionOne, setQuestionOne] = useState('');
    const [questionOneType, setQuestionOneType] = useState('free_text_question');
    const [questionOneAnswers, setQuestionOneAnswers] = useState('');
    const [questionTwo, setQuestionTwo] = useState('');
    const [questionTwoType, setQuestionTwoType] = useState('free_text_question');
    const [questionTwoAnswers, setQuestionTwoAnswers] = useState('');
    const [questionThree, setQuestionThree] = useState('');
    const [questionThreeType, setQuestionThreeType] = useState('free_text_question');
    const [questionThreeAnswers, setQuestionThreeAnswers] = useState('');

    // Metadata
    const [categories, setCategories] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);

    // Loading states
    const [fetchingMetadata, setFetchingMetadata] = useState(true);
    const [fetchingPages, setFetchingPages] = useState(true);
    const [loading, setLoading] = useState(false);

    const accessToken = localStorage.getItem('access_token');

    // ─── Fetch user's own pages ───────────────────────────────────────────────
    const fetchMyPages = async () => {
        try {
            setFetchingPages(true);
            const response = await axios.get(`${baseUrl}/api/v1/pages?type=my_pages`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data;
            if (data?.data && Array.isArray(data.data)) {
                const pages = data.data.map((page) => ({
                    id: page.page_id,
                    name: page.page_name || page.name || `Page #${page.page_id}`,
                    avatar: page.avatar_url || page.avatar || null,
                }));
                setMyPages(pages);
                // Auto-select based on query param, else fallback
                if (preselectedPageId) {
                    const match = pages.find((p) => String(p.id) === String(preselectedPageId));
                    if (match) {
                        setSelectedPage(match);
                    }
                } else if (pages.length === 1) {
                    setSelectedPage(pages[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
            toast.error('Could not load your pages. Please try again.');
        } finally {
            setFetchingPages(false);
        }
    };

    // ─── Fetch job metadata (types + categories) ─────────────────────────────
    const fetchMetadata = async () => {
        try {
            setFetchingMetadata(true);
            const res = await axios.get(`${baseUrl}/api/v1/jobs/meta`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.data?.data) {
                const metadata = res.data.data;
                const cats = metadata.categories || [];
                const types = metadata.job_types || [];

                setCategories(cats);
                setJobTypes(types);

                if (types.length > 0) {
                    setType(types[0].value);
                }

                // Auto-select first category on first load
                if (cats.length > 0 && !category) {
                    setCategory(String(cats[0].id));
                }
            }
        } catch (error) {
            console.error('Error fetching job metadata:', error);
            // Fallback defaults
            const defaults = [
                { value: 'full_time',   label: 'Full Time' },
                { value: 'part_time',   label: 'Part Time' },
                { value: 'internship',  label: 'Internship' },
                { value: 'volunteer',   label: 'Volunteer' },
                { value: 'contract',    label: 'Contract' },
            ];
            setJobTypes(defaults);
            setType('full_time');
        } finally {
            setFetchingMetadata(false);
        }
    };

    useEffect(() => {
        fetchMyPages();
        fetchMetadata();
    }, []);

    // ─── Form validation & submit ─────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPage) {
            toast.error('Please select a page to post this job under');
            return;
        }
        if (!title.trim()) {
            toast.error('Please enter a job title');
            return;
        }
        if (!description.trim()) {
            toast.error('Please enter a job description');
            return;
        }
        if (!location.trim()) {
            toast.error('Please enter a job location');
            return;
        }
        if (!minSalary || Number.isNaN(Number(minSalary)) || Number(minSalary) < 0) {
            toast.error('Please enter a valid minimum salary');
            return;
        }
        if (maxSalary && (Number.isNaN(Number(maxSalary)) || Number(maxSalary) < Number(minSalary))) {
            toast.error('Maximum salary must be greater than or equal to minimum salary');
            return;
        }
        if (!type) {
            toast.error('Please select a job type');
            return;
        }

        const formData = new FormData();
        formData.append('page_id', String(selectedPage.id));
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('location', location.trim());
        formData.append('minimum', String(Number(minSalary)));
        if (maxSalary) {
            formData.append('maximum', String(Number(maxSalary)));
        }
        // Send WoWonder-style job type field
        formData.append('job_type', type);

        if (category) {
            formData.append('category', String(Number.parseInt(category, 10)));
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Attach questions in WoWonder format
        if (showQuestions && questionOne.trim()) {
            formData.append('question_one', questionOne.trim());
            formData.append('question_one_type', questionOneType);
            if (questionOneType === 'multiple_choice_question' && questionOneAnswers.trim()) {
                const answers = questionOneAnswers
                    .split('\n')
                    .map((a) => a.trim())
                    .filter(Boolean);
                formData.append('question_one_answers', answers.join(','));
            }
        }

        if (showQuestions && questionTwo.trim()) {
            formData.append('question_two', questionTwo.trim());
            formData.append('question_two_type', questionTwoType);
            if (questionTwoType === 'multiple_choice_question' && questionTwoAnswers.trim()) {
                const answers = questionTwoAnswers
                    .split('\n')
                    .map((a) => a.trim())
                    .filter(Boolean);
                formData.append('question_two_answers', answers.join(','));
            }
        }

        if (showQuestions && questionThree.trim()) {
            formData.append('question_three', questionThree.trim());
            formData.append('question_three_type', questionThreeType);
            if (questionThreeType === 'multiple_choice_question' && questionThreeAnswers.trim()) {
                const answers = questionThreeAnswers
                    .split('\n')
                    .map((a) => a.trim())
                    .filter(Boolean);
                formData.append('question_three_answers', answers.join(','));
            }
        }

        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/api/v1/jobs`, formData, {
                headers: {
                    // Let axios set multipart boundary
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = response.data;
            if (data?.api_status === 200 || data?.ok === true || response.status === 200 || response.status === 201) {
                toast.success(data?.message || 'Job posted successfully!');
                setTimeout(() => {
                    if (preselectedPageId) {
                        navigate(`/page/${preselectedPageId}`);
                    } else {
                        navigate('/jobs');
                    }
                }, 800);
            } else {
                toast.error(data?.message || 'Failed to post job');
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to post job';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ─── Loading state ────────────────────────────────────────────────────────
    if (fetchingPages || fetchingMetadata) {
        return <Loader />;
    }

    // ─── No pages state ───────────────────────────────────────────────────────
    if (myPages.length === 0) {
        return (
            <div className="bg-[#EDF6F9] w-full min-h-screen flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Pages Found</h2>
                    <p className="text-gray-500 mb-6">
                        Jobs can only be posted under a page you own. Create a page first, then come back to post a job.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/pagescomp/mainpages/createpage')}
                            className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-700 text-white font-semibold rounded-full hover:opacity-90 transition"
                        >
                            Create a Page
                        </button>
                        <button
                            onClick={() => navigate('/jobs')}
                            className="w-full py-3 border border-gray-300 text-gray-600 font-medium rounded-full hover:bg-gray-50 transition"
                        >
                            Back to Jobs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#EDF6F9] w-full min-h-screen flex items-center justify-start flex-col">

            {/* Sticky Header */}
            <div className="w-full h-[98px] sticky pt-8 top-0 z-10 bg-[#EDF6F9]">
                <div className="flex items-center justify-between h-full px-4 md:px-7 flex-wrap gap-4">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-600">Post a Job</h1>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="border border-[#808080] py-1.5 px-4 rounded-2xl flex items-center gap-2 text-[#808080] text-base font-medium cursor-pointer hover:bg-gray-100 transition"
                    >
                        ← Back to Jobs
                    </button>
                </div>
            </div>

            {/* Main Card */}
            <div className="w-[95%] md:w-[90%] max-w-6xl bg-white flex flex-col gap-6 rounded-xl my-6 shadow-md overflow-hidden">

                {/* Hero Banner */}
                <div className="relative h-52 flex items-start justify-end px-8 md:px-16 rounded-t-xl overflow-hidden bg-gradient-to-r from-blue-400 to-blue-700">
                    <img src="/Vectorgroup.svg" alt="" className="absolute bottom-0 right-0 top-0 w-full" />
                    <h2 className="text-xl md:text-2xl font-bold text-white z-10 pt-6 relative">Post a Job</h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-4 md:p-8">

                    {/* ── Step 1: Select Page ──────────────────────────────── */}
                    <div className="flex flex-col gap-3">
                        <label htmlFor="page-select" className="text-lg font-medium text-black flex items-center gap-2">
                            Post under Page <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 -mt-1">
                            Jobs must be posted under one of your pages.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {myPages.map((page) => (
                                <button
                                    key={page.id}
                                    type="button"
                                    onClick={() => setSelectedPage(page)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                                        selectedPage?.id === page.id
                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <Avatar
                                        src={page.avatar}
                                        name={page.name}
                                        size="sm"
                                    />
                                    <span className={`text-sm font-medium truncate ${
                                        selectedPage?.id === page.id ? 'text-blue-700' : 'text-gray-800'
                                    }`}>
                                        {page.name}
                                    </span>
                                    {selectedPage?.id === page.id && (
                                        <svg className="w-5 h-5 text-blue-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* ── Step 2: Job Details ──────────────────────────────── */}

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="job-title" className="text-lg text-black flex items-center gap-2">
                            Job Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="job-title"
                            className="w-full p-2 px-4 border border-[#212121] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Senior PHP Developer"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="job-description" className="text-lg text-black flex items-center gap-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="job-description"
                            rows="5"
                            className="w-full p-2 px-4 border border-[#212121] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter job description and requirements..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="job-location" className="text-lg text-black flex items-center gap-2">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="job-location"
                            className="w-full p-2 px-4 border border-[#212121] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., New York, NY or Remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    {/* Salary */}
                    <div className="flex flex-col gap-2">
                        <label className="text-lg text-black flex items-center gap-2">
                            Salary Range <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="job-salary-min" className="text-xs text-gray-600">
                                    Minimum Salary
                                </label>
                                <input
                                    type="number"
                                    id="job-salary-min"
                                    className="w-full p-2 px-4 border border-[#212121] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 50000"
                                    value={minSalary}
                                    onChange={(e) => setMinSalary(e.target.value)}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="job-salary-max" className="text-xs text-gray-600">
                                    Maximum Salary (optional)
                                </label>
                                <input
                                    type="number"
                                    id="job-salary-max"
                                    className="w-full p-2 px-4 border border-[#212121] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 80000"
                                    value={maxSalary}
                                    onChange={(e) => setMaxSalary(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Image (optional, file upload) */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="job-image" className="text-lg text-black flex items-center gap-2">
                            Add an image to help applicants see what it's like to work at this location.
                            <span className="text-gray-400 text-sm">(optional)</span>
                        </label>
                        <input
                            type="file"
                            id="job-image"
                            accept="image/*"
                            className="w-full p-2 px-4 border border-[#212121] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                setImageFile(file || null);
                            }}
                        />
                        <p className="text-xs text-gray-500">
                            Upload a photo of your office, team, or workspace. JPG, PNG, up to 5MB.
                        </p>
                    </div>

                    {/* Job Type */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="job-type" className="text-lg text-black flex items-center gap-2">
                            Job Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="job-type"
                                className="w-full p-2 px-4 border border-[#212121] rounded-full appearance-none cursor-pointer bg-white"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                            >
                                <option value="">Select job type</option>
                                {jobTypes.map((jt) => (
                                    <option key={jt.value} value={jt.value}>
                                        {jt.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Category (optional) */}
                    {categories.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="job-category" className="text-lg text-black">
                                Category <span className="text-gray-400 text-sm">(optional)</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="job-category"
                                    className="w-full p-2 px-4 border border-[#212121] rounded-full appearance-none cursor-pointer bg-white"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toggle for application questions */}
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-600">
                            Want to ask applicants extra questions?
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                if (showQuestions) {
                                    setQuestionOne('');
                                    setQuestionOneType('free_text_question');
                                    setQuestionOneAnswers('');
                                    setQuestionTwo('');
                                    setQuestionTwoType('free_text_question');
                                    setQuestionTwoAnswers('');
                                    setQuestionThree('');
                                    setQuestionThreeType('free_text_question');
                                    setQuestionThreeAnswers('');
                                }
                                setShowQuestions((prev) => !prev);
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 transition"
                        >
                            {showQuestions ? 'Remove application questions' : 'Add application questions'}
                        </button>
                    </div>

                    {/* Application Questions (optional) */}
                    {showQuestions && (
                    <div className="flex flex-col gap-4 border border-gray-200 rounded-xl p-4 md:p-5 bg-gray-50">
                        <h3 className="text-base font-semibold text-gray-800">
                            Application Questions <span className="text-gray-400 text-sm">(optional)</span>
                        </h3>
                        <p className="text-xs text-gray-500">
                            These questions will be shown to applicants when they apply for this job.
                        </p>

                        {/* Question 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q1" className="text-sm text-gray-700">
                                    Question 1
                                </label>
                                <input
                                    id="q1"
                                    type="text"
                                    className="w-full p-2 px-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., How many years of experience do you have?"
                                    value={questionOne}
                                    onChange={(e) => setQuestionOne(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q1-type" className="text-sm text-gray-700">
                                    Question 1 Type
                                </label>
                                <select
                                    id="q1-type"
                                    className="w-full p-2 px-3 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={questionOneType}
                                    onChange={(e) => setQuestionOneType(e.target.value)}
                                >
                                    <option value="free_text_question">Free text</option>
                                    <option value="yes_no_question">Yes / No</option>
                                    <option value="multiple_choice_question">Multiple choice</option>
                                </select>
                            </div>
                        </div>
                        {questionOneType === 'multiple_choice_question' && (
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q1-answers" className="text-sm text-gray-700">
                                    Question 1 Options <span className="text-gray-400 text-xs">(one per line)</span>
                                </label>
                                <textarea
                                    id="q1-answers"
                                    rows={3}
                                    className="w-full p-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={'e.g.\n0–1 years\n2–4 years\n5+ years'}
                                    value={questionOneAnswers}
                                    onChange={(e) => setQuestionOneAnswers(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Question 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q2" className="text-sm text-gray-700">
                                    Question 2
                                </label>
                                <input
                                    id="q2"
                                    type="text"
                                    className="w-full p-2 px-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Are you willing to relocate?"
                                    value={questionTwo}
                                    onChange={(e) => setQuestionTwo(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q2-type" className="text-sm text-gray-700">
                                    Question 2 Type
                                </label>
                                <select
                                    id="q2-type"
                                    className="w-full p-2 px-3 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={questionTwoType}
                                    onChange={(e) => setQuestionTwoType(e.target.value)}
                                >
                                    <option value="free_text_question">Free text</option>
                                    <option value="yes_no_question">Yes / No</option>
                                    <option value="multiple_choice_question">Multiple choice</option>
                                </select>
                            </div>
                        </div>
                        {questionTwoType === 'multiple_choice_question' && (
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q2-answers" className="text-sm text-gray-700">
                                    Question 2 Options <span className="text-gray-400 text-xs">(one per line)</span>
                                </label>
                                <textarea
                                    id="q2-answers"
                                    rows={3}
                                    className="w-full p-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={'e.g.\nYes\nNo'}
                                    value={questionTwoAnswers}
                                    onChange={(e) => setQuestionTwoAnswers(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Question 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q3" className="text-sm text-gray-700">
                                    Question 3
                                </label>
                                <input
                                    id="q3"
                                    type="text"
                                    className="w-full p-2 px-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., What is your notice period?"
                                    value={questionThree}
                                    onChange={(e) => setQuestionThree(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q3-type" className="text-sm text-gray-700">
                                    Question 3 Type
                                </label>
                                <select
                                    id="q3-type"
                                    className="w-full p-2 px-3 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={questionThreeType}
                                    onChange={(e) => setQuestionThreeType(e.target.value)}
                                >
                                    <option value="free_text_question">Free text</option>
                                    <option value="yes_no_question">Yes / No</option>
                                    <option value="multiple_choice_question">Multiple choice</option>
                                </select>
                            </div>
                        </div>
                        {questionThreeType === 'multiple_choice_question' && (
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="q3-answers" className="text-sm text-gray-700">
                                    Question 3 Options <span className="text-gray-400 text-xs">(one per line)</span>
                                </label>
                                <textarea
                                    id="q3-answers"
                                    rows={3}
                                    className="w-full p-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Add options, one per line"
                                    value={questionThreeAnswers}
                                    onChange={(e) => setQuestionThreeAnswers(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    )}

                    {/* Selected page summary */}
                    {selectedPage && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <Avatar src={selectedPage.avatar} name={selectedPage.name} size="sm" />
                            <div>
                                <p className="text-xs text-gray-500">Posting as</p>
                                <p className="text-sm font-semibold text-blue-700">{selectedPage.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="text-center pb-4">
                        <button
                            type="submit"
                            disabled={loading || !selectedPage}
                            className="w-[16rem] md:w-[20rem] h-[50px] bg-gradient-to-r from-blue-400 to-blue-700 text-white font-semibold text-[18px] md:text-[20px] py-2 px-8 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;

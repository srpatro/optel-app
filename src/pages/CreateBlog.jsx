import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../utils/constant';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../components/loading/Loader';
import { getCategoryName } from '../constants/blogCategories';
import { Editor } from '@tinymce/tinymce-react';

const CreateBlog = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [fetchingCategories, setFetchingCategories] = useState(true);

    const getCategories = async () => {
        try {
            setFetchingCategories(true);
            // Fetch blog categories from categories endpoint
            const res = await axios.get(`${baseUrl}/api/v1/blogs/categories`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (res.data?.api_status === 200 && res.data?.data) {
                // Extract categories from data.categories array
                const categoriesData = res.data.data.categories || res.data.data || [];
                setCategories(categoriesData);
            } else if (res.data?.ok === true) {
                // Fallback for alternative response format
                const categoriesData = res.data?.data?.categories || res.data?.categories || res.data?.data || [];
                setCategories(categoriesData);
            }
        } catch (error) {
            console.log('Error fetching categories:', error);
            // If categories endpoint doesn't exist, use default categories
            setCategories([
                { id: 1, name: 'General' },
                { id: 2, name: 'Technology' },
                { id: 3, name: 'Lifestyle' },
                { id: 4, name: 'Business' },
                { id: 5, name: 'Entertainment' },
            ]);
        } finally {
            setFetchingCategories(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();
        const trimmedContent = content.trim();
        const trimmedTags = tags
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
            .join(',');

        if (!trimmedTitle) {
            toast.error('Please enter blog title');
            return;
        }

        if (trimmedTitle.length < 3) {
            toast.error('Title must be at least 3 characters');
            return;
        }

        if (!trimmedDescription) {
            toast.error('Please enter blog description');
            return;
        }

        if (trimmedDescription.length < 10) {
            toast.error('Description must be at least 10 characters');
            return;
        }

        if (!trimmedContent) {
            toast.error('Please enter blog content');
            return;
        }

        if (trimmedContent.length < 50) {
            toast.error('Content must be at least 50 characters');
            return;
        }

        if (!category) {
            toast.error('Please select a category');
            return;
        }

        if (thumbnail && !thumbnail.type.startsWith('image/')) {
            toast.error('Thumbnail must be an image file');
            return;
        }

        const accessToken = localStorage.getItem("access_token");
        setLoading(true);

        const formData = new FormData();
        formData.append('title', trimmedTitle);
        formData.append('description', trimmedDescription);
        formData.append('content', trimmedContent);
        formData.append('category', parseInt(category));
        formData.append('tags', trimmedTags || '');
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }

        try {
            const response = await axios.post(
                `${baseUrl}/api/v1/blogs`,
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            const data = response.data;
            console.log('Blog creation response:', data);

            if (data?.api_status === 200 || data?.ok === true) {
                toast.success(data?.message || 'Blog submitted for review. It will be published after admin approval.');
                
                // Navigate to blogs list page
                setTimeout(() => {
                    navigate('/blog');
                }, 800);

                // Reset form
                setTitle('');
                setDescription('');
                setContent('');
                setCategory('');
                setTags([]);
                setTagInput('');
                setThumbnail(null);
                setThumbnailPreview(null);
            } else {
                toast.error(data?.message || 'Failed to create blog');
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create blog';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCategories) {
        return <Loader />;
    }

    return (
        <div className="bg-[#EDF6F9] w-full min-h-screen flex items-center justify-start flex-col">
            {/* Sticky Header */}
            <div className="w-full h-[98px] sticky pt-8 top-0 z-11 bg-[#EDF6F9]">
                <div className="flex items-center justify-between h-full px-4 md:px-7 flex-wrap gap-4">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-600">Create Blog</h1>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => navigate('/blog')}
                            className="w-[16rem] md:w-[15rem] h-[50px] bg-gradient-to-r from-blue-400 to-blue-700 text-white font-semibold text-[15px] md:text-[18px] py-2 px-8 rounded-full hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            ← Back to Blogs
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="w-[95%] md:w-[90%] max-w-6xl bg-white flex flex-col gap-6 rounded-xl my-6 shadow-md overflow-hidden">
                {/* Hero Banner */}
                <div className="relative h-64 flex items-start justify-end px-8 md:px-16 rounded-t-xl overflow-hidden bg-gradient-to-r from-blue-400 to-blue-700">
                    {/* Wave SVG */}
                    <img src="/Vectorgroup.svg" alt="vector" className='absolute bottom-0 right-0 top-0 w-full' />
                    <h2 className="text-xl md:text-2xl font-bold text-white z-10 pt-6 relative">
                        Create Blog Post
                    </h2>
                </div>

                {/* Form Section */}
                <form
                    onSubmit={handleSubmit}
                    className="p-8 md:p-12 space-y-6"
                >
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="blog-title"
                            className="text-base text-gray-600 font-medium"
                        >
                            Title
                        </label>
                        <input
                            type="text"
                            id="blog-title"
                            className="w-full p-3 px-4 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter blog title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="blog-description"
                            className="text-base text-gray-600 font-medium"
                        >
                            Description
                        </label>
                        <textarea
                            id="blog-description"
                            rows="3"
                            className="w-full p-3 px-4 border border-gray-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter short description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="blog-content"
                            className="text-base text-gray-600 font-medium"
                        >
                            Content
                        </label>
                        <Editor
                            id="blog-content"
                            apiKey="lvxskwtphnntv5r02c0yndwuo1iyuudka01en3zthqwqqufm"
                            value={content}
                            onEditorChange={(newValue) => setContent(newValue)}
                            init={{
                                height: 400,
                                menubar: false,
                                plugins: [
                                    'advlist',
                                    'autolink',
                                    'lists',
                                    'link',
                                    'image',
                                    'charmap',
                                    'preview',
                                    'anchor',
                                    'searchreplace',
                                    'visualblocks',
                                    'code',
                                    'fullscreen',
                                    'insertdatetime',
                                    'media',
                                    'table',
                                    'help',
                                    'wordcount',
                                ],
                                toolbar:
                                    'undo redo | blocks | bold italic underline forecolor | ' +
                                    'alignleft aligncenter alignright alignjustify | ' +
                                    'bullist numlist outdent indent | removeformat | help',
                                content_style:
                                    'body { font-family:Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif; font-size:14px }',
                            }}
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="blog-category"
                            className="text-base text-gray-600 font-medium"
                        >
                            Category
                        </label>
                        <div className="relative">
                            <select
                                id="blog-category"
                                className="w-full p-3 px-4 border border-gray-200 rounded-full bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select category</option>
                                {categories?.map((cat) => {
                                    const displayName = getCategoryName(cat.id);
                                    return (
                                        <option key={cat.id} value={cat.id}>
                                            {displayName} {cat.articles_count ? `(${cat.articles_count})` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="blog-thumbnail"
                            className="text-base text-gray-600 font-medium"
                        >
                            Thumbnail
                        </label>
                        <input
                            type="file"
                            id="blog-thumbnail"
                            accept="image/*"
                            className="w-full p-3 px-4 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) {
                                    setThumbnail(null);
                                    setThumbnailPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
                                    return;
                                }
                                if (!file.type.startsWith('image/')) {
                                    toast.error('Thumbnail must be an image file');
                                    e.target.value = '';
                                    return;
                                }
                                setThumbnailPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
                                setThumbnail(file);
                            }}
                        />
                        <p className="text-sm text-gray-400">Optional. Max 5 MB (jpg, png, gif, webp).</p>
                        {thumbnailPreview && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="blog-tags"
                            className="text-base text-gray-600 font-medium"
                        >
                            Tags
                        </label>
                        <div
                            className="w-full min-h-[48px] border border-gray-200 rounded-lg bg-white px-3 py-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                        >
                            {tags.map((tag, index) => (
                                <span
                                    key={`${tag}-${index}`}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700 text-white"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTags((prev) => prev.filter((_, i) => i !== index));
                                        }}
                                        className="ml-2 text-[10px] font-bold text-gray-200 hover:text-white"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                id="blog-tags"
                                className="flex-1 min-w-[80px] border-none outline-none bg-transparent text-sm text-gray-700"
                                placeholder={tags.length === 0 ? 'Add a tag and press Enter' : 'Add another tag'}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        const value = tagInput.trim();
                                        if (!value) return;
                                        setTags((prev) =>
                                            prev.includes(value) ? prev : [...prev, value]
                                        );
                                        setTagInput('');
                                    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
                                        setTags((prev) => prev.slice(0, -1));
                                    }
                                }}
                            />
                        </div>
                        <p className="text-sm text-gray-400">
                            Type a tag and press Enter or comma. Click × to remove.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[16rem] md:w-[15rem] h-[50px] bg-gradient-to-r from-blue-400 to-blue-700 text-white font-semibold text-[15px] md:text-[18px] py-2 px-8 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Publishing...' : 'Publish Blog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBlog;


import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import axios from 'axios';
import Loader from '../../components/loading/Loader';
import { baseUrl } from '../../utils/constant';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LikedPages = () => {
  const navigate = useNavigate();
  const [likedPages, setLikedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unlikingPageId, setUnlikingPageId] = useState(null);

  const handleUnlike = async (pageId, e) => {
    e.stopPropagation();
    setUnlikingPageId(pageId);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post(
        `${baseUrl}/api/v1/pages/like`,
        { page_id: parseInt(pageId) },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.api_status === 200 || response.data?.ok === true) {
        // Remove the page from the list
        setLikedPages(prev => prev.filter(page => page.page_id !== pageId));
        toast.success('Page unliked successfully');
      } else {
        toast.error(response.data?.message || 'Failed to unlike page');
      }
    } catch (error) {
      console.error('Error unliking page:', error);
      toast.error(error.response?.data?.message || 'Failed to unlike page');
    } finally {
      setUnlikingPageId(null);
    }
  };

  const getLikedPages = async () => {
    console.log("Fetching liked pages...");
    try {
      setLoading(true);
      setError(null);
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("Missing access token");
      }

      const response = await axios.get(
        `${baseUrl}/api/v1/pages?type=liked`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('Liked pages API response:', response.data);

      if (response.data?.data && Array.isArray(response.data.data)) {
        setLikedPages(response.data.data);
      } else {
        setLikedPages([]);
      }
    } catch (err) {
      console.error("Error fetching liked pages:", err);
      setError(err.message);
      toast.error('Failed to load liked pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLikedPages();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={getLikedPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!likedPages || likedPages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHeart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Liked Pages</h3>
          <p className="text-gray-600">Pages you like will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {likedPages.map((page) => (
        <div
          key={page.page_id}
          className="bg-white rounded-lg border border-gray-300 p-4 sm:p-6 cursor-pointer hover:shadow-sm transition-shadow"
          onClick={() => navigate(`/page/${page.page_id}`)}
        >
          {/* Top Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={page.avatar_url || page.avatar || '/d-page.jpg'}
                alt={page.page_title || page.page_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/d-page.jpg';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                    {page.page_title || page.page_name}
                  </h3>
                  {page.verified && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-500">@{page.page_name}</p>
                <p className="text-sm text-gray-600 mt-1 block sm:hidden">
                  Category: <span className="font-bold">{page.category_name || 'General'}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto gap-2">
              <button
                onClick={(e) => handleUnlike(page.page_id, e)}
                disabled={unlikingPageId === page.page_id}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-red-500 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                aria-label="Unlike page"
              >
                {unlikingPageId === page.page_id ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaHeart className="text-red-500" />
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          {page.description && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{page.description}</p>
          )}

          {/* Bottom Info */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm text-gray-600">
            <p className="text-sm text-gray-600 font-medium hidden sm:block">
              Category:{' '}
              <span className="font-bold">
                {page.category_name || 'General'}
                {page.sub_category_name ? ` • ${page.sub_category_name}` : ''}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {typeof page.likes_count === 'number' && (
                <span className="text-gray-600 font-medium">
                  {page.likes_count} {page.likes_count === 1 ? 'person likes this' : 'people like this'}
                </span>
              )}
              {page.owner && (
                <span className="flex items-center gap-1">
                  <span>by @{page.owner.username}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LikedPages;

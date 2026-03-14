import React, { useCallback, useEffect, useRef, useState } from "react";
import BlogCard from "../components/BlogCard";
import MyBlogCard from "../components/MyBlogCard";
import Loader from "../components/loading/Loader";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { baseUrl } from "../utils/constant";
import { getCategoryName } from "../constants/blogCategories";

const PER_PAGE = 12;

const Blog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const navigate = useNavigate();

  // Fetch categories (WoWonder-style sidebar)
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/blogs/categories`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await res.json();
      const list = data?.data?.categories || data?.categories || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      setCategories([]);
    }
  };

  const getBlogs = async (pageNum, mode = viewMode, categoryId = selectedCategoryId, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem("access_token");
      const headers = { Accept: "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      let url;
      if (mode === "my") {
        url = `${baseUrl}/api/v1/blogs/my-articles?per_page=${PER_PAGE}&page=${pageNum}`;
      } else {
        url = `${baseUrl}/api/v1/blogs?per_page=${PER_PAGE}&page=${pageNum}`;
        if (categoryId) url += `&category=${categoryId}`;
      }

      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const newBlogs = data?.data ?? data?.blogs ?? [];

      if (pageNum === 1 || mode === "my" || !append) {
        setBlogs(newBlogs);
      } else {
        setBlogs((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const unique = newBlogs.filter((b) => !existingIds.has(b.id));
          return [...prev, ...unique];
        });
      }

      const meta = data?.meta || {};
      const currentPage = meta.current_page || 1;
      const lastPage = meta.last_page || 1;
      setHasMore(currentPage < lastPage && newBlogs.length > 0);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    setBlogs([]);
    setHasMore(true);
    setInitialLoad(true);
    setError(null);
  }, [viewMode, selectedCategoryId]);

  useEffect(() => {
    if (initialLoad) {
      getBlogs(1, viewMode, selectedCategoryId, false);
    }
  }, [initialLoad, viewMode, selectedCategoryId]);

  useEffect(() => {
    if (!initialLoad && page > 1 && viewMode === "all") {
      getBlogs(page, viewMode, selectedCategoryId, true);
    }
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1);
  };

  const lastBlogRef = useCallback(
    (node) => {
      if (loading || viewMode === "my" || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) setPage((p) => p + 1);
        },
        { threshold: 0.1, rootMargin: "100px" }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, viewMode]
  );

  const observer = useRef(null);

  // Handle blog update
  const handleBlogUpdate = (updatedBlog) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))
    );
    // Toast notification is already shown in EditBlogModal
  };

  // Handle blog delete
  const handleBlogDelete = async (blogId) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.delete(
        `${baseUrl}/api/v1/blogs/${blogId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.api_status === 200 || response.status === 200) {
        // Remove the blog from the list
        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));
        toast.success('Blog deleted successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete blog';
      toast.error(errorMsg);
    }
  };

  if (error && blogs.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading blogs: {error}</p>
        <button 
          onClick={() => {
            setError(null);
            setPage(1);
            setInitialLoad(true);
            setHasMore(true);
            getBlogs(1, viewMode, selectedCategoryId, false);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pt-[35px] bg-[#EDF6F9] min-h-screen">
      {/* Header: Blog title + Create Blog (WoWonder-style) */}
      <div className="w-full sticky top-0 z-10 bg-[#EDF6F9] border-b border-gray-200/60">
        <div className="flex items-center justify-between px-4 md:px-7 py-4 flex-col sm:flex-row gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Blog</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/blog/create"
              className="border border-[#d3d1d1] cursor-pointer py-2 px-4 rounded-2xl flex items-center gap-2 hover:bg-gray-100 transition bg-white"
            >
              <img src="/icons/gridicons_create.svg" alt="create" className="size-[15px]" />
              <span className="text-[#808080] text-base font-medium">Create Blog</span>
            </Link>
          </div>
        </div>
        {/* All / My toggle */}
        <div className="flex gap-2 px-4 md:px-7 pb-3">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === "all" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Browse articles
          </button>
          <button
            onClick={() => setViewMode("my")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === "my" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            My Blogs
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 px-4 md:px-7 py-6 max-w-7xl mx-auto">
        {/* Sidebar: categories (WoWonder-style, only when Browse articles) */}
        {viewMode === "all" && (
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-32">
              <div className="p-3 border-b border-gray-100 bg-gray-50/80">
                <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
              </div>
              <nav className="p-2 max-h-[70vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategoryId === null ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCategoryId === cat.id ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {getCategoryName(cat.id) || cat.name || `Category ${cat.id}`}
                    {cat.articles_count != null && (
                      <span className="text-gray-400 ml-1">({cat.articles_count})</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main: article cards (WoWonder-style grid) */}
        <main className="flex-1 min-w-0">
          {blogs.length === 0 && !loading && !error && (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No articles found.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {blogs.map((blog, index) => {
              const isLast = index === blogs.length - 1;
              const CardComponent = viewMode === "my" ? MyBlogCard : BlogCard;
              const cardProps = viewMode === "my"
                ? { blog, onClick: () => navigate(`/blog/${blog?.id}`), onUpdate: handleBlogUpdate, onDelete: handleBlogDelete }
                : { blog, onClick: () => navigate(`/blog/${blog?.id}`) };
              if (isLast && viewMode === "all") {
                return (
                  <div ref={lastBlogRef} key={blog.id}>
                    <CardComponent {...cardProps} />
                  </div>
                );
              }
              return <CardComponent key={blog.id} {...cardProps} />;
            })}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          )}

          {viewMode === "all" && hasMore && blogs.length > 0 && !loading && (
            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={loadMore}
                className="px-6 py-3 rounded-full font-medium bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition"
              >
                Load more articles
              </button>
            </div>
          )}

          {error && blogs.length > 0 && (
            <div className="p-4 text-center">
              <p className="text-red-500 text-sm">Error loading more: {error}</p>
              <button
                onClick={() => { setError(null); getBlogs(page, viewMode, selectedCategoryId, false); }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}

          {!hasMore && blogs.length > 0 && (
            <div className="py-4 text-center">
              <p className="text-gray-400 text-sm">No more articles to load.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Blog;
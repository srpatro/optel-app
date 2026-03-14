import React from "react";
import { getCategoryName } from "../constants/blogCategories";

const BlogCard = ({ blog, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const categoryName = getCategoryName(blog?.category) || (typeof blog?.category === "object" ? blog?.category?.name : null) || "Other";
  const authorName = blog?.user?.username || blog?.author?.name || blog?.author?.username || "Unknown";

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition cursor-pointer flex flex-col"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] bg-gray-100">
        <img
          src={blog?.thumbnail || "/icons/blog.png"}
          alt={blog?.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/icons/blog.png";
          }}
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Category (WoWonder: top badge) */}
        <span className="text-xs font-medium text-blue-600 mb-2 block">
          {categoryName}
        </span>

        {/* Title (WoWonder: bold heading) */}
        <h2 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
          {blog?.title}
        </h2>

        {/* Author + date (WoWonder: "Author Name" + "07 Apr 2022") */}
        <p className="text-sm text-gray-500 mb-3">
          {authorName} • {formatDate(blog?.posted_at)}
        </p>

        {/* Read more (WoWonder-style link) */}
        <span className="mt-auto text-blue-600 font-medium text-sm hover:underline">
          Read more
        </span>
      </div>
    </div>
  );
};

export default BlogCard;

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  SearchOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FireOutlined,
  HomeOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { PublicPost, PublicTag, MenuItem, PublicCategory, PublicPagination } from "@/lib/api";

interface DemoCategoryPageProps {
  category: PublicCategory;
  subcategories: PublicCategory[];
  posts: PublicPost[];
  pagination: PublicPagination;
  menu: MenuItem[];
  mostViewed: PublicPost[];
  trendingTags: PublicTag[];
}

function timeAgo(date: string | null): string {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return past.toLocaleDateString("vi-VN");
}

export default function DemoCategoryPage({
  category,
  subcategories,
  posts,
  pagination,
  menu,
  mostViewed,
  trendingTags,
}: DemoCategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { trackCategoryView } = useAnalytics();
  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];

  // Track category view on mount
  useEffect(() => {
    if (category._id && category.slug) {
      trackCategoryView(category._id, category.slug);
    }
  }, [category._id, category.slug, trackCategoryView]);
  const otherPosts = posts.filter((p) => p._id !== featuredPost?._id);

  return (
    <div>
      {/* Header */}
      <header className="vne-header">
        <div className="vne-container">
          <div className="vne-header-top">
            <Link href="/demo" className="vne-logo">
              Vật Liệu<span>XD</span>
            </Link>
            <div className="vne-search">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/demo/search?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              />
              <button>
                <SearchOutlined />
              </button>
            </div>
          </div>
          <nav className="vne-nav">
            <Link href="/demo" className="vne-nav-item">
              <HomeOutlined /> Trang chủ
            </Link>
            {menu.map((item) => (
              <Link
                key={item.id}
                href={`/demo/category/${item.slug}`}
                className={`vne-nav-item ${item.slug === category.slug ? "active" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="vne-container">
        {/* Breadcrumb */}
        <div className="vne-breadcrumb">
          <Link href="/demo">
            <HomeOutlined /> Trang chủ
          </Link>
          <span className="vne-breadcrumb-sep">
            <RightOutlined />
          </span>
          {category.parent && (
            <>
              <Link href={`/demo/category/${category.parent.slug}`}>{category.parent.name}</Link>
              <span className="vne-breadcrumb-sep">
                <RightOutlined />
              </span>
            </>
          )}
          <span>{category.name}</span>
        </div>

        <div className="vne-main">
          {/* Content */}
          <div className="vne-content">
            {/* Category Header */}
            <div className="vne-section">
              <div className="vne-section-header">
                <h1 className="vne-section-title">{category.name}</h1>
                {category.description && (
                  <span style={{ fontSize: 13, color: "#666", fontWeight: "normal" }}>
                    {category.description}
                  </span>
                )}
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div style={{ padding: "10px 15px", borderBottom: "1px solid #eee" }}>
                  {subcategories.map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/demo/category/${sub.slug}`}
                      style={{
                        display: "inline-block",
                        marginRight: 15,
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="vne-section-body">
                {/* Featured Post */}
                {featuredPost && (
                  <article className="vne-article" style={{ borderBottom: "2px solid #eee", paddingBottom: 20 }}>
                    <Link href={`/demo/post/${featuredPost.slug}`} className="vne-article-thumb" style={{ width: 300, height: 200 }}>
                      <img
                        src={featuredPost.coverImage || "https://via.placeholder.com/300x200"}
                        alt={featuredPost.title}
                      />
                    </Link>
                    <div className="vne-article-content">
                      <Link href={`/demo/post/${featuredPost.slug}`}>
                        <h2 className="vne-article-title" style={{ fontSize: 22 }}>
                          {featuredPost.title}
                        </h2>
                      </Link>
                      <p className="vne-article-excerpt" style={{ WebkitLineClamp: 3 }}>
                        {featuredPost.excerpt}
                      </p>
                      <div className="vne-article-meta">
                        <span>
                          <ClockCircleOutlined /> {timeAgo(featuredPost.publishedAt)}
                        </span>
                        <span>
                          <EyeOutlined /> {featuredPost.viewCount} lượt xem
                        </span>
                      </div>
                    </div>
                  </article>
                )}

                {/* Other Posts */}
                {otherPosts.map((post) => (
                  <article key={post._id} className="vne-article">
                    <Link href={`/demo/post/${post.slug}`} className="vne-article-thumb">
                      <img
                        src={post.coverImage || "https://via.placeholder.com/200x130"}
                        alt={post.title}
                      />
                    </Link>
                    <div className="vne-article-content">
                      {post.category && post.category.slug !== category.slug && (
                        <Link
                          href={`/demo/category/${post.category.slug}`}
                          className="vne-article-category"
                        >
                          {post.category.name}
                        </Link>
                      )}
                      <Link href={`/demo/post/${post.slug}`}>
                        <h3 className="vne-article-title">{post.title}</h3>
                      </Link>
                      <p className="vne-article-excerpt">{post.excerpt}</p>
                      <div className="vne-article-meta">
                        <span>
                          <ClockCircleOutlined /> {timeAgo(post.publishedAt)}
                        </span>
                        <span>
                          <EyeOutlined /> {post.viewCount} lượt xem
                        </span>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="vne-pagination">
                    {pagination.page > 1 && (
                      <Link
                        href={`/demo/category/${category.slug}?page=${pagination.page - 1}`}
                        className="vne-pagination-item"
                      >
                        «
                      </Link>
                    )}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (pagination.totalPages > 5 && pagination.page > 3) {
                        pageNum = pagination.page - 2 + i;
                        if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - 4 + i;
                      }
                      return (
                        <Link
                          key={pageNum}
                          href={`/demo/category/${category.slug}?page=${pageNum}`}
                          className={`vne-pagination-item ${pagination.page === pageNum ? "active" : ""}`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                    {pagination.page < pagination.totalPages && (
                      <Link
                        href={`/demo/category/${category.slug}?page=${pagination.page + 1}`}
                        className="vne-pagination-item"
                      >
                        »
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="vne-sidebar">
            {/* Most Viewed */}
            <div className="vne-widget">
              <div className="vne-widget-header">
                <h3 className="vne-widget-title">
                  <FireOutlined /> Xem nhiều nhất
                </h3>
              </div>
              <div className="vne-widget-body">
                {mostViewed.map((post, index) => (
                  <div key={post._id} className="vne-most-viewed-item">
                    <span className="vne-most-viewed-rank">{index + 1}</span>
                    <Link href={`/demo/post/${post.slug}`} className="vne-most-viewed-title">
                      {post.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Tags */}
            <div className="vne-widget">
              <div className="vne-widget-header">
                <h3 className="vne-widget-title">Chủ đề hot</h3>
              </div>
              <div className="vne-widget-body">
                <div className="vne-tags">
                  {trendingTags.map((tag) => (
                    <Link key={tag._id} href={`/demo/tag/${tag.slug}`} className="vne-tag">
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="vne-footer">
        <div className="vne-container">
          <div className="vne-footer-copyright">
            © 2024 Vật Liệu XD. Bản quyền thuộc về ManagePost Demo.
          </div>
        </div>
      </footer>
    </div>
  );
}

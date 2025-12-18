"use client";

import Link from "next/link";
import { useState } from "react";
import {
  SearchOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FireOutlined,
  RightOutlined,
  HomeOutlined,
  FolderOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import type { PublicPost, PublicTag, MenuItem, HomeSectionData, PublicPagination } from "@/lib/api";

interface DemoHomepageProps {
  featured: PublicPost[];
  latest: PublicPost[];
  latestPagination: PublicPagination;
  sections: HomeSectionData[];
  mostViewed: PublicPost[];
  trendingTags: PublicTag[];
  menu: MenuItem[];
}

// Format time ago
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

export default function DemoHomepage({
  featured,
  latest,
  sections,
  mostViewed,
  trendingTags,
  menu,
}: DemoHomepageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const heroPost = featured[0];
  const subFeatured = featured.slice(1, 5);

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
            <Link href="/demo" className="vne-nav-item active">
              <HomeOutlined /> Trang chủ
            </Link>
            {menu.map((item) => (
              <Link key={item.id} href={`/demo/category/${item.slug}`} className="vne-nav-item">
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="vne-container">
        <div className="vne-main">
          {/* Content */}
          <div className="vne-content">
            {/* Featured Hero */}
            {heroPost && (
              <div className="vne-featured">
                <Link href={`/demo/post/${heroPost.slug}`} className="vne-featured-main">
                  <img
                    src={heroPost.coverImage || "https://via.placeholder.com/800x400"}
                    alt={heroPost.title}
                    className="vne-featured-image"
                  />
                  <div className="vne-featured-overlay">
                    <h1 className="vne-featured-title">{heroPost.title}</h1>
                    <p className="vne-featured-excerpt">{heroPost.excerpt}</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Sub Featured Grid */}
            {subFeatured.length > 0 && (
              <div className="vne-section">
                <div className="vne-section-header">
                  <h2 className="vne-section-title">
                    <FireOutlined /> Tin nổi bật
                  </h2>
                </div>
                <div className="vne-section-body">
                  {subFeatured.map((post) => (
                    <article key={post._id} className="vne-article">
                      <Link href={`/demo/post/${post.slug}`} className="vne-article-thumb">
                        <img
                          src={post.coverImage || "https://via.placeholder.com/200x130"}
                          alt={post.title}
                        />
                      </Link>
                      <div className="vne-article-content">
                        {post.category && (
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
                </div>
              </div>
            )}

            {/* Category Sections */}
            {sections.map((section) => (
              <div key={section.category.id} className="vne-section">
                <div className="vne-section-header">
                  <h2 className="vne-section-title">{section.category.name}</h2>
                  <Link href={`/demo/category/${section.category.slug}`} className="vne-section-more">
                    Xem thêm <RightOutlined />
                  </Link>
                </div>
                <div className="vne-section-body">
                  {section.posts.slice(0, 4).map((post, index) => (
                    <article
                      key={post._id}
                      className={index === 0 ? "vne-article" : "vne-article-sm"}
                    >
                      <Link
                        href={`/demo/post/${post.slug}`}
                        className={index === 0 ? "vne-article-thumb" : "vne-article-sm-thumb"}
                      >
                        <img
                          src={post.coverImage || "https://via.placeholder.com/200x130"}
                          alt={post.title}
                        />
                      </Link>
                      <div className={index === 0 ? "vne-article-content" : ""}>
                        {index === 0 ? (
                          <>
                            <Link href={`/demo/post/${post.slug}`}>
                              <h3 className="vne-article-title">{post.title}</h3>
                            </Link>
                            <p className="vne-article-excerpt">{post.excerpt}</p>
                            <div className="vne-article-meta">
                              <span>
                                <ClockCircleOutlined /> {timeAgo(post.publishedAt)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <Link href={`/demo/post/${post.slug}`} className="vne-article-sm-title">
                            {post.title}
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            {/* Latest News */}
            <div className="vne-section">
              <div className="vne-section-header">
                <h2 className="vne-section-title">
                  <ClockCircleOutlined /> Tin mới nhất
                </h2>
              </div>
              <div className="vne-section-body">
                {latest.map((post) => (
                  <article key={post._id} className="vne-article">
                    <Link href={`/demo/post/${post.slug}`} className="vne-article-thumb">
                      <img
                        src={post.coverImage || "https://via.placeholder.com/200x130"}
                        alt={post.title}
                      />
                    </Link>
                    <div className="vne-article-content">
                      {post.category && (
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
                      {tag.name} ({tag.postCount})
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="vne-widget">
              <div className="vne-widget-header">
                <h3 className="vne-widget-title">Danh mục</h3>
              </div>
              <div className="vne-widget-body">
                {menu.map((item) => (
                  <div key={item.id} style={{ marginBottom: 8 }}>
                    <Link
                      href={`/demo/category/${item.slug}`}
                      style={{ fontWeight: 500, color: "#333" }}
                    >
                      {item.name}
                    </Link>
                    {item.children.length > 0 && (
                      <div style={{ paddingLeft: 15, marginTop: 5 }}>
                        {item.children.map((child) => (
                          <div key={child.id} style={{ marginBottom: 4 }}>
                            <Link
                              href={`/demo/category/${child.slug}`}
                              style={{ fontSize: 13, color: "#666" }}
                            >
                              {child.name}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Posts by Category */}
            <div className="vne-widget">
              <div className="vne-widget-header">
                <h3 className="vne-widget-title">
                  <FolderOutlined /> Bài viết theo danh mục
                </h3>
              </div>
              <div className="vne-widget-body">
                {sections.slice(0, 3).map((section) => (
                  <div key={section.category.id} style={{ marginBottom: 16 }}>
                    <Link
                      href={`/demo/category/${section.category.slug}`}
                      style={{
                        fontWeight: 600,
                        color: "#c41e3a",
                        fontSize: 14,
                        display: "block",
                        marginBottom: 8,
                        borderBottom: "1px solid #eee",
                        paddingBottom: 4,
                      }}
                    >
                      {section.category.name}
                    </Link>
                    {section.posts.slice(0, 3).map((post, idx) => (
                      <div key={post._id} style={{ marginBottom: 6, paddingLeft: 8 }}>
                        <Link
                          href={`/demo/post/${post.slug}`}
                          style={{
                            fontSize: 13,
                            color: "#333",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 6,
                          }}
                        >
                          <span style={{ color: "#999", fontWeight: 500 }}>{idx + 1}.</span>
                          <span style={{ lineHeight: 1.4 }}>{post.title}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="vne-widget">
              <div className="vne-widget-header">
                <h3 className="vne-widget-title">
                  <QuestionCircleOutlined /> Câu hỏi thường gặp
                </h3>
              </div>
              <div className="vne-widget-body">
                <div className="vne-faq-list">
                  <details className="vne-faq-item">
                    <summary>Vật liệu xây dựng nào phổ biến nhất?</summary>
                    <p>Xi măng, gạch, thép, cát và đá là các vật liệu xây dựng cơ bản và phổ biến nhất trong ngành xây dựng Việt Nam.</p>
                  </details>
                  <details className="vne-faq-item">
                    <summary>Làm sao để chọn vật liệu chất lượng?</summary>
                    <p>Nên mua từ nhà cung cấp uy tín, kiểm tra chứng nhận chất lượng, và tham khảo ý kiến chuyên gia trước khi quyết định.</p>
                  </details>
                  <details className="vne-faq-item">
                    <summary>Xu hướng vật liệu xanh là gì?</summary>
                    <p>Vật liệu xanh là các sản phẩm thân thiện môi trường, tiết kiệm năng lượng như gạch không nung, sơn sinh thái, vật liệu tái chế.</p>
                  </details>
                  <details className="vne-faq-item">
                    <summary>Chi phí vật liệu chiếm bao nhiêu %?</summary>
                    <p>Thông thường chi phí vật liệu chiếm 60-70% tổng chi phí xây dựng, tùy thuộc vào loại công trình và chất lượng vật liệu.</p>
                  </details>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="vne-footer">
        <div className="vne-container">
          <div className="vne-footer-content">
            <div className="vne-footer-section">
              <h4>Về chúng tôi</h4>
              <ul>
                <li><a href="#">Giới thiệu</a></li>
                <li><a href="#">Liên hệ</a></li>
                <li><a href="#">Quảng cáo</a></li>
              </ul>
            </div>
            <div className="vne-footer-section">
              <h4>Danh mục</h4>
              <ul>
                {menu.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <Link href={`/demo/category/${item.slug}`}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="vne-footer-section">
              <h4>Theo dõi</h4>
              <ul>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Youtube</a></li>
              </ul>
            </div>
          </div>
          <div className="vne-footer-copyright">
            © 2024 Vật Liệu XD. Bản quyền thuộc về ManagePost Demo.
          </div>
        </div>
      </footer>
    </div>
  );
}

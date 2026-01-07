"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAnalytics } from "@/hooks/use-analytics";
import remarkGfm from "remark-gfm";
import {
  SearchOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FireOutlined,
  HomeOutlined,
  RightOutlined,
  UserOutlined,
  CalendarOutlined,
  ShareAltOutlined,
  FacebookFilled,
  TwitterOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { PublicPost, PublicTag, MenuItem } from "@/lib/api";

interface DemoPostDetailProps {
  post: PublicPost;
  relatedPosts: PublicPost[];
  menu: MenuItem[];
  mostViewed: PublicPost[];
  trendingTags: PublicTag[];
}

// Format date for display (Vietnamese)
function formatDateDisplay(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Format date for Schema.org (ISO 8601)
function formatDateISO(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString();
}

// Check if updated is significantly different from published
function hasBeenUpdated(publishedAt: string | null | undefined, updatedAt: string | null | undefined): boolean {
  if (!publishedAt || !updatedAt) return false;
  const published = new Date(publishedAt).getTime();
  const updated = new Date(updatedAt).getTime();
  return updated - published > 3600000; // > 1 hour
}

// FAQ Component
function FaqSection({ faqs }: { faqs?: { question: string; answer: string }[] }) {
  if (!faqs || faqs.length === 0) return null;

  // Schema.org FAQPage JSON-LD
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="vne-faq-section" itemScope itemType="https://schema.org/FAQPage">
        <h2 className="vne-faq-section-title">❓ Câu hỏi thường gặp</h2>
        <div className="vne-faq-list">
          {faqs.map((faq, idx) => (
            <details key={idx} className="vne-faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary itemProp="name">{faq.question}</summary>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

// TOC Component
function TableOfContents({ content }: { content: string }) {
  if (!content) return null;

  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }

  if (headings.length < 2) return null;

  return (
    <nav className="vne-toc" aria-label="Mục lục">
      <div className="vne-toc-header">
        <span>📑 Mục lục</span>
      </div>
      <ul className="vne-toc-list">
        {headings.map((heading, idx) => (
          <li
            key={idx}
            className={`vne-toc-item vne-toc-level-${heading.level}`}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function DemoPostDetail({
  post,
  relatedPosts,
  menu,
  mostViewed,
  trendingTags,
}: DemoPostDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    trackPostView,
    trackShareFacebook,
    trackShareTwitter,
    trackShareCopyLink,
    trackTagClick,
    trackRelatedPostClick,
    trackCategoryLinkClick,
  } = useAnalytics();

  useEffect(() => {
    if (post._id && post.slug) {
      trackPostView(post._id, post.slug);
    }
  }, [post._id, post.slug, trackPostView]);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);

    switch (platform) {
      case "facebook":
        trackShareFacebook(post._id, post.slug);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
        break;
      case "twitter":
        trackShareTwitter(post._id, post.slug);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, "_blank");
        break;
      case "copy":
        trackShareCopyLink(post._id, post.slug);
        navigator.clipboard.writeText(window.location.href);
        alert("Đã copy link!");
        break;
    }
  };

  const showUpdatedDate = hasBeenUpdated(post.publishedAt, post.updatedAt);

  // Schema.org Article JSON-LD with E-E-A-T author info
  const authorName = post.authorInfo?.name || post.author || "Admin";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    image: post.coverImage || undefined,
    author: {
      "@type": "Person",
      name: authorName,
      ...(post.authorInfo?.avatarUrl && { image: post.authorInfo.avatarUrl }),
      ...(post.authorInfo?.jobTitle && { jobTitle: post.authorInfo.jobTitle }),
      ...(post.authorInfo?.slug && { url: `/demo/author/${post.authorInfo.slug}` }),
    },
    publisher: {
      "@type": "Organization",
      name: "Vật Liệu XD",
      logo: { "@type": "ImageObject", url: "/logo.png" },
    },
    datePublished: formatDateISO(post.publishedAt),
    dateModified: formatDateISO(post.updatedAt || post.publishedAt),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "/demo" },
      ...(post.category
        ? [{ "@type": "ListItem", position: 2, name: post.category.name, item: `/demo/category/${post.category.slug}` }]
        : []),
      { "@type": "ListItem", position: post.category ? 3 : 2, name: post.title },
    ],
  };

  return (
    <div>
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
              <button aria-label="Tìm kiếm">
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
                className={`vne-nav-item ${post.category?.slug === item.slug ? "active" : ""}`}
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
        <nav className="vne-breadcrumb" aria-label="Breadcrumb">
          <Link href="/demo">
            <HomeOutlined /> Trang chủ
          </Link>
          <span className="vne-breadcrumb-sep">
            <RightOutlined />
          </span>
          {post.category && (
            <>
              <Link href={`/demo/category/${post.category.slug}`}>{post.category.name}</Link>
              <span className="vne-breadcrumb-sep">
                <RightOutlined />
              </span>
            </>
          )}
          <span style={{ color: "#999" }}>{post.title.substring(0, 50)}...</span>
        </nav>

        <div className="vne-main">
          {/* Content */}
          <div className="vne-content">
            <article className="vne-detail" itemScope itemType="https://schema.org/Article">
              {/* Category Badge */}
              {post.category && (
                <Link
                  href={`/demo/category/${post.category.slug}`}
                  className="vne-detail-category"
                  onClick={() => trackCategoryLinkClick(post._id, post.category!.slug, post.category!.name)}
                >
                  {post.category.name}
                </Link>
              )}

              {/* Title - H1 */}
              <h1 className="vne-detail-title" itemProp="headline">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="vne-detail-meta">
                {(post.authorInfo || post.author) && (
                  <span itemProp="author" itemScope itemType="https://schema.org/Person">
                    <UserOutlined /> <span itemProp="name">{post.authorInfo?.name || post.author}</span>
                  </span>
                )}
                <time dateTime={formatDateISO(post.publishedAt)} itemProp="datePublished">
                  <CalendarOutlined /> {formatDateDisplay(post.publishedAt)}
                </time>
                {showUpdatedDate && (
                  <time
                    dateTime={formatDateISO(post.updatedAt)}
                    itemProp="dateModified"
                    style={{ color: "#52c41a", fontWeight: 500 }}
                  >
                    <EditOutlined /> Cập nhật: {formatDateDisplay(post.updatedAt)}
                  </time>
                )}
                {post.readingTime && (
                  <span>
                    <ClockCircleOutlined /> {post.readingTime} phút đọc
                  </span>
                )}
                <span>
                  <EyeOutlined /> {post.viewCount.toLocaleString("vi-VN")} lượt xem
                </span>
              </div>

              {/* Share Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", padding: "12px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
                <span style={{ fontSize: 13, color: "#666" }}>Chia sẻ:</span>
                <button
                  onClick={() => handleShare("facebook")}
                  style={{ width: 36, height: 36, background: "#1877f2", color: "#fff", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="Chia sẻ lên Facebook"
                >
                  <FacebookFilled />
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  style={{ width: 36, height: 36, background: "#1da1f2", color: "#fff", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="Chia sẻ lên Twitter"
                >
                  <TwitterOutlined />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  style={{ width: 36, height: 36, background: "#666", color: "#fff", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="Copy link"
                >
                  <ShareAltOutlined />
                </button>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="vne-detail-excerpt" itemProp="description">
                  {post.excerpt}
                </p>
              )}

              {/* Cover Image */}
              {post.coverImage && (
                <figure style={{ margin: "20px 0" }}>
                  <img src={post.coverImage} alt={post.title} className="vne-detail-cover" itemProp="image" />
                </figure>
              )}

              {/* Table of Contents */}
              <TableOfContents content={post.content || ""} />

              {/* Main Content */}
              <div className="vne-detail-content" itemProp="articleBody">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "")
                        .replace(/\s+/g, "-");
                      return <h2 id={id}>{children}</h2>;
                    },
                    h3: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "")
                        .replace(/\s+/g, "-");
                      return <h3 id={id}>{children}</h3>;
                    },
                    h4: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "")
                        .replace(/\s+/g, "-");
                      return <h4 id={id}>{children}</h4>;
                    },
                  }}
                >
                  {post.content || ""}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {post.tagsRelation && post.tagsRelation.length > 0 && (
                <div className="vne-detail-tags">
                  <span className="vne-detail-tags-label">Từ khóa:</span>
                  {post.tagsRelation.map((tag) => (
                    <Link
                      key={tag._id}
                      href={`/demo/tag/${tag.slug}`}
                      className="vne-tag"
                      style={{ background: tag.color || "#f5f5f5" }}
                      onClick={() => trackTagClick(post._id, tag.slug, tag.name)}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* FAQ Section */}
              <FaqSection faqs={(post.contentStructure as any)?.sections?.find((s: any) => s.type === 'faq')?.faqs} />

              {/* Author Box */}
              {(post.authorInfo || post.author) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#f9f9f9", borderRadius: 8, margin: "24px 0" }}>
                  {post.authorInfo?.avatarUrl ? (
                    <img
                      src={post.authorInfo.avatarUrl}
                      alt={post.authorInfo.name}
                      style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: 56, height: 56, background: "#1890ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 }}>
                      <UserOutlined />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>Tác giả</span>
                    {post.authorInfo ? (
                      <Link
                        href={`/demo/author/${post.authorInfo.slug}`}
                        style={{ fontSize: 15, fontWeight: 600, color: "#333" }}
                      >
                        {post.authorInfo.name}
                      </Link>
                    ) : (
                      <strong style={{ fontSize: 15, color: "#333" }}>{post.author}</strong>
                    )}
                    {post.authorInfo?.jobTitle && (
                      <span style={{ fontSize: 13, color: "#666" }}>{post.authorInfo.jobTitle}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="vne-related">
                  <h2 className="vne-related-title">Bài viết liên quan</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                    {relatedPosts.map((relPost) => (
                      <article key={relPost._id} style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
                        <Link
                          href={`/demo/post/${relPost.slug}`}
                          onClick={() => trackRelatedPostClick(post._id, relPost._id, relPost.slug)}
                        >
                          <img
                            src={relPost.coverImage || "https://via.placeholder.com/300x200"}
                            alt={relPost.title}
                            style={{ width: "100%", height: 120, objectFit: "cover" }}
                            loading="lazy"
                          />
                        </Link>
                        <div style={{ padding: 12 }}>
                          <Link
                            href={`/demo/post/${relPost.slug}`}
                            style={{ fontSize: 14, fontWeight: 500, color: "#333", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                            onClick={() => trackRelatedPostClick(post._id, relPost._id, relPost.slug)}
                          >
                            {relPost.title}
                          </Link>
                          <time style={{ fontSize: 12, color: "#888", marginTop: 6, display: "block" }}>
                            {formatDateDisplay(relPost.publishedAt)}
                          </time>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </article>
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
                {mostViewed.map((mvPost, index) => (
                  <div key={mvPost._id} className="vne-most-viewed-item">
                    <span className="vne-most-viewed-rank">{index + 1}</span>
                    <Link href={`/demo/post/${mvPost.slug}`} className="vne-most-viewed-title">
                      {mvPost.title}
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

            {/* Categories */}
            <div className="vne-widget">
              <div className="vne-widget-header">
                <h3 className="vne-widget-title">Danh mục</h3>
              </div>
              <div className="vne-widget-body">
                {menu.map((item) => (
                  <div key={item.id} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <Link href={`/demo/category/${item.slug}`} style={{ fontWeight: 500, color: "#333" }}>
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="vne-footer">
        <div className="vne-container">
          <div className="vne-footer-copyright">
            © {new Date().getFullYear()} Vật Liệu XD. Bản quyền thuộc về ManagePost Demo.
          </div>
        </div>
      </footer>
    </div>
  );
}

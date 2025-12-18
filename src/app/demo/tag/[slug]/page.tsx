import { publicApi } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1");

  try {
    const [tagRes, menuRes] = await Promise.all([
      publicApi.getTag(slug, currentPage, 10),
      publicApi.getMenu(),
    ]);

    const { tag, posts, pagination } = tagRes.data;

    return (
      <div>
        {/* Simple Header */}
        <header className="vne-header">
          <div className="vne-container">
            <div className="vne-header-top">
              <Link href="/demo" className="vne-logo">
                Vật Liệu<span>XD</span>
              </Link>
            </div>
            <nav className="vne-nav">
              <Link href="/demo" className="vne-nav-item">Trang chủ</Link>
              {menuRes.data.map((item) => (
                <Link key={item.id} href={`/demo/category/${item.slug}`} className="vne-nav-item">
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="vne-container">
          <div className="vne-breadcrumb">
            <Link href="/demo">Trang chủ</Link>
            <span className="vne-breadcrumb-sep">›</span>
            <span>Tag: {tag.name}</span>
          </div>

          <div className="vne-section">
            <div className="vne-section-header">
              <h1 className="vne-section-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: tag.color || "#c00",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 15,
                    fontSize: 14,
                  }}
                >
                  #{tag.name}
                </span>
                <span style={{ fontSize: 14, fontWeight: "normal", color: "#666" }}>
                  {pagination.total} bài viết
                </span>
              </h1>
            </div>
            <div className="vne-section-body">
              {posts.map((post) => (
                <article key={post._id} className="vne-article">
                  <Link href={`/demo/post/${post.slug}`} className="vne-article-thumb">
                    <img
                      src={post.coverImage || "https://via.placeholder.com/200x130"}
                      alt={post.title}
                    />
                  </Link>
                  <div className="vne-article-content">
                    {post.category && (
                      <Link href={`/demo/category/${post.category.slug}`} className="vne-article-category">
                        {post.category.name}
                      </Link>
                    )}
                    <Link href={`/demo/post/${post.slug}`}>
                      <h3 className="vne-article-title">{post.title}</h3>
                    </Link>
                    <p className="vne-article-excerpt">{post.excerpt}</p>
                    <div className="vne-article-meta">
                      <span>{post.viewCount} lượt xem</span>
                    </div>
                  </div>
                </article>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="vne-pagination">
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <Link
                      key={i + 1}
                      href={`/demo/tag/${slug}?page=${i + 1}`}
                      className={`vne-pagination-item ${pagination.page === i + 1 ? "active" : ""}`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="vne-footer">
          <div className="vne-container">
            <div className="vne-footer-copyright">© 2024 Vật Liệu XD</div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h2>Không tìm thấy tag</h2>
        <a href="/demo">← Quay lại trang chủ</a>
      </div>
    );
  }
}

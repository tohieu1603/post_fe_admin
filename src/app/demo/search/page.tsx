import { publicApi } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const query = q || "";
  const currentPage = parseInt(page || "1");

  if (!query) {
    return (
      <div>
        <header className="vne-header">
          <div className="vne-container">
            <div className="vne-header-top">
              <Link href="/demo" className="vne-logo">
                Vật Liệu<span>XD</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="vne-container" style={{ padding: "50px 0", textAlign: "center" }}>
          <h2>Vui lòng nhập từ khóa tìm kiếm</h2>
          <a href="/demo">← Quay lại trang chủ</a>
        </main>
      </div>
    );
  }

  try {
    const [searchRes, menuRes] = await Promise.all([
      publicApi.search(query, { page: currentPage, limit: 10 }),
      publicApi.getMenu(),
    ]);

    const { posts, pagination } = searchRes.data;

    return (
      <div>
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
            <span>Tìm kiếm: "{query}"</span>
          </div>

          <div className="vne-section">
            <div className="vne-section-header">
              <h1 className="vne-section-title">
                Kết quả tìm kiếm: "{query}"
              </h1>
              <span style={{ fontSize: 14, color: "#666" }}>
                {pagination.total} kết quả
              </span>
            </div>
            <div className="vne-section-body">
              {posts.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: "#666" }}>
                  Không tìm thấy kết quả nào cho "{query}"
                </div>
              ) : (
                posts.map((post) => (
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
                ))
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="vne-pagination">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => (
                    <Link
                      key={i + 1}
                      href={`/demo/search?q=${encodeURIComponent(query)}&page=${i + 1}`}
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
        <h2>Lỗi tìm kiếm</h2>
        <a href="/demo">← Quay lại trang chủ</a>
      </div>
    );
  }
}

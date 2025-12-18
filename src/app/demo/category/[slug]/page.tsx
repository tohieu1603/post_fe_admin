import { publicApi } from "@/lib/api";
import DemoCategoryPage from "./demo-category-page";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1");

  try {
    const [categoryRes, menuRes, mostViewedRes, trendingTagsRes] = await Promise.all([
      publicApi.getCategory(slug, currentPage, 10),
      publicApi.getMenu(),
      publicApi.getMostViewed(10, "week"),
      publicApi.getTrendingTags(15),
    ]);

    return (
      <DemoCategoryPage
        category={categoryRes.data.category}
        subcategories={categoryRes.data.subcategories}
        posts={categoryRes.data.posts}
        pagination={categoryRes.data.pagination}
        menu={menuRes.data}
        mostViewed={mostViewedRes.data}
        trendingTags={trendingTagsRes.data}
      />
    );
  } catch (error) {
    console.error("Error loading category:", error);
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h2>Không tìm thấy danh mục</h2>
        <a href="/demo">← Quay lại trang chủ</a>
      </div>
    );
  }
}

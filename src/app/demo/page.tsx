import { publicApi } from "@/lib/api";
import DemoHomepage from "./demo-homepage";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  try {
    const [featuredRes, latestRes, sectionsRes, mostViewedRes, trendingTagsRes, menuRes] = await Promise.all([
      publicApi.getFeatured(5),
      publicApi.getLatest(1, 10),
      publicApi.getHomeSections(5),
      publicApi.getMostViewed(10, "week"),
      publicApi.getTrendingTags(15),
      publicApi.getMenu(),
    ]);

    return (
      <DemoHomepage
        featured={featuredRes.data}
        latest={latestRes.data}
        latestPagination={latestRes.pagination}
        sections={sectionsRes.data}
        mostViewed={mostViewedRes.data}
        trendingTags={trendingTagsRes.data}
        menu={menuRes.data}
      />
    );
  } catch (error) {
    console.error("Error loading demo page:", error);
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h2>Không thể tải dữ liệu</h2>
        <p>Vui lòng kiểm tra backend server đang chạy và có dữ liệu.</p>
        <p>Chạy: <code>cd backend && npm run seed:construction && npm run seed:posts</code></p>
      </div>
    );
  }
}

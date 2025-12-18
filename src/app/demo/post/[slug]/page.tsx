import { publicApi } from "@/lib/api";
import DemoPostDetail from "./demo-post-detail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    const [postRes, relatedRes, menuRes, mostViewedRes, trendingTagsRes] = await Promise.all([
      publicApi.getPost(slug),
      publicApi.getRelatedPosts(slug, 5),
      publicApi.getMenu(),
      publicApi.getMostViewed(10, "week"),
      publicApi.getTrendingTags(15),
    ]);

    return (
      <DemoPostDetail
        post={postRes.data}
        relatedPosts={relatedRes.data}
        menu={menuRes.data}
        mostViewed={mostViewedRes.data}
        trendingTags={trendingTagsRes.data}
      />
    );
  } catch (error) {
    console.error("Error loading post:", error);
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h2>Không tìm thấy bài viết</h2>
        <a href="/demo">← Quay lại trang chủ</a>
      </div>
    );
  }
}

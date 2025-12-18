import { postApi, categoryApi, PostsResponse, Category } from "@/lib/api";
import PostsClient from "./posts-client";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  let posts: PostsResponse = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    [posts, categories] = await Promise.all([
      postApi.getAll({ page: 1, limit: 10 }),
      categoryApi.getAll(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải dữ liệu";
  }

  return (
    <PostsClient
      initialPosts={posts}
      initialCategories={categories}
      initialError={error}
    />
  );
}

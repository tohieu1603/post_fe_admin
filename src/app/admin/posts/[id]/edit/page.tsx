import { postApi, categoryApi, Category, Post } from "@/lib/api";
import PostFormClient from "../../post-form-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  let post: Post | null = null;
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    [post, categories] = await Promise.all([
      postApi.getById(id),
      categoryApi.getAll(),
    ]);
  } catch (e) {
    if ((e as Error).message === "Post not found") {
      notFound();
    }
    error = e instanceof Error ? e.message : "Không thể tải bài viết";
  }

  return (
    <PostFormClient
      post={post}
      categories={categories}
      initialError={error}
    />
  );
}

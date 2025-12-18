import { categoryApi, Category } from "@/lib/api";
import PostFormClient from "../post-form-client";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    categories = await categoryApi.getAll();
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải danh mục";
  }

  return (
    <PostFormClient
      categories={categories}
      initialError={error}
    />
  );
}

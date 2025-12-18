import { categoryApi } from "@/lib/api";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: any[] = [];
  let treeCategories: any[] = [];
  let error = null;

  try {
    [categories, treeCategories] = await Promise.all([
      categoryApi.getAll(),
      categoryApi.getTree(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải danh mục";
  }

  return (
    <CategoriesClient
      initialCategories={categories}
      initialTreeCategories={treeCategories}
      initialError={error}
    />
  );
}

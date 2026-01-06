import { authorApi } from "@/lib/api";
import AuthorsClient from "./authors-client";

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  let authors: any = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  let error = null;

  try {
    authors = await authorApi.getAll({ page: 1, limit: 20 });
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải danh sách tác giả";
  }

  return (
    <AuthorsClient
      initialAuthors={authors}
      initialError={error}
    />
  );
}

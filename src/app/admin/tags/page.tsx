import { tagApi } from "@/lib/api";
import TagsClient from "./tags-client";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  let tags: any[] = [];
  let error = null;

  try {
    tags = await tagApi.getAll();
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải tags";
  }

  return <TagsClient initialTags={tags} initialError={error} />;
}

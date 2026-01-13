import { dictionaryApi } from "@/lib/api";
import DictionaryClient from "./dictionary-client";

export const dynamic = "force-dynamic";

export default async function DictionaryPage() {
  let dictionary: any = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  let error = null;

  try {
    dictionary = await dictionaryApi.getAll({ page: 1, limit: 20 });
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải danh sách từ điển";
  }

  return (
    <DictionaryClient
      initialData={dictionary}
      initialError={error}
    />
  );
}

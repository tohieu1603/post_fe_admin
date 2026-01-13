import { dictionaryApi } from "@/lib/api";
import DictionaryDetailClient from "./dictionary-detail-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DictionaryDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const term = await dictionaryApi.getById(id);
    return <DictionaryDetailClient term={term} />;
  } catch (error) {
    notFound();
  }
}

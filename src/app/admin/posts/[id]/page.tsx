import { postApi } from "@/lib/api";
import { notFound } from "next/navigation";
import PostViewClient from "./post-view-client";

export const dynamic = "force-dynamic";

interface ViewPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewPostPage({ params }: ViewPostPageProps) {
  const { id } = await params;

  let post = null;

  try {
    post = await postApi.getById(id);
  } catch (e) {
    notFound();
  }

  if (!post) {
    notFound();
  }

  return <PostViewClient post={post} />;
}

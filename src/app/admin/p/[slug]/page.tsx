import { postApi } from "@/lib/api";
import { notFound } from "next/navigation";
import PostTemplateRenderer from "@/components/post-template-renderer";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PublicPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PublicPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await postApi.getBySlug(slug);

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      keywords: post.metaKeywords || undefined,
      openGraph: {
        title: post.ogTitle || post.title,
        description: post.ogDescription || post.excerpt || undefined,
        images: post.ogImage ? [post.ogImage] : post.coverImage ? [post.coverImage] : undefined,
        type: "article",
        publishedTime: post.publishedAt || undefined,
        authors: post.author ? [post.author] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.twitterTitle || post.title,
        description: post.twitterDescription || post.excerpt || undefined,
        images: post.twitterImage ? [post.twitterImage] : post.coverImage ? [post.coverImage] : undefined,
      },
      alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    };
  } catch {
    return {
      title: "Bài viết không tồn tại",
    };
  }
}

export default async function PublicPostPage({ params }: PublicPostPageProps) {
  const { slug } = await params;

  let post = null;

  try {
    post = await postApi.getBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) {
    notFound();
  }

  return <PostTemplateRenderer post={post} />;
}

"use client";

import { Post } from "@/lib/api";
import { TemplateId } from "@/lib/templates";
import {
  TemplateAnimations,
  defaultTemplateAnimations,
  getAnimationClass,
  AnimationConfig,
} from "@/lib/animations";
import { LandingBlock } from "@/lib/landing-blocks";
import BlockPreview from "@/components/landing-builder/block-preview";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography, Tag, Space, Button, Divider } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

interface PostTemplateRendererProps {
  post: Post;
  isPreview?: boolean;
  animations?: TemplateAnimations;
}

export default function PostTemplateRenderer({
  post,
  isPreview = false,
  animations: propAnimations,
}: PostTemplateRendererProps) {
  const templateId = (post.template || "blog") as TemplateId;
  const editorMode = (post.customFields?.editorMode as string) || "markdown";
  const landingBlocks = (post.customFields?.landingBlocks as LandingBlock[]) || [];

  // If using landing-builder mode, render blocks
  if (editorMode === "landing-builder" && landingBlocks.length > 0) {
    return <BlockPreview blocks={landingBlocks} />;
  }

  // Get animations from props, customFields, or defaults
  const animations: TemplateAnimations =
    propAnimations ||
    (post.customFields?.animations as TemplateAnimations) ||
    defaultTemplateAnimations[templateId] ||
    {};

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Animation wrapper component
  const Animated = ({
    config,
    children,
    className = "",
    style = {},
  }: {
    config?: AnimationConfig;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => {
    const animClass = getAnimationClass(config);
    return (
      <div className={`${animClass} ${className}`.trim()} style={style}>
        {children}
      </div>
    );
  };

  // Shared meta info component
  const MetaInfo = ({ light = false }: { light?: boolean }) => (
    <Space wrap size="middle" style={{ color: light ? "rgba(255,255,255,0.8)" : "#666" }}>
      {post.author && (
        <span>
          <UserOutlined /> {post.author}
        </span>
      )}
      <span>
        <CalendarOutlined /> {formatDate(post.createdAt)}
      </span>
      {post.readingTime && (
        <span>
          <ClockCircleOutlined /> {post.readingTime} phút đọc
        </span>
      )}
    </Space>
  );

  // Shared tags component
  const Tags = () =>
    post.tags && post.tags.length > 0 ? (
      <Animated config={animations.tags} style={{ marginTop: 16 }}>
        <TagsOutlined style={{ marginRight: 8 }} />
        {post.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Animated>
    ) : null;

  // Shared markdown content
  const Content = () => (
    <Animated config={animations.content}>
      <div className="prose" style={{ maxWidth: "none" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </Animated>
  );

  // Animated image component
  const AnimatedImage = ({
    src,
    alt,
    style,
  }: {
    src: string;
    alt: string;
    style?: React.CSSProperties;
  }) => (
    <Animated config={animations.images}>
      <img
        src={src}
        alt={alt}
        className="img-effect-zoom"
        style={{ ...style, cursor: "pointer" }}
      />
    </Animated>
  );

  // Back button for preview
  const BackButton = () =>
    isPreview ? null : (
      <Link href="/admin/posts">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 24 }}>
          Quay lại
        </Button>
      </Link>
    );

  // Template: Blog Classic
  const BlogTemplate = () => (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <BackButton />
      {post.coverImage && (
        <AnimatedImage
          src={post.coverImage}
          alt={post.title}
          style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 8, marginBottom: 24 }}
        />
      )}
      <Animated config={animations.hero}>
        <Title level={1}>{post.title}</Title>
        <MetaInfo />
        {post.excerpt && (
          <Paragraph italic style={{ fontSize: 18, color: "#666", marginTop: 16 }}>
            {post.excerpt}
          </Paragraph>
        )}
      </Animated>
      <Divider />
      <Content />
      <Tags />
    </div>
  );

  // Template: Landing Hero
  const LandingHeroTemplate = () => (
    <div>
      {/* Hero Section */}
      <Animated config={animations.hero}>
        <div
          style={{
            minHeight: 500,
            background: post.coverImage
              ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${post.coverImage}) center/cover`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "60px 20px",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: 800 }}>
            <Title level={1} style={{ color: "#fff", fontSize: 48, marginBottom: 24 }}>
              {post.title}
            </Title>
            {post.excerpt && (
              <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 20, marginBottom: 24 }}>
                {post.excerpt}
              </Paragraph>
            )}
            <MetaInfo light />
          </div>
        </div>
      </Animated>
      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
        <Content />
        <Tags />
      </div>
    </div>
  );

  // Template: Landing Split
  const LandingSplitTemplate = () => (
    <div>
      {/* Split Hero */}
      <div style={{ display: "flex", minHeight: 500, flexWrap: "wrap" }}>
        {/* Image Side */}
        <Animated
          config={animations.images}
          style={{
            flex: "1 1 50%",
            minWidth: 300,
            background: post.coverImage
              ? `url(${post.coverImage}) center/cover`
              : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            minHeight: 300,
          }}
        >
          <div />
        </Animated>
        {/* Content Side */}
        <Animated
          config={animations.hero}
          style={{
            flex: "1 1 50%",
            minWidth: 300,
            display: "flex",
            alignItems: "center",
            padding: "60px 40px",
            background: "#f9f9f9",
          }}
        >
          <div>
            <Title level={1} style={{ fontSize: 36 }}>
              {post.title}
            </Title>
            {post.excerpt && (
              <Paragraph style={{ fontSize: 18, color: "#666" }}>{post.excerpt}</Paragraph>
            )}
            <MetaInfo />
          </div>
        </Animated>
      </div>
      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
        <Content />
        <Tags />
      </div>
    </div>
  );

  // Template: Gallery
  const GalleryTemplate = () => (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <BackButton />
        {/* Large featured image */}
        {post.coverImage && (
          <Animated config={animations.images} style={{ marginBottom: 32 }}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="img-effect-shine"
              style={{ width: "100%", height: 500, objectFit: "cover", borderRadius: 12 }}
            />
          </Animated>
        )}
        <Animated config={animations.hero} style={{ textAlign: "center", marginBottom: 40 }}>
          <Title level={1}>{post.title}</Title>
          <MetaInfo />
        </Animated>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Content />
          <Tags />
        </div>
      </div>
    </div>
  );

  // Template: Minimal
  const MinimalTemplate = () => (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 20px" }}>
      <BackButton />
      <Animated config={animations.hero} style={{ textAlign: "center", marginBottom: 60 }}>
        <Title level={1} style={{ fontWeight: 300, fontSize: 42 }}>
          {post.title}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          {formatDate(post.createdAt)} {post.author && `• ${post.author}`}
        </Text>
      </Animated>
      <div style={{ fontSize: 18, lineHeight: 1.8 }}>
        <Content />
      </div>
      <Tags />
    </div>
  );

  // Template: Magazine
  const MagazineTemplate = () => (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <BackButton />
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        {/* Main Content */}
        <div style={{ flex: "1 1 65%", minWidth: 300 }}>
          {post.coverImage && (
            <AnimatedImage
              src={post.coverImage}
              alt={post.title}
              style={{
                width: "100%",
                height: 350,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 24,
              }}
            />
          )}
          <Animated config={animations.hero}>
            <Title level={1}>{post.title}</Title>
            {post.excerpt && (
              <Paragraph
                italic
                style={{
                  fontSize: 18,
                  color: "#666",
                  borderLeft: "3px solid #1890ff",
                  paddingLeft: 16,
                }}
              >
                {post.excerpt}
              </Paragraph>
            )}
          </Animated>
          <Content />
        </div>
        {/* Sidebar */}
        <Animated config={animations.sidebar} style={{ flex: "1 1 25%", minWidth: 250 }}>
          <div style={{ position: "sticky", top: 20 }}>
            <div style={{ background: "#f5f5f5", padding: 20, borderRadius: 8, marginBottom: 20 }}>
              <Title level={5}>Thông tin</Title>
              <div style={{ marginBottom: 8 }}>
                <UserOutlined /> {post.author || "Ẩn danh"}
              </div>
              <div style={{ marginBottom: 8 }}>
                <CalendarOutlined /> {formatDate(post.createdAt)}
              </div>
              {post.readingTime && (
                <div>
                  <ClockCircleOutlined /> {post.readingTime} phút đọc
                </div>
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div style={{ background: "#f5f5f5", padding: 20, borderRadius: 8 }}>
                <Title level={5}>Tags</Title>
                {post.tags.map((tag) => (
                  <Tag key={tag} style={{ marginBottom: 4 }}>
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </Animated>
      </div>
    </div>
  );

  // Template: Centered
  const CenteredTemplate = () => (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <BackButton />
      {post.coverImage && (
        <Animated config={animations.images} style={{ marginBottom: 40 }}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="img-effect-glow animate-float"
            style={{ width: 150, height: 150, objectFit: "cover", borderRadius: "50%", margin: "0 auto" }}
          />
        </Animated>
      )}
      <Animated config={animations.hero} style={{ maxWidth: 600, margin: "0 auto" }}>
        <Title level={1} style={{ fontWeight: 400 }}>
          {post.title}
        </Title>
        <MetaInfo />
        {post.excerpt && (
          <Paragraph style={{ fontSize: 18, color: "#666", marginTop: 24 }}>{post.excerpt}</Paragraph>
        )}
      </Animated>
      <Divider />
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "left" }}>
        <Content />
        <Tags />
      </div>
    </div>
  );

  // Template: Dark
  const DarkTemplate = () => (
    <div style={{ background: "#1a1a2e", color: "#eee", minHeight: "100vh" }}>
      {/* Hero */}
      <Animated config={animations.hero}>
        <div
          style={{
            minHeight: 400,
            background: post.coverImage
              ? `linear-gradient(rgba(26,26,46,0.8), rgba(26,26,46,0.95)), url(${post.coverImage}) center/cover`
              : "linear-gradient(135deg, #232526 0%, #414345 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          <div style={{ maxWidth: 800 }}>
            <Title level={1} style={{ color: "#fff", fontSize: 42 }}>
              {post.title}
            </Title>
            {post.excerpt && (
              <Paragraph style={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>
                {post.excerpt}
              </Paragraph>
            )}
            <MetaInfo light />
          </div>
        </div>
      </Animated>
      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
        <Animated config={animations.content}>
          <div className="prose prose-invert" style={{ maxWidth: "none", color: "#ddd" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </Animated>
        {post.tags && post.tags.length > 0 && (
          <Animated config={animations.tags} style={{ marginTop: 32 }}>
            {post.tags.map((tag) => (
              <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                {tag}
              </Tag>
            ))}
          </Animated>
        )}
      </div>
    </div>
  );

  // Render template based on selection
  const templateComponents: Record<TemplateId, React.ReactNode> = {
    blog: <BlogTemplate />,
    "landing-hero": <LandingHeroTemplate />,
    "landing-split": <LandingSplitTemplate />,
    gallery: <GalleryTemplate />,
    minimal: <MinimalTemplate />,
    magazine: <MagazineTemplate />,
    centered: <CenteredTemplate />,
    dark: <DarkTemplate />,
  };

  return templateComponents[templateId] || <BlogTemplate />;
}

"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Segmented,
  Button,
  Modal,
  Collapse,
  Select,
  Divider,
  Tooltip,
} from "antd";
import {
  CheckCircleFilled,
  EyeOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { templates, Template, TemplateId } from "@/lib/templates";
import {
  animations,
  animationSpeeds,
  animationDelays,
  AnimationType,
  AnimationSpeed,
  AnimationDelay,
  TemplateAnimations,
  defaultTemplateAnimations,
  getAnimationClass,
} from "@/lib/animations";
import PostTemplateRenderer from "./post-template-renderer";
import { Post } from "@/lib/api";

const { Text, Title } = Typography;

interface TemplateSelectorProps {
  value?: string | null;
  onChange?: (value: string) => void;
  animationSettings?: TemplateAnimations;
  onAnimationChange?: (settings: TemplateAnimations) => void;
  // For preview
  postData?: Partial<Post>;
}

export default function TemplateSelector({
  value,
  onChange,
  animationSettings,
  onAnimationChange,
  postData,
}: TemplateSelectorProps) {
  const [filter, setFilter] = useState<"all" | Template["category"]>("all");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showAnimationSettings, setShowAnimationSettings] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const filteredTemplates =
    filter === "all" ? templates : templates.filter((t) => t.category === filter);

  const handleSelect = (templateId: TemplateId) => {
    onChange?.(templateId);
    // Apply default animations for this template
    if (onAnimationChange && defaultTemplateAnimations[templateId]) {
      onAnimationChange(defaultTemplateAnimations[templateId]);
    }
  };

  const currentAnimations = animationSettings || defaultTemplateAnimations[value || "blog"] || {};

  const handleAnimationChange = (
    section: keyof TemplateAnimations,
    field: "type" | "speed" | "delay",
    val: string
  ) => {
    const updated = {
      ...currentAnimations,
      [section]: {
        ...currentAnimations[section],
        [field]: val,
      },
    };
    onAnimationChange?.(updated);
  };

  // Create preview post data
  const previewPost: Post = {
    id: "preview",
    title: postData?.title || "Tiêu đề bài viết mẫu",
    subtitle: null,
    slug: "preview-post",
    excerpt: postData?.excerpt || "Đây là mô tả ngắn của bài viết, giúp người đọc hiểu nhanh nội dung chính.",
    content: postData?.content || `# Giới thiệu

Đây là nội dung mẫu để xem trước template. Bạn có thể thấy cách bài viết sẽ hiển thị với template này.

## Tính năng

- Hỗ trợ **Markdown** đầy đủ
- Hiển thị đẹp mắt
- Responsive trên mọi thiết bị

## Code Example

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

> Đây là một blockquote mẫu

Cảm ơn bạn đã xem!`,
    coverImage: postData?.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200",
    categoryId: "preview",
    category: { id: "preview", name: "Preview", slug: "preview", description: null, parentId: null, sortOrder: 0, isActive: true, createdAt: "", updatedAt: "" },
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 1234,
    authorId: null,
    author: postData?.author || "Tác giả",
    tags: postData?.tags || ["Tag 1", "Tag 2", "Tag 3"],
    metaTitle: null,
    metaDescription: null,
    metaKeywords: null,
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImage: null,
    isFeatured: true,
    allowComments: true,
    readingTime: 5,
    template: value || "blog",
    customFields: { animations: currentAnimations },
    isTrending: false,
    trendingRank: null,
    trendingAt: null,
    shareCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const animationSections: { key: keyof TemplateAnimations; label: string; icon: string }[] = [
    { key: "hero", label: "Hero / Tiêu đề", icon: "🎯" },
    { key: "content", label: "Nội dung", icon: "📝" },
    { key: "images", label: "Hình ảnh", icon: "🖼️" },
    { key: "sidebar", label: "Sidebar", icon: "📊" },
    { key: "tags", label: "Tags", icon: "🏷️" },
  ];

  const animationCategories = [
    { label: "Fade", value: "fade" },
    { label: "Slide", value: "slide" },
    { label: "Zoom", value: "zoom" },
    { label: "Special", value: "special" },
  ];

  return (
    <div>
      {/* Filter & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Segmented
          value={filter}
          onChange={(val) => setFilter(val as typeof filter)}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Blog", value: "blog" },
            { label: "Landing", value: "landing" },
            { label: "Creative", value: "creative" },
          ]}
        />
        <Space>
          <Tooltip title="Cài đặt Animation">
            <Button
              icon={<ThunderboltOutlined />}
              onClick={() => setShowAnimationSettings(!showAnimationSettings)}
              type={showAnimationSettings ? "primary" : "default"}
            >
              Animation
            </Button>
          </Tooltip>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setPreviewKey((k) => k + 1);
              setPreviewVisible(true);
            }}
            type="primary"
          >
            Xem trước
          </Button>
        </Space>
      </div>

      {/* Animation Settings Panel */}
      {showAnimationSettings && (
        <Card
          size="small"
          style={{ marginBottom: 16, background: "#fafafa" }}
          title={
            <Space>
              <ThunderboltOutlined />
              <span>Cài đặt Animation cho từng phần</span>
            </Space>
          }
        >
          <Row gutter={[16, 12]}>
            {animationSections.map((section) => (
              <Col xs={24} sm={12} md={8} key={section.key}>
                <div style={{ marginBottom: 4 }}>
                  <Text strong>
                    {section.icon} {section.label}
                  </Text>
                </div>
                <Space.Compact style={{ width: "100%" }}>
                  <Select
                    size="small"
                    style={{ width: "60%" }}
                    value={currentAnimations[section.key]?.type || "none"}
                    onChange={(val) => handleAnimationChange(section.key, "type", val)}
                    options={animations.map((a) => ({
                      label: a.name,
                      value: a.id,
                    }))}
                    placeholder="Animation"
                  />
                  <Select
                    size="small"
                    style={{ width: "40%" }}
                    value={currentAnimations[section.key]?.speed || "normal"}
                    onChange={(val) => handleAnimationChange(section.key, "speed", val)}
                    options={animationSpeeds.map((s) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                  />
                </Space.Compact>
              </Col>
            ))}
          </Row>
          <Divider style={{ margin: "12px 0" }} />
          <div style={{ textAlign: "center" }}>
            <Button
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setPreviewKey((k) => k + 1);
                setPreviewVisible(true);
              }}
            >
              Xem preview với animation
            </Button>
          </div>
        </Card>
      )}

      {/* Template Grid */}
      <Row gutter={[12, 12]}>
        {filteredTemplates.map((template) => {
          const isSelected = value === template.id;
          return (
            <Col xs={12} sm={8} md={6} key={template.id}>
              <Card
                hoverable
                onClick={() => handleSelect(template.id)}
                style={{
                  border: isSelected ? "2px solid #1890ff" : "1px solid #d9d9d9",
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                }}
                styles={{ body: { padding: 0 } }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 10,
                    }}
                  >
                    <CheckCircleFilled style={{ fontSize: 20, color: "#1890ff" }} />
                  </div>
                )}

                {/* Preview thumbnail */}
                <div
                  style={{
                    height: 80,
                    background: template.thumbnail,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {/* Mini layout preview */}
                  <TemplatePreview templateId={template.id} />
                </div>

                {/* Info */}
                <div style={{ padding: "8px 10px" }}>
                  <Text strong style={{ fontSize: 12, display: "block" }}>
                    {template.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10, lineHeight: 1.3 }}>
                    {template.description}
                  </Text>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Xem trước Template: {templates.find((t) => t.id === value)?.name || "Blog Classic"}</span>
          </Space>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="replay"
            icon={<PlayCircleOutlined />}
            onClick={() => setPreviewKey((k) => k + 1)}
          >
            Chạy lại Animation
          </Button>,
        ]}
        styles={{
          body: {
            padding: 0,
            maxHeight: "80vh",
            overflow: "auto",
          },
        }}
      >
        <div
          key={previewKey}
          style={{
            background: value === "dark" ? "#1a1a2e" : "#fff",
            minHeight: 500,
          }}
        >
          <PostTemplateRenderer
            post={previewPost}
            isPreview={true}
            animations={currentAnimations}
          />
        </div>
      </Modal>
    </div>
  );
}

/**
 * Mini preview showing layout structure
 */
function TemplatePreview({ templateId }: { templateId: TemplateId }) {
  const boxStyle = {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 2,
  };
  const lineStyle = {
    background: "rgba(255,255,255,0.6)",
    borderRadius: 1,
    height: 3,
  };

  const layouts: Record<TemplateId, React.ReactNode> = {
    blog: (
      <div style={{ width: 50, padding: 4 }}>
        <div style={{ ...boxStyle, height: 15, marginBottom: 3 }} />
        <div style={{ ...lineStyle, width: "100%", marginBottom: 2 }} />
        <div style={{ ...lineStyle, width: "80%", marginBottom: 2 }} />
        <div style={{ ...lineStyle, width: "90%" }} />
      </div>
    ),
    "landing-hero": (
      <div style={{ width: 50, padding: 4 }}>
        <div style={{ ...boxStyle, height: 25, marginBottom: 3 }} />
        <div style={{ ...lineStyle, width: "60%", margin: "0 auto 2px" }} />
        <div style={{ ...lineStyle, width: "40%", margin: "0 auto" }} />
      </div>
    ),
    "landing-split": (
      <div style={{ width: 50, padding: 4, display: "flex", gap: 3 }}>
        <div style={{ ...boxStyle, width: 22, height: 30 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...lineStyle, width: "100%", marginBottom: 2 }} />
          <div style={{ ...lineStyle, width: "80%", marginBottom: 2 }} />
          <div style={{ ...lineStyle, width: "60%" }} />
        </div>
      </div>
    ),
    gallery: (
      <div style={{ width: 50, padding: 4 }}>
        <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
          <div style={{ ...boxStyle, width: 15, height: 12 }} />
          <div style={{ ...boxStyle, width: 15, height: 12 }} />
          <div style={{ ...boxStyle, width: 15, height: 12 }} />
        </div>
        <div style={{ ...boxStyle, height: 18 }} />
      </div>
    ),
    minimal: (
      <div style={{ width: 50, padding: 8, textAlign: "center" }}>
        <div style={{ ...lineStyle, width: "70%", margin: "0 auto 3px", height: 4 }} />
        <div style={{ ...lineStyle, width: "90%", margin: "0 auto 2px" }} />
        <div style={{ ...lineStyle, width: "80%", margin: "0 auto" }} />
      </div>
    ),
    magazine: (
      <div style={{ width: 50, padding: 4, display: "flex", gap: 3 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...boxStyle, height: 12, marginBottom: 2 }} />
          <div style={{ ...lineStyle, width: "100%", marginBottom: 2 }} />
          <div style={{ ...lineStyle, width: "80%" }} />
        </div>
        <div style={{ width: 12 }}>
          <div style={{ ...boxStyle, height: 8, marginBottom: 2 }} />
          <div style={{ ...boxStyle, height: 8 }} />
        </div>
      </div>
    ),
    centered: (
      <div style={{ width: 50, padding: 6, textAlign: "center" }}>
        <div
          style={{ ...boxStyle, width: 20, height: 20, margin: "0 auto 3px", borderRadius: "50%" }}
        />
        <div style={{ ...lineStyle, width: "80%", margin: "0 auto 2px" }} />
        <div style={{ ...lineStyle, width: "60%", margin: "0 auto" }} />
      </div>
    ),
    dark: (
      <div style={{ width: 50, padding: 4, background: "rgba(0,0,0,0.3)", borderRadius: 2 }}>
        <div
          style={{ background: "rgba(255,255,255,0.2)", height: 15, marginBottom: 3, borderRadius: 2 }}
        />
        <div
          style={{
            background: "rgba(255,255,255,0.4)",
            height: 3,
            width: "70%",
            marginBottom: 2,
            borderRadius: 1,
          }}
        />
        <div style={{ background: "rgba(255,255,255,0.3)", height: 3, width: "50%", borderRadius: 1 }} />
      </div>
    ),
  };

  return layouts[templateId] || null;
}

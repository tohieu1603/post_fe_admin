"use client";

import Link from "next/link";
import {
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Image,
  Divider,
  Row,
  Col,
  Collapse,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FolderOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TagsOutlined,
  SearchOutlined,
  ShareAltOutlined,
  TwitterOutlined,
  StarFilled,
  CommentOutlined,
  LinkOutlined,
  LayoutOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { getTemplate } from "@/lib/templates";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post } from "@/lib/api";
import PostAnalytics from "./post-analytics";

const { Title, Text, Paragraph } = Typography;

interface PostViewClientProps {
  post: Post;
}

export default function PostViewClient({ post }: PostViewClientProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      draft: { color: "warning", text: "Bản nháp" },
      published: { color: "success", text: "Đã xuất bản" },
      archived: { color: "default", text: "Đã lưu trữ" },
    };
    return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
  };

  // Check if has SEO info
  const hasBasicSeo = post.metaTitle || post.metaDescription || post.metaKeywords || post.canonicalUrl;
  const hasOpenGraph = post.ogTitle || post.ogDescription || post.ogImage;
  const hasTwitter = post.twitterTitle || post.twitterDescription || post.twitterImage;
  const hasSeoInfo = hasBasicSeo || hasOpenGraph || hasTwitter;

  const seoCollapseItems = [];

  if (hasBasicSeo) {
    seoCollapseItems.push({
      key: "basic",
      label: <Space><SearchOutlined /><span>Meta SEO</span></Space>,
      children: (
        <div style={{ fontSize: 13 }}>
          {post.metaTitle && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Title:</Text>{" "}
              <Text>{post.metaTitle}</Text>
            </div>
          )}
          {post.metaDescription && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Description:</Text>{" "}
              <Text>{post.metaDescription}</Text>
            </div>
          )}
          {post.metaKeywords && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Keywords:</Text>{" "}
              <Text>{post.metaKeywords}</Text>
            </div>
          )}
          {post.canonicalUrl && (
            <div>
              <Text type="secondary">Canonical:</Text>{" "}
              <Text copyable>{post.canonicalUrl}</Text>
            </div>
          )}
        </div>
      ),
    });
  }

  if (hasOpenGraph) {
    seoCollapseItems.push({
      key: "og",
      label: <Space><ShareAltOutlined /><span>Open Graph</span></Space>,
      children: (
        <div style={{ fontSize: 13 }}>
          {post.ogTitle && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">OG Title:</Text>{" "}
              <Text>{post.ogTitle}</Text>
            </div>
          )}
          {post.ogDescription && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">OG Description:</Text>{" "}
              <Text>{post.ogDescription}</Text>
            </div>
          )}
          {post.ogImage && (
            <div>
              <Text type="secondary">OG Image:</Text>{" "}
              <Text copyable style={{ fontSize: 12 }}>{post.ogImage}</Text>
            </div>
          )}
        </div>
      ),
    });
  }

  if (hasTwitter) {
    seoCollapseItems.push({
      key: "twitter",
      label: <Space><TwitterOutlined /><span>Twitter Card</span></Space>,
      children: (
        <div style={{ fontSize: 13 }}>
          {post.twitterTitle && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Title:</Text>{" "}
              <Text>{post.twitterTitle}</Text>
            </div>
          )}
          {post.twitterDescription && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Description:</Text>{" "}
              <Text>{post.twitterDescription}</Text>
            </div>
          )}
          {post.twitterImage && (
            <div>
              <Text type="secondary">Image:</Text>{" "}
              <Text copyable style={{ fontSize: 12 }}>{post.twitterImage}</Text>
            </div>
          )}
        </div>
      ),
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Space>
          <Link href="/admin/posts">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>
            <FileTextOutlined /> Xem bài viết
          </Title>
        </Space>
        <Space>
          <Link href={`/p/${post.slug}`} target="_blank">
            <Button icon={<GlobalOutlined />}>
              Xem Public
            </Button>
          </Link>
          <Link href={`/posts/${post.id}/edit`}>
            <Button type="primary" icon={<EditOutlined />}>
              Sửa bài viết
            </Button>
          </Link>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          {/* Title & Cover */}
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {/* Title with status */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {post.isFeatured && (
                  <Tag icon={<StarFilled />} color="gold">Nổi bật</Tag>
                )}
                {getStatusTag(post.status)}
              </div>

              <Title level={2} style={{ margin: 0 }}>
                {post.title}
              </Title>

              {/* Meta info row */}
              <Space wrap size="middle" style={{ color: "#666" }}>
                {post.author && (
                  <Text type="secondary">
                    <UserOutlined /> {post.author}
                  </Text>
                )}
                <Text type="secondary">
                  <FolderOutlined /> {post.category?.name || "Không danh mục"}
                </Text>
                <Text type="secondary">
                  <CalendarOutlined /> {formatDate(post.createdAt)}
                </Text>
                {post.readingTime && (
                  <Text type="secondary">
                    <ClockCircleOutlined /> {post.readingTime} phút đọc
                  </Text>
                )}
                <Text type="secondary">
                  <EyeOutlined /> {post.viewCount} lượt xem
                </Text>
              </Space>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div>
                  <TagsOutlined style={{ marginRight: 8, color: "#888" }} />
                  {post.tags.map((tag) => (
                    <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                  ))}
                </div>
              )}
            </Space>
          </Card>

          {/* Cover Image */}
          {post.coverImage && (
            <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
              <Image
                src={post.coverImage}
                alt={post.title}
                style={{ width: "100%", maxHeight: 400, objectFit: "cover" }}
              />
            </Card>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <Card style={{ marginBottom: 16, background: "#f9f9f9", borderLeft: "4px solid #1890ff" }}>
              <Paragraph italic style={{ margin: 0, color: "#555", fontSize: 15 }}>
                {post.excerpt}
              </Paragraph>
            </Card>
          )}

          {/* Content */}
          <Card style={{ marginBottom: 16 }}>
            <div className="prose" style={{ maxWidth: "none" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Analytics */}
          <PostAnalytics postId={post.id} />

          {/* Post Info */}
          <Card title="Thông tin" size="small" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13 }}>
              <Row style={{ marginBottom: 8 }}>
                <Col span={8}><Text type="secondary">ID:</Text></Col>
                <Col span={16}>
                  <Text copyable={{ text: post.id }} style={{ fontSize: 12 }}>
                    {post.id.substring(0, 8)}...
                  </Text>
                </Col>
              </Row>
              <Row style={{ marginBottom: 8 }}>
                <Col span={8}><Text type="secondary">Slug:</Text></Col>
                <Col span={16}>
                  <Text code copyable style={{ fontSize: 12 }}>/{post.slug}</Text>
                </Col>
              </Row>
              <Row style={{ marginBottom: 8 }}>
                <Col span={8}><Text type="secondary">Danh mục:</Text></Col>
                <Col span={16}>{post.category?.name || "-"}</Col>
              </Row>
              <Row style={{ marginBottom: 8 }}>
                <Col span={8}><Text type="secondary">Tác giả:</Text></Col>
                <Col span={16}>{post.author || "-"}</Col>
              </Row>
              <Divider style={{ margin: "12px 0" }} />
              <Row style={{ marginBottom: 8 }}>
                <Col span={8}><Text type="secondary">Tạo lúc:</Text></Col>
                <Col span={16}>{formatDate(post.createdAt)}</Col>
              </Row>
              <Row style={{ marginBottom: 8 }}>
                <Col span={8}><Text type="secondary">Cập nhật:</Text></Col>
                <Col span={16}>{formatDate(post.updatedAt)}</Col>
              </Row>
              {post.publishedAt && (
                <Row>
                  <Col span={8}><Text type="secondary">Xuất bản:</Text></Col>
                  <Col span={16}>{formatDate(post.publishedAt)}</Col>
                </Row>
              )}
            </div>
          </Card>

          {/* Template */}
          <Card
            title={<Space><LayoutOutlined /><span>Template</span></Space>}
            size="small"
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                height: 60,
                background: getTemplate(post.template).thumbnail,
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <Text strong>{getTemplate(post.template).name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {getTemplate(post.template).description}
            </Text>
          </Card>

          {/* Options */}
          <Card title="Tùy chọn" size="small" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13 }}>
              <Row style={{ marginBottom: 8 }}>
                <Col span={12}>
                  <Space>
                    <StarFilled style={{ color: post.isFeatured ? "#faad14" : "#d9d9d9" }} />
                    <Text>Nổi bật</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Tag color={post.isFeatured ? "gold" : "default"}>
                    {post.isFeatured ? "Có" : "Không"}
                  </Tag>
                </Col>
              </Row>
              <Row style={{ marginBottom: 8 }}>
                <Col span={12}>
                  <Space>
                    <CommentOutlined />
                    <Text>Bình luận</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Tag color={post.allowComments ? "success" : "default"}>
                    {post.allowComments ? "Cho phép" : "Tắt"}
                  </Tag>
                </Col>
              </Row>
              {post.readingTime && (
                <Row>
                  <Col span={12}>
                    <Space>
                      <ClockCircleOutlined />
                      <Text>Thời gian đọc</Text>
                    </Space>
                  </Col>
                  <Col span={12}>{post.readingTime} phút</Col>
                </Row>
              )}
            </div>
          </Card>

          {/* SEO Info */}
          {hasSeoInfo && (
            <Card
              title={<Space><SearchOutlined /><span>SEO</span></Space>}
              size="small"
            >
              <Collapse
                items={seoCollapseItems}
                ghost
                size="small"
                defaultActiveKey={["basic"]}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

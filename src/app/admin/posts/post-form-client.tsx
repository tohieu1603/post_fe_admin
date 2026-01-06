"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  message,
  Image,
  Collapse,
  Switch,
  InputNumber,
  Tag,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  LinkOutlined,
  SearchOutlined,
  ShareAltOutlined,
  TwitterOutlined,
  SettingOutlined,
  UserOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  StarOutlined,
  CommentOutlined,
  OrderedListOutlined,
  BulbOutlined,
  CheckOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useDebouncedCallback } from "use-debounce";
import type { Post, Category } from "@/lib/api";
import { postApi } from "@/lib/api";
import BlockEditor, { ContentBlock as BlockEditorContentBlock, generateAnchor } from "@/components/block-editor";
import SeoAiPanel from "@/components/seo-ai-panel";
import ContentOptimizer from "@/components/content-optimizer";
import ContentStructureBuilder from "@/components/content-structure/content-structure-builder";
import FaqSection, { FaqItem } from "@/components/faq-section";
import type { SmartMetaResponse, InternalLinkSuggestion, ContentStructure, HeadingSuggestion, FaqSuggestion, InternalLinkOptSuggestion } from "@/lib/api";
import { aiSeoApi } from "@/lib/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PostFormClientProps {
  post?: Post | null;
  categories: Category[];
  initialError: string | null;
}

export default function PostFormClient({
  post,
  categories,
  initialError,
}: PostFormClientProps) {
  const router = useRouter();
  const isEdit = !!post;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<BlockEditorContentBlock[]>(
    (post?.contentBlocks as BlockEditorContentBlock[]) || []
  );
  const [previewImage, setPreviewImage] = useState(post?.coverImage || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [generatingSlug, setGeneratingSlug] = useState(false);
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [readingTime, setReadingTime] = useState<number | null>(post?.readingTime || null);
  // Content Structure for article outline management
  const [contentStructure, setContentStructure] = useState<ContentStructure | null>(
    post?.contentStructure || null
  );

  // FAQ state - extract from contentStructure if exists
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    const faqSection = (post?.contentStructure as any)?.sections?.find((s: any) => s.type === 'faq');
    return faqSection?.faqs || [];
  });

  // AI Meta Suggestion state
  const [aiMetaSuggestion, setAiMetaSuggestion] = useState<SmartMetaResponse | null>(null);
  const [aiMetaLoading, setAiMetaLoading] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // Calculate reading time from blocks
  useEffect(() => {
    if (contentBlocks && contentBlocks.length > 0) {
      const wordsPerMinute = 200;
      let wordCount = 0;
      contentBlocks.forEach((block) => {
        if (block.type === "paragraph" || block.type === "quote" || block.type === "heading") {
          wordCount += (block.text || "").trim().split(/\s+/).filter(Boolean).length;
        } else if (block.type === "list") {
          wordCount += block.items.join(" ").split(/\s+/).filter(Boolean).length;
        } else if (block.type === "faq") {
          wordCount += ((block.question || "") + " " + (block.answer || "")).split(/\s+/).filter(Boolean).length;
        } else if (block.type === "table") {
          wordCount += block.headers.join(" ").split(/\s+/).filter(Boolean).length;
          wordCount += block.rows.flat().join(" ").split(/\s+/).filter(Boolean).length;
        }
      });
      const time = Math.ceil(wordCount / wordsPerMinute);
      setReadingTime(time > 0 ? time : 1);
    } else {
      setReadingTime(null);
    }
  }, [contentBlocks]);

  // Auto-generate slug from title (debounced)
  const generateSlugFromTitle = useDebouncedCallback(async (title: string) => {
    if (!title || slugManuallyEdited) return;

    setGeneratingSlug(true);
    try {
      const result = await postApi.generateSlug(title);
      form.setFieldValue("slug", result.slug);
    } catch {
      // Ignore error, user can enter manually
    } finally {
      setGeneratingSlug(false);
    }
  }, 300);

  // Extract text content from blocks for AI
  const getTextFromBlocks = (blocks: BlockEditorContentBlock[]) => {
    return blocks
      .map((block) => {
        if (block.type === "paragraph" || block.type === "quote" || block.type === "heading") {
          return block.text || "";
        } else if (block.type === "list") {
          return block.items.join(" ");
        } else if (block.type === "faq") {
          return `${block.question || ""} ${block.answer || ""}`;
        }
        return "";
      })
      .filter(Boolean)
      .join(" ");
  };

  // Auto-generate AI meta suggestions from title (debounced)
  const generateAiMetaFromTitle = useDebouncedCallback(async (title: string) => {
    if (!title || title.length < 10) {
      setAiMetaSuggestion(null);
      setShowAiSuggestion(false);
      return;
    }

    setAiMetaLoading(true);
    setShowAiSuggestion(true);
    try {
      const contentText = getTextFromBlocks(contentBlocks).substring(0, 500);
      const response = await aiSeoApi.generateSmartMeta(title, contentText);
      if (response.success && response.data) {
        setAiMetaSuggestion(response.data);
      }
    } catch {
      // Ignore error silently
    } finally {
      setAiMetaLoading(false);
    }
  }, 800); // 800ms delay to avoid too many API calls

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    generateSlugFromTitle(e.target.value);
    generateAiMetaFromTitle(e.target.value);
  };

  // Apply AI meta suggestion
  const applyAiMetaSuggestion = () => {
    if (!aiMetaSuggestion) return;
    form.setFieldsValue({
      metaTitle: aiMetaSuggestion.metaTitle,
      metaDescription: aiMetaSuggestion.metaDescription,
      metaKeywords: [aiMetaSuggestion.focusKeyword, ...aiMetaSuggestion.secondaryKeywords].join(", "),
    });
    setShowAiSuggestion(false);
    message.success("Đã áp dụng gợi ý SEO từ AI");
  };

  // Handle slug change (mark as manually edited)
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSlugManuallyEdited(true);
    }
  };

  // Handle tag add
  const handleTagAdd = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  // Handle tag remove
  const handleTagRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Convert blocks to markdown for backward compatibility
  const blocksToMarkdown = (blocks: BlockEditorContentBlock[]): string => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "heading":
            return `${"#".repeat(block.level || 2)} ${block.text || ""}`;
          case "paragraph":
            return block.text || "";
          case "image":
            return `![${block.alt || ""}](${block.url || ""})${block.caption ? ` ${block.caption}` : ""}`;
          case "list":
            return block.items
              .map((item, idx) =>
                block.style === "ordered" ? `${idx + 1}. ${item}` : `- ${item}`
              )
              .join("\n");
          case "code":
            return `\`\`\`${block.language || ""}\n${block.code || ""}\n\`\`\``;
          case "quote":
            return (block.text || "")
              .split("\n")
              .map((line) => `> ${line}`)
              .join("\n");
          case "divider":
            return "---";
          case "table":
            const headerRow = `| ${block.headers.join(" | ")} |`;
            const separator = `| ${block.headers.map(() => "---").join(" | ")} |`;
            const dataRows = block.rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
            return `${headerRow}\n${separator}\n${dataRows}`;
          case "faq":
            return `**Q: ${block.question || ""}**\n\nA: ${block.answer || ""}`;
          default:
            return "";
        }
      })
      .filter(Boolean)
      .join("\n\n");
  };

  // Generate TOC from blocks
  const generateTocFromBlocks = (blocks: BlockEditorContentBlock[]) => {
    return blocks
      .filter((block) => block.type === "heading")
      .map((block) => ({
        id: `h${(block as any).level}-${(block as any).anchor || generateAnchor((block as any).text || "")}`,
        text: (block as any).text || "",
        level: (block as any).level || 2,
        anchor: (block as any).anchor || generateAnchor((block as any).text || ""),
      }));
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      // Generate content from blocks
      const content = blocksToMarkdown(contentBlocks);

      // Generate TOC from heading blocks
      const toc = generateTocFromBlocks(contentBlocks);

      // Calculate word count and reading time
      let wordCount = 0;
      contentBlocks.forEach((block) => {
        if (block.type === "paragraph" || block.type === "quote" || block.type === "heading") {
          wordCount += (block.text || "").split(/\s+/).filter(Boolean).length;
        } else if (block.type === "list") {
          wordCount += block.items.join(" ").split(/\s+/).filter(Boolean).length;
        } else if (block.type === "faq") {
          wordCount += ((block.question || "") + " " + (block.answer || "")).split(/\s+/).filter(Boolean).length;
        }
      });

      // Build contentStructure
      const finalContentStructure = {
        toc,
        wordCount,
        readingTime: Math.max(1, Math.ceil(wordCount / 200)),
      };

      const data: Partial<Post> = {
        title: values.title as string,
        subtitle: (values.subtitle as string) || undefined,
        slug: values.slug as string,
        content, // Markdown content for backward compatibility
        contentBlocks, // JSON blocks
        categoryId: values.categoryId as string,
        status: values.status as Post["status"],
        tags: tags.length > 0 ? tags : undefined,
        readingTime: readingTime || undefined,
        coverImage: (values.coverImage as string) || undefined,
        excerpt: (values.excerpt as string) || undefined,
        // Basic SEO
        metaTitle: (values.metaTitle as string) || undefined,
        metaDescription: (values.metaDescription as string) || undefined,
        metaKeywords: (values.metaKeywords as string) || undefined,
        canonicalUrl: (values.canonicalUrl as string) || undefined,
        // Open Graph
        ogTitle: (values.ogTitle as string) || undefined,
        ogDescription: (values.ogDescription as string) || undefined,
        ogImage: (values.ogImage as string) || undefined,
        // Twitter
        twitterTitle: (values.twitterTitle as string) || undefined,
        twitterDescription: (values.twitterDescription as string) || undefined,
        twitterImage: (values.twitterImage as string) || undefined,
        // Advanced
        author: (values.author as string) || undefined,
        isFeatured: (values.isFeatured as boolean) || false,
        allowComments: values.allowComments !== false,
        // Content Structure
        contentStructure: finalContentStructure,
      };

      if (isEdit && post) {
        await postApi.update(post.id, data);
        message.success("Cập nhật bài viết thành công");
      } else {
        await postApi.create(data);
        message.success("Tạo bài viết thành công");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Collapse items for SEO sections
  const seoCollapseItems = [
    {
      key: "basic",
      label: (
        <Space>
          <SearchOutlined />
          <span>Meta SEO cơ bản</span>
        </Space>
      ),
      children: (
        <>
          <Form.Item name="metaTitle" label="Meta Title">
            <Input placeholder="Tiêu đề SEO (60 ký tự tối ưu)" maxLength={70} showCount />
          </Form.Item>

          <Form.Item name="metaDescription" label="Meta Description">
            <TextArea
              rows={3}
              placeholder="Mô tả SEO (155-160 ký tự tối ưu)"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item name="metaKeywords" label="Meta Keywords">
            <Input placeholder="Từ khóa SEO (cách nhau bởi dấu phẩy)" />
          </Form.Item>

          <Form.Item name="canonicalUrl" label="Canonical URL">
            <Input placeholder="URL chính tắc (nếu có)" prefix={<LinkOutlined />} />
          </Form.Item>
        </>
      ),
    },
    {
      key: "opengraph",
      label: (
        <Space>
          <ShareAltOutlined />
          <span>Open Graph (Facebook, LinkedIn)</span>
        </Space>
      ),
      children: (
        <>
          <Form.Item name="ogTitle" label="OG Title">
            <Input placeholder="Tiêu đề khi chia sẻ lên Facebook" />
          </Form.Item>

          <Form.Item name="ogDescription" label="OG Description">
            <TextArea rows={2} placeholder="Mô tả khi chia sẻ lên Facebook" />
          </Form.Item>

          <Form.Item name="ogImage" label="OG Image URL">
            <Input placeholder="URL ảnh khi chia sẻ (1200x630px tối ưu)" />
          </Form.Item>
        </>
      ),
    },
    {
      key: "twitter",
      label: (
        <Space>
          <TwitterOutlined />
          <span>Twitter Card</span>
        </Space>
      ),
      children: (
        <>
          <Form.Item name="twitterTitle" label="Twitter Title">
            <Input placeholder="Tiêu đề khi chia sẻ lên Twitter" />
          </Form.Item>

          <Form.Item name="twitterDescription" label="Twitter Description">
            <TextArea rows={2} placeholder="Mô tả khi chia sẻ lên Twitter" />
          </Form.Item>

          <Form.Item name="twitterImage" label="Twitter Image URL">
            <Input placeholder="URL ảnh Twitter Card" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Space>
          <Link href="/admin/posts">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <Title level={3} style={{ margin: 0 }}>
            <FileTextOutlined /> {isEdit ? "Sửa bài viết" : "Thêm bài viết"}
          </Title>
        </Space>
      </div>

      {/* Error */}
      {initialError && (
        <Card style={{ marginBottom: 16, background: "#fff2f0", border: "1px solid #ffccc7" }}>
          <Text type="danger">{initialError}</Text>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title: post?.title || "",
          subtitle: post?.subtitle || "",
          slug: post?.slug || "",
          excerpt: post?.excerpt || "",
          coverImage: post?.coverImage || "",
          categoryId: post?.categoryId || undefined,
          status: post?.status || "draft",
          // SEO Basic
          metaTitle: post?.metaTitle || "",
          metaDescription: post?.metaDescription || "",
          metaKeywords: post?.metaKeywords || "",
          canonicalUrl: post?.canonicalUrl || "",
          // Open Graph
          ogTitle: post?.ogTitle || "",
          ogDescription: post?.ogDescription || "",
          ogImage: post?.ogImage || "",
          // Twitter
          twitterTitle: post?.twitterTitle || "",
          twitterDescription: post?.twitterDescription || "",
          twitterImage: post?.twitterImage || "",
          // Advanced
          author: post?.author || "",
          isFeatured: post?.isFeatured || false,
          allowComments: post?.allowComments !== false,
        }}
      >
        <Row gutter={24}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card style={{ marginBottom: 16 }}>
              <Form.Item
                name="title"
                label={
                  <Space>
                    <span>Tiêu đề</span>
                    {aiMetaLoading && <LoadingOutlined style={{ color: "#1890ff" }} />}
                    {!aiMetaLoading && aiMetaSuggestion && showAiSuggestion && (
                      <Tag color="blue" icon={<BulbOutlined />} style={{ cursor: "pointer" }}>
                        AI gợi ý SEO
                      </Tag>
                    )}
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input
                  placeholder="Nhập tiêu đề bài viết"
                  size="large"
                  onChange={handleTitleChange}
                />
              </Form.Item>

              {/* AI Meta Suggestion Tooltip */}
              {showAiSuggestion && aiMetaSuggestion && !aiMetaLoading && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 16,
                    color: "white",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <BulbOutlined style={{ marginRight: 8 }} />
                        <Text strong style={{ color: "white" }}>AI gợi ý SEO tự động</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Meta Title:</Text>
                        <div style={{ fontWeight: 500 }}>{aiMetaSuggestion.metaTitle}</div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Meta Description:</Text>
                        <div style={{ fontSize: 13 }}>{aiMetaSuggestion.metaDescription}</div>
                      </div>
                      <div>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Keywords:</Text>
                        <div>
                          <Tag color="white" style={{ color: "#667eea", marginRight: 4 }}>
                            {aiMetaSuggestion.focusKeyword}
                          </Tag>
                          {aiMetaSuggestion.secondaryKeywords.slice(0, 3).map((kw, i) => (
                            <Tag key={i} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", marginRight: 4 }}>
                              {kw}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Space direction="vertical" size={4}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={applyAiMetaSuggestion}
                        style={{ background: "white", color: "#667eea", border: "none" }}
                      >
                        Áp dụng
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setShowAiSuggestion(false)}
                        style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none" }}
                      >
                        Bỏ qua
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              <Form.Item
                name="subtitle"
                label="Tiêu đề phụ (tùy chọn)"
              >
                <Input
                  placeholder="Nhập tiêu đề phụ, mô tả ngắn gọn bổ sung cho tiêu đề chính"
                />
              </Form.Item>

              <Form.Item
                name="slug"
                label={
                  <Space>
                    <span>Slug</span>
                    <LinkOutlined />
                    {generatingSlug && <Text type="secondary">(đang tạo...)</Text>}
                  </Space>
                }
                tooltip="Tự động tạo từ tiêu đề, hoặc nhập thủ công"
              >
                <Input
                  placeholder="Tự động tạo từ tiêu đề"
                  onChange={handleSlugChange}
                  addonBefore="/"
                />
              </Form.Item>

              <Form.Item name="excerpt" label="Tóm tắt">
                <TextArea
                  rows={2}
                  placeholder="Nhập tóm tắt ngắn gọn (hiển thị trong danh sách)"
                  maxLength={300}
                  showCount
                />
              </Form.Item>

              {/* Content Editor - Block-based */}
              <Form.Item
                label={
                  <Space>
                    <span>Nội dung</span>
                    {readingTime && (
                      <Tag icon={<ClockCircleOutlined />} color="blue">
                        ~{readingTime} phút đọc
                      </Tag>
                    )}
                    <Tag color="purple">{contentBlocks.length} blocks</Tag>
                  </Space>
                }
              >
                <BlockEditor
                  value={contentBlocks}
                  onChange={setContentBlocks}
                  placeholder="Bấm nút + để thêm block (tiêu đề, đoạn văn, hình ảnh...)"
                />
              </Form.Item>
            </Card>

            {/* TOC Preview - Auto-generated from heading blocks */}
            {contentBlocks.filter((b) => b.type === "heading").length > 0 && (
              <Card
                title={
                  <Space>
                    <UnorderedListOutlined />
                    <span>Mục lục (tự động từ Heading)</span>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {contentBlocks
                    .filter((b) => b.type === "heading")
                    .map((block) => (
                      <li
                        key={block.id}
                        style={{
                          marginLeft: ((block as any).level - 2) * 16,
                          fontWeight: (block as any).level === 2 ? 600 : 400,
                          fontSize: (block as any).level === 2 ? 14 : 13,
                          color: (block as any).level === 2 ? "#262626" : "#595959",
                        }}
                      >
                        {(block as any).text || "(Chưa có tiêu đề)"}
                      </li>
                    ))}
                </ul>
              </Card>
            )}

            {/* FAQ Section - Optional */}
            <Card
              title={
                <Space>
                  <QuestionCircleOutlined />
                  <span>FAQ - Câu hỏi thường gặp (tùy chọn)</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                Thêm các câu hỏi thường gặp để cải thiện SEO và trải nghiệm người đọc.
                FAQ sẽ được hiển thị cuối bài viết với Schema.org markup.
              </Text>
              <FaqSection
                faqs={faqs}
                editable={true}
                onFaqsChange={setFaqs}
                title="FAQ"
              />
            </Card>

            {/* SEO Section */}
            <Card
              title={
                <Space>
                  <SearchOutlined />
                  <span>Tối ưu SEO</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Collapse items={seoCollapseItems} defaultActiveKey={["basic"]} />
            </Card>

            {/* Content Structure Builder - Article Outline */}
            {isEdit && post?.id && (
              <Card
                title={
                  <Space>
                    <OrderedListOutlined />
                    <span>Cấu trúc bài viết</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                  Quản lý cấu trúc bài viết: Heading (H1-H6), TOC, FAQ, Review, Bảng, Danh sách...
                </Text>
                <ContentStructureBuilder
                  postId={post.id}
                  structure={contentStructure}
                  onStructureChange={setContentStructure}
                />
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Publish */}
            <Card title="Xuất bản" style={{ marginBottom: 16 }}>
              <Form.Item name="status" label="Trạng thái">
                <Select
                  options={[
                    { value: "draft", label: "📝 Bản nháp" },
                    { value: "published", label: "✅ Xuất bản" },
                    { value: "archived", label: "📦 Lưu trữ" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select
                  placeholder="-- Chọn danh mục --"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                >
                  {categories
                    .filter((cat) => cat && (cat.id || (cat as unknown as { _id: string })._id))
                    .map((cat) => {
                      const catId = cat.id || (cat as unknown as { _id: string })._id;
                      return (
                        <Select.Option key={catId} value={catId}>
                          {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                block
                size="large"
              >
                {isEdit ? "Cập nhật" : "Tạo bài viết"}
              </Button>
            </Card>

            {/* Cover Image */}
            <Card title="Ảnh bìa" style={{ marginBottom: 16 }}>
              <Form.Item name="coverImage">
                <Input
                  placeholder="URL ảnh bìa"
                  onChange={(e) => setPreviewImage(e.target.value)}
                />
              </Form.Item>
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Cover preview"
                  style={{ width: "100%", maxHeight: 150, objectFit: "cover" }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesAs7ioAC0kJGMAAABbUlEQVR4nO3VMREAIBDFwNPCAMwB/gn8vAtOEHTv"
                />
              )}
            </Card>

            {/* Author & Tags */}
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span>Tác giả & Tags</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Form.Item name="author" label="Tác giả">
                <Input placeholder="Tên tác giả" prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item label={<Space><TagsOutlined /><span>Tags</span></Space>}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Thêm tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onPressEnter={(e) => {
                      e.preventDefault();
                      handleTagAdd();
                    }}
                  />
                  <Button onClick={handleTagAdd}>Thêm</Button>
                </Space.Compact>
                <div style={{ marginTop: 8 }}>
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => handleTagRemove(tag)}
                      style={{ marginBottom: 4 }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Form.Item>
            </Card>

            {/* Advanced Options */}
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  <span>Tùy chọn nâng cao</span>
                </Space>
              }
            >
              <Form.Item
                name="isFeatured"
                label={
                  <Space>
                    <StarOutlined />
                    <span>Bài viết nổi bật</span>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Divider style={{ margin: "12px 0" }} />

              <Form.Item
                name="allowComments"
                label={
                  <Space>
                    <CommentOutlined />
                    <span>Cho phép bình luận</span>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>

              <Divider style={{ margin: "12px 0" }} />

              <Form.Item
                label={
                  <Space>
                    <ClockCircleOutlined />
                    <span>Thời gian đọc</span>
                  </Space>
                }
              >
                <InputNumber
                  value={readingTime}
                  onChange={(val) => setReadingTime(val)}
                  min={1}
                  addonAfter="phút"
                  style={{ width: "100%" }}
                  placeholder="Tự động tính"
                />
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                  Tự động tính từ nội dung (~200 từ/phút)
                </Text>
              </Form.Item>
            </Card>

            {/* AI SEO Assistant */}
            <div style={{ marginTop: 16 }}>
              <SeoAiPanel
                title={form.getFieldValue("title") || ""}
                content={getTextFromBlocks(contentBlocks)}
                metaDescription={form.getFieldValue("metaDescription")}
                focusKeyword={form.getFieldValue("metaKeywords")?.split(",")[0]?.trim()}
                postId={post?.id}
                onApplyMeta={(meta: SmartMetaResponse) => {
                  form.setFieldsValue({
                    metaTitle: meta.metaTitle,
                    metaDescription: meta.metaDescription,
                    metaKeywords: [meta.focusKeyword, ...meta.secondaryKeywords].join(", "),
                  });
                }}
                onApplyLink={(link: InternalLinkSuggestion) => {
                  // Add a paragraph block with link
                  const newBlock = {
                    id: Math.random().toString(36).substring(2, 10),
                    type: "paragraph" as const,
                    text: `[${link.anchorText}](/admin/p/${link.postSlug})`,
                  };
                  setContentBlocks((prev) => [...prev, newBlock]);
                }}
              />
            </div>

            {/* Content Optimizer - AI Content Suggestions */}
            <div style={{ marginTop: 16 }}>
              <ContentOptimizer
                title={form.getFieldValue("title") || ""}
                content={getTextFromBlocks(contentBlocks)}
                focusKeyword={form.getFieldValue("metaKeywords")?.split(",")[0]?.trim()}
                postId={post?.id}
                onApplyHeading={(heading: HeadingSuggestion) => {
                  // Add heading block
                  const newBlock = {
                    id: Math.random().toString(36).substring(2, 10),
                    type: "heading" as const,
                    level: (heading.type === "h2" ? 2 : 3) as 2 | 3,
                    text: heading.text,
                    anchor: generateAnchor(heading.text),
                  };
                  setContentBlocks((prev) => [...prev, newBlock]);
                }}
                onApplyFaq={(faq: FaqSuggestion) => {
                  // Add FAQ block
                  const newBlock = {
                    id: Math.random().toString(36).substring(2, 10),
                    type: "faq" as const,
                    question: faq.question,
                    answer: faq.suggestedAnswer,
                  };
                  setContentBlocks((prev) => [...prev, newBlock]);
                }}
                onApplyLink={(link: InternalLinkOptSuggestion) => {
                  // Add a paragraph block with link
                  const newBlock = {
                    id: Math.random().toString(36).substring(2, 10),
                    type: "paragraph" as const,
                    text: `[${link.anchorText}](/admin/p/${link.targetSlug})`,
                  };
                  setContentBlocks((prev) => [...prev, newBlock]);
                }}
              />
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

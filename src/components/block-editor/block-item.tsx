"use client";

import { useState } from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Popconfirm,
  Image,
  Upload,
  message,
  Spin,
} from "antd";
import type { UploadProps } from "antd";
import {
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  FontSizeOutlined,
  AlignLeftOutlined,
  PictureOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  CodeOutlined,
  MessageOutlined,
  MinusOutlined,
  TableOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  LinkOutlined,
  LayoutOutlined,
} from "@ant-design/icons";
import { mediaApi } from "@/lib/api";
import {
  ContentBlock,
  HeadingBlock,
  generateAnchor,
} from "./types";

const { TextArea } = Input;
const { Text } = Typography;

interface BlockItemProps {
  block: ContentBlock;
  index: number;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// Block type icon component
function BlockIcon({ type }: { type: ContentBlock["type"] }) {
  const icons: Record<string, React.ReactNode> = {
    heading: <FontSizeOutlined />,
    paragraph: <AlignLeftOutlined />,
    image: <PictureOutlined />,
    list: <UnorderedListOutlined />,
    code: <CodeOutlined />,
    quote: <MessageOutlined />,
    divider: <MinusOutlined />,
    table: <TableOutlined />,
    faq: <QuestionCircleOutlined />,
    "media-text": <LayoutOutlined />,
  };
  return <>{icons[type] || <AlignLeftOutlined />}</>;
}

export default function BlockItem({
  block,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockItemProps) {
  const [imagePreview, setImagePreview] = useState(
    block.type === "image" ? block.url : ""
  );
  const [uploading, setUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");

  // Update block helper
  const updateBlock = (updates: Partial<ContentBlock>) => {
    onChange({ ...block, ...updates } as ContentBlock);
  };

  // Render block content based on type
  const renderBlockContent = () => {
    switch (block.type) {
      case "heading":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space>
              <Select
                value={block.level}
                onChange={(level) => updateBlock({ level })}
                style={{ width: 100 }}
                options={[
                  { value: 2, label: "H2" },
                  { value: 3, label: "H3" },
                  { value: 4, label: "H4" },
                  { value: 5, label: "H5" },
                  { value: 6, label: "H6" },
                ]}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Anchor: {block.anchor || "(tự động)"}
              </Text>
            </Space>
            <Input
              placeholder="Nhập tiêu đề..."
              value={block.text}
              onChange={(e) => {
                const text = e.target.value;
                updateBlock({
                  text,
                  anchor: generateAnchor(text),
                } as Partial<HeadingBlock>);
              }}
              style={{
                fontWeight: 600,
                fontSize: block.level === 2 ? 20 : block.level === 3 ? 18 : 16,
              }}
            />
          </Space>
        );

      case "paragraph":
        return (
          <TextArea
            placeholder="Nhập nội dung đoạn văn..."
            value={block.text}
            onChange={(e) => updateBlock({ text: e.target.value })}
            autoSize={{ minRows: 2, maxRows: 10 }}
          />
        );

      case "image":
        // Handle image upload
        const handleImageUpload: UploadProps["customRequest"] = async (options) => {
          const { file, onSuccess, onError } = options;
          setUploading(true);
          try {
            const result = await mediaApi.upload(file as File, "posts");
            const imageUrl = result.url;
            updateBlock({
              url: imageUrl,
              alt: result.altText || block.alt || "",
            });
            setImagePreview(imageUrl);
            message.success("Upload ảnh thành công!");
            onSuccess?.(result);
          } catch (err) {
            message.error("Upload thất bại: " + (err instanceof Error ? err.message : "Unknown error"));
            onError?.(err as Error);
          } finally {
            setUploading(false);
          }
        };

        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            {/* Mode switcher */}
            <Space>
              <Button
                type={imageInputMode === "url" ? "primary" : "default"}
                size="small"
                icon={<LinkOutlined />}
                onClick={() => setImageInputMode("url")}
              >
                Nhập URL
              </Button>
              <Button
                type={imageInputMode === "upload" ? "primary" : "default"}
                size="small"
                icon={<UploadOutlined />}
                onClick={() => setImageInputMode("upload")}
              >
                Upload ảnh
              </Button>
            </Space>

            {/* URL input or Upload */}
            {imageInputMode === "url" ? (
              <Input
                placeholder="URL hình ảnh"
                value={block.url}
                onChange={(e) => {
                  updateBlock({ url: e.target.value });
                  setImagePreview(e.target.value);
                }}
                addonBefore={<PictureOutlined />}
              />
            ) : (
              <Spin spinning={uploading} tip="Đang upload...">
                <Upload.Dragger
                  accept="image/*"
                  showUploadList={false}
                  customRequest={handleImageUpload}
                  disabled={uploading}
                  style={{ padding: "12px" }}
                >
                  {imagePreview ? (
                    <div>
                      <Image
                        src={imagePreview}
                        alt={block.alt}
                        style={{ maxWidth: 200, maxHeight: 150, objectFit: "contain" }}
                        preview={false}
                      />
                      <p style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                        Click hoặc kéo thả để thay đổi ảnh
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 24, color: "#999" }}>
                        <UploadOutlined />
                      </p>
                      <p>Click hoặc kéo thả ảnh vào đây</p>
                      <p style={{ color: "#999", fontSize: 12 }}>
                        Hỗ trợ: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </Spin>
            )}

            {/* Show URL if uploaded (readonly) */}
            {imageInputMode === "upload" && block.url && (
              <Input
                value={block.url}
                readOnly
                addonBefore={<PictureOutlined />}
                style={{ background: "#f5f5f5" }}
              />
            )}

            {/* Alt & Title */}
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Alt text (mô tả ảnh cho SEO)"
                value={block.alt}
                onChange={(e) => updateBlock({ alt: e.target.value })}
                style={{ width: "60%" }}
              />
              <Input
                placeholder="Title (tooltip)"
                value={block.title || ""}
                onChange={(e) => updateBlock({ title: e.target.value })}
                style={{ width: "40%" }}
              />
            </Space.Compact>
            <Input
              placeholder="Caption (chú thích hiển thị dưới ảnh)"
              value={block.caption || ""}
              onChange={(e) => updateBlock({ caption: e.target.value })}
            />

            {/* Link & Source */}
            <Input
              placeholder="Link (backlink khi click vào ảnh)"
              value={block.link || ""}
              onChange={(e) => updateBlock({ link: e.target.value })}
              addonBefore={<LinkOutlined />}
            />
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Nguồn ảnh (credit)"
                value={block.source || ""}
                onChange={(e) => updateBlock({ source: e.target.value })}
                style={{ width: "50%" }}
              />
              <Input
                placeholder="URL nguồn"
                value={block.sourceUrl || ""}
                onChange={(e) => updateBlock({ sourceUrl: e.target.value })}
                style={{ width: "50%" }}
              />
            </Space.Compact>

            {/* Dimensions */}
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Width (px)"
                value={block.width || ""}
                onChange={(e) => updateBlock({ width: e.target.value ? Number(e.target.value) : undefined })}
                type="number"
                style={{ width: "33%" }}
                addonBefore="W"
              />
              <Input
                placeholder="Height (px)"
                value={block.height || ""}
                onChange={(e) => updateBlock({ height: e.target.value ? Number(e.target.value) : undefined })}
                type="number"
                style={{ width: "33%" }}
                addonBefore="H"
              />
              <Select
                value={block.loading || "lazy"}
                onChange={(loading) => updateBlock({ loading })}
                style={{ width: "34%" }}
                options={[
                  { value: "lazy", label: "Lazy load" },
                  { value: "eager", label: "Eager load" },
                ]}
              />
            </Space.Compact>

            {/* Responsive - Srcset & Sizes */}
            <Input
              placeholder="srcset (VD: img-320.jpg 320w, img-640.jpg 640w)"
              value={block.srcset || ""}
              onChange={(e) => updateBlock({ srcset: e.target.value })}
              addonBefore="srcset"
            />
            <Input
              placeholder="sizes (VD: (max-width: 600px) 100vw, 50vw)"
              value={block.sizes || ""}
              onChange={(e) => updateBlock({ sizes: e.target.value })}
              addonBefore="sizes"
            />

            {/* Preview (only for URL mode) */}
            {imageInputMode === "url" && imagePreview && (
              <Image
                src={imagePreview}
                alt={block.alt}
                style={{ maxWidth: 300, maxHeight: 200, objectFit: "contain" }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              />
            )}
          </Space>
        );

      case "list":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              value={block.style}
              onChange={(style) => updateBlock({ style })}
              style={{ width: 150 }}
              options={[
                { value: "unordered", label: <><UnorderedListOutlined /> Không thứ tự</> },
                { value: "ordered", label: <><OrderedListOutlined /> Có thứ tự</> },
              ]}
            />
            {block.items.map((item, i) => (
              <Space key={i} style={{ width: "100%" }}>
                <Text style={{ width: 24 }}>
                  {block.style === "ordered" ? `${i + 1}.` : "•"}
                </Text>
                <Input
                  placeholder={`Mục ${i + 1}`}
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[i] = e.target.value;
                    updateBlock({ items: newItems });
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => {
                    if (block.items.length > 1) {
                      const newItems = block.items.filter((_, idx) => idx !== i);
                      updateBlock({ items: newItems });
                    }
                  }}
                  disabled={block.items.length <= 1}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => updateBlock({ items: [...block.items, ""] })}
              size="small"
            >
              Thêm mục
            </Button>
          </Space>
        );

      case "code":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              value={block.language}
              onChange={(language) => updateBlock({ language })}
              style={{ width: 150 }}
              showSearch
              options={[
                { value: "javascript", label: "JavaScript" },
                { value: "typescript", label: "TypeScript" },
                { value: "python", label: "Python" },
                { value: "java", label: "Java" },
                { value: "go", label: "Go" },
                { value: "rust", label: "Rust" },
                { value: "html", label: "HTML" },
                { value: "css", label: "CSS" },
                { value: "sql", label: "SQL" },
                { value: "bash", label: "Bash" },
                { value: "json", label: "JSON" },
                { value: "yaml", label: "YAML" },
                { value: "text", label: "Plain Text" },
              ]}
            />
            <TextArea
              placeholder="Nhập code..."
              value={block.code}
              onChange={(e) => updateBlock({ code: e.target.value })}
              autoSize={{ minRows: 3, maxRows: 20 }}
              style={{ fontFamily: "monospace", fontSize: 13 }}
            />
          </Space>
        );

      case "quote":
        return (
          <TextArea
            placeholder="Nhập trích dẫn..."
            value={block.text}
            onChange={(e) => updateBlock({ text: e.target.value })}
            autoSize={{ minRows: 2, maxRows: 6 }}
            style={{ fontStyle: "italic", borderLeft: "4px solid #1890ff", paddingLeft: 12 }}
          />
        );

      case "divider":
        return (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <hr style={{ border: "none", borderTop: "1px solid #d9d9d9", margin: 0 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đường kẻ phân cách
            </Text>
          </div>
        );

      case "table":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Headers:
            </Text>
            <Space wrap>
              {block.headers.map((header, i) => (
                <Input
                  key={`header-${i}`}
                  placeholder={`Cột ${i + 1}`}
                  value={header}
                  onChange={(e) => {
                    const newHeaders = [...block.headers];
                    newHeaders[i] = e.target.value;
                    updateBlock({ headers: newHeaders });
                  }}
                  style={{ width: 120 }}
                />
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => {
                  updateBlock({
                    headers: [...block.headers, `Cột ${block.headers.length + 1}`],
                    rows: block.rows.map((row) => [...row, ""]),
                  });
                }}
              />
            </Space>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
              Rows:
            </Text>
            {block.rows.map((row, rowIdx) => (
              <Space key={`row-${rowIdx}`} wrap>
                {row.map((cell, cellIdx) => (
                  <Input
                    key={`cell-${rowIdx}-${cellIdx}`}
                    placeholder=""
                    value={cell}
                    onChange={(e) => {
                      const newRows = [...block.rows];
                      newRows[rowIdx] = [...newRows[rowIdx]];
                      newRows[rowIdx][cellIdx] = e.target.value;
                      updateBlock({ rows: newRows });
                    }}
                    style={{ width: 120 }}
                  />
                ))}
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => {
                    if (block.rows.length > 1) {
                      const newRows = block.rows.filter((_, idx) => idx !== rowIdx);
                      updateBlock({ rows: newRows });
                    }
                  }}
                  disabled={block.rows.length <= 1}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => {
                updateBlock({
                  rows: [...block.rows, new Array(block.headers.length).fill("")],
                });
              }}
            >
              Thêm hàng
            </Button>
          </Space>
        );

      case "faq":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="Câu hỏi..."
              value={block.question}
              onChange={(e) => updateBlock({ question: e.target.value })}
              addonBefore="Q:"
            />
            <TextArea
              placeholder="Câu trả lời..."
              value={block.answer}
              onChange={(e) => updateBlock({ answer: e.target.value })}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Space>
        );

      case "media-text":
        return (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Layout Settings */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Space>
                <Text style={{ fontSize: 12 }}>Vị trí ảnh:</Text>
                <Select
                  value={block.mediaPosition}
                  onChange={(v) => updateBlock({ mediaPosition: v })}
                  style={{ width: 100 }}
                  size="small"
                >
                  <Select.Option value="left">Trái</Select.Option>
                  <Select.Option value="right">Phải</Select.Option>
                </Select>
              </Space>
              <Space>
                <Text style={{ fontSize: 12 }}>Tỷ lệ ảnh:</Text>
                <Select
                  value={block.mediaWidth}
                  onChange={(v) => updateBlock({ mediaWidth: v })}
                  style={{ width: 80 }}
                  size="small"
                >
                  <Select.Option value={30}>30%</Select.Option>
                  <Select.Option value={40}>40%</Select.Option>
                  <Select.Option value={50}>50%</Select.Option>
                </Select>
              </Space>
              <Space>
                <Text style={{ fontSize: 12 }}>Căn dọc:</Text>
                <Select
                  value={block.verticalAlign}
                  onChange={(v) => updateBlock({ verticalAlign: v })}
                  style={{ width: 100 }}
                  size="small"
                >
                  <Select.Option value="top">Trên</Select.Option>
                  <Select.Option value="center">Giữa</Select.Option>
                  <Select.Option value="bottom">Dưới</Select.Option>
                </Select>
              </Space>
            </div>

            {/* Preview */}
            <div
              style={{
                display: "flex",
                flexDirection: block.mediaPosition === "left" ? "row" : "row-reverse",
                gap: 16,
                padding: 12,
                background: block.backgroundColor || "#f9f9f9",
                borderRadius: block.borderRadius ?? 8,
                border: "1px dashed #d9d9d9",
                alignItems: block.verticalAlign === "top" ? "flex-start" : block.verticalAlign === "bottom" ? "flex-end" : "center",
              }}
            >
              {/* Image Section */}
              <div style={{ flex: `0 0 ${block.mediaWidth}%`, maxWidth: `${block.mediaWidth}%` }}>
                <Input
                  placeholder="URL ảnh..."
                  value={block.imageUrl}
                  onChange={(e) => updateBlock({ imageUrl: e.target.value })}
                  size="small"
                  prefix={<PictureOutlined />}
                  style={{ marginBottom: 8 }}
                />
                {block.imageUrl && (
                  <Image
                    src={block.imageUrl}
                    alt={block.imageAlt || "Preview"}
                    style={{ width: "100%", borderRadius: 4 }}
                    preview={false}
                  />
                )}
                <Input
                  placeholder="Alt text cho SEO..."
                  value={block.imageAlt}
                  onChange={(e) => updateBlock({ imageAlt: e.target.value })}
                  size="small"
                  style={{ marginTop: 8 }}
                />
                <Input
                  placeholder="Caption (tùy chọn)..."
                  value={block.imageCaption || ""}
                  onChange={(e) => updateBlock({ imageCaption: e.target.value })}
                  size="small"
                  style={{ marginTop: 4 }}
                />
                <Input
                  placeholder="Link khi click ảnh (tùy chọn)..."
                  value={block.imageLink || ""}
                  onChange={(e) => updateBlock({ imageLink: e.target.value })}
                  size="small"
                  prefix={<LinkOutlined />}
                  style={{ marginTop: 4 }}
                />
              </div>

              {/* Text Section */}
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Tiêu đề (tùy chọn)..."
                  value={block.title || ""}
                  onChange={(e) => updateBlock({ title: e.target.value })}
                  size="small"
                  style={{ marginBottom: 8, fontWeight: 600 }}
                />
                <TextArea
                  placeholder="Nội dung text..."
                  value={block.text}
                  onChange={(e) => updateBlock({ text: e.target.value })}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                />
              </div>
            </div>

            {/* Style Options */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Space>
                <Text style={{ fontSize: 12 }}>Màu nền:</Text>
                <Input
                  type="color"
                  value={block.backgroundColor || "#f9f9f9"}
                  onChange={(e) => updateBlock({ backgroundColor: e.target.value })}
                  style={{ width: 40, padding: 2 }}
                />
              </Space>
              <Space>
                <Text style={{ fontSize: 12 }}>Bo góc:</Text>
                <Select
                  value={block.borderRadius ?? 8}
                  onChange={(v) => updateBlock({ borderRadius: v })}
                  style={{ width: 70 }}
                  size="small"
                >
                  <Select.Option value={0}>0px</Select.Option>
                  <Select.Option value={4}>4px</Select.Option>
                  <Select.Option value={8}>8px</Select.Option>
                  <Select.Option value={12}>12px</Select.Option>
                  <Select.Option value={16}>16px</Select.Option>
                </Select>
              </Space>
            </div>
          </Space>
        );

      default:
        return <Text type="secondary">Không hỗ trợ block type này</Text>;
    }
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 8 }}
      styles={{
        header: { background: "#fafafa", minHeight: 40, padding: "0 12px" },
        body: { padding: 12 },
      }}
      title={
        <Space>
          <HolderOutlined style={{ cursor: "grab", color: "#999" }} />
          <BlockIcon type={block.type} />
          <Text style={{ fontSize: 13 }}>
            {block.type === "heading" ? `H${(block as HeadingBlock).level}` : block.type.toUpperCase()}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            #{index + 1}
          </Text>
        </Space>
      }
      extra={
        <Space size={4}>
          <Button
            type="text"
            size="small"
            onClick={onMoveUp}
            disabled={isFirst}
          >
            ↑
          </Button>
          <Button
            type="text"
            size="small"
            onClick={onMoveDown}
            disabled={isLast}
          >
            ↓
          </Button>
          <Popconfirm
            title="Xóa block này?"
            onConfirm={onDelete}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      }
    >
      {renderBlockContent()}
    </Card>
  );
}

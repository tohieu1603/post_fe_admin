"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Tabs,
  Button,
  Input,
  Form,
  ColorPicker,
  Space,
  Typography,
  message,
  Card,
  Row,
  Col,
} from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import type { Color } from "antd/es/color-picker";
import Editor from "@monaco-editor/react";

const { Text } = Typography;
const { TextArea } = Input;

interface SectionEditorModalProps {
  open: boolean;
  sectionKey: string;
  sectionHtml: string;
  onSave: (sectionKey: string, newHtml: string) => void;
  onCancel: () => void;
}

interface ExtractedContent {
  selector: string;
  tagName: string;
  text: string;
  path: string;
}

interface ExtractedColor {
  property: string;
  value: string;
  selector: string;
  element: string;
}

interface ExtractedImage {
  index: number;
  src: string;
  alt: string;
  title: string;
  tagName: string;  // img or background-image
  context: string;  // parent element info
}

/**
 * Section Editor Modal - Full editing capabilities
 * Tab 1: Content - Edit text
 * Tab 2: Colors - Color picker
 * Tab 3: Code - Monaco Editor for HTML
 */
export function SectionEditorModal({
  open,
  sectionKey,
  sectionHtml,
  onSave,
  onCancel,
}: SectionEditorModalProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [html, setHtml] = useState(sectionHtml);
  const [originalHtml, setOriginalHtml] = useState(sectionHtml);
  const [extractedContents, setExtractedContents] = useState<ExtractedContent[]>([]);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);

  // Extract text content from HTML
  const extractTextContent = useCallback((htmlStr: string): ExtractedContent[] => {
    if (typeof window === "undefined") return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, "text/html");
    const contents: ExtractedContent[] = [];
    let index = 0;

    const textTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "li", "button", "label"];

    textTags.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((el) => {
        // Get direct text content only
        const directText = Array.from(el.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim())
          .filter(Boolean)
          .join(" ");

        if (directText && directText.length > 2) {
          contents.push({
            selector: `${tag}-${index}`,
            tagName: tag.toUpperCase(),
            text: directText,
            path: `content-${index}`,
          });
          index++;
        }
      });
    });

    return contents;
  }, []);

  // Extract colors from HTML
  const extractColors = useCallback((htmlStr: string): ExtractedColor[] => {
    const colors: ExtractedColor[] = [];
    let index = 0;

    // Extract inline style colors
    const styleRegex = /style="([^"]*)"/g;
    const colorProps = ["color", "background-color", "background", "border-color"];

    let match;
    while ((match = styleRegex.exec(htmlStr)) !== null) {
      const styleStr = match[1];
      colorProps.forEach((prop) => {
        const propRegex = new RegExp(`${prop}:\\s*([^;]+)`, "i");
        const propMatch = styleStr.match(propRegex);
        if (propMatch) {
          const value = propMatch[1].trim();
          if (value.match(/^(#[0-9a-f]{3,8}|rgb|rgba)/i)) {
            colors.push({
              property: prop,
              value: value,
              selector: `style-${index}`,
              element: `Inline style`,
            });
            index++;
          }
        }
      });
    }

    // Extract CSS variables
    const varRegex = /var\(--([^)]+)\)/g;
    const foundVars = new Set<string>();
    while ((match = varRegex.exec(htmlStr)) !== null) {
      const varName = match[1];
      if (!foundVars.has(varName)) {
        foundVars.add(varName);
        colors.push({
          property: "CSS Variable",
          value: `var(--${varName})`,
          selector: `var-${index}`,
          element: `--${varName}`,
        });
        index++;
      }
    }

    // Extract Tailwind color classes
    const twColorRegex = /(?:bg|text|border)-(?:\[#[^\]]+\]|(?:primary|secondary|accent|gray|red|blue|green|yellow|purple|pink|orange|white|black)(?:-\d+)?)/g;
    const foundTw = new Set<string>();
    while ((match = twColorRegex.exec(htmlStr)) !== null) {
      if (!foundTw.has(match[0])) {
        foundTw.add(match[0]);
        colors.push({
          property: "Tailwind",
          value: match[0],
          selector: `tw-${index}`,
          element: "Tailwind Class",
        });
        index++;
      }
    }

    return colors;
  }, []);

  // Extract images from HTML
  const extractImages = useCallback((htmlStr: string): ExtractedImage[] => {
    if (typeof window === "undefined") return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, "text/html");
    const images: ExtractedImage[] = [];

    // Extract <img> tags
    const imgElements = doc.querySelectorAll("img");
    imgElements.forEach((img, index) => {
      const src = img.getAttribute("src") || "";
      if (src) {
        images.push({
          index,
          src,
          alt: img.getAttribute("alt") || "",
          title: img.getAttribute("title") || "",
          tagName: "img",
          context: img.parentElement?.tagName?.toLowerCase() || "unknown",
        });
      }
    });

    // Extract background-image from inline styles
    const bgRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
    let match;
    let bgIndex = images.length;
    while ((match = bgRegex.exec(htmlStr)) !== null) {
      images.push({
        index: bgIndex++,
        src: match[1],
        alt: "",
        title: "",
        tagName: "background-image",
        context: "inline-style",
      });
    }

    return images;
  }, []);

  // Initialize when modal opens
  useEffect(() => {
    if (open) {
      setHtml(sectionHtml);
      setOriginalHtml(sectionHtml);
      setActiveTab("content");
    }
  }, [open, sectionHtml]);

  // Update extracted data when HTML changes
  useEffect(() => {
    if (open && html) {
      setExtractedContents(extractTextContent(html));
      setExtractedColors(extractColors(html));
      setExtractedImages(extractImages(html));
    }
  }, [html, open, extractTextContent, extractColors, extractImages]);

  // Update text in HTML
  const updateTextContent = (path: string, newText: string) => {
    const content = extractedContents.find((c) => c.path === path);
    if (!content || !newText || newText === content.text) return;

    const oldText = content.text;
    const escapedOldText = oldText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const newHtml = html.replace(new RegExp(`>${escapedOldText}<`, "g"), `>${newText}<`);

    if (newHtml !== html) {
      setHtml(newHtml);
    }
  };

  // Update image in HTML
  const updateImage = (oldSrc: string, newSrc: string, newAlt?: string, newTitle?: string) => {
    let newHtml = html;

    // Update src
    if (newSrc && newSrc !== oldSrc) {
      const escapedOld = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      newHtml = newHtml.replace(new RegExp(escapedOld, "g"), newSrc);
    }

    // Update alt attribute
    if (newAlt !== undefined) {
      // Find img tag with this src and update alt
      const imgRegex = new RegExp(`(<img[^>]*src=["']${newSrc || oldSrc}["'][^>]*)alt=["'][^"']*["']`, "gi");
      if (imgRegex.test(newHtml)) {
        newHtml = newHtml.replace(imgRegex, `$1alt="${newAlt}"`);
      } else {
        // Add alt if not exists
        const addAltRegex = new RegExp(`(<img[^>]*src=["']${newSrc || oldSrc}["'])`, "gi");
        newHtml = newHtml.replace(addAltRegex, `$1 alt="${newAlt}"`);
      }
    }

    // Update title attribute
    if (newTitle !== undefined) {
      const imgRegex = new RegExp(`(<img[^>]*src=["']${newSrc || oldSrc}["'][^>]*)title=["'][^"']*["']`, "gi");
      if (imgRegex.test(newHtml)) {
        newHtml = newHtml.replace(imgRegex, `$1title="${newTitle}"`);
      } else if (newTitle) {
        const addTitleRegex = new RegExp(`(<img[^>]*src=["']${newSrc || oldSrc}["'])`, "gi");
        newHtml = newHtml.replace(addTitleRegex, `$1 title="${newTitle}"`);
      }
    }

    if (newHtml !== html) {
      setHtml(newHtml);
      message.success("Đã cập nhật hình ảnh");
    }
  };

  // Update color in HTML
  const updateColor = (_selector: string, oldValue: string, newColor: string) => {
    let newHtml = html;

    // For hex colors in Tailwind brackets like bg-[#xxx]
    if (oldValue.includes("[#")) {
      const escapedOld = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      newHtml = html.replace(new RegExp(escapedOld, "g"), oldValue.replace(/\[#[^\]]+\]/, `[${newColor}]`));
    }
    // For inline style colors
    else if (oldValue.match(/^#|^rgb/i)) {
      const escapedOld = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      newHtml = html.replace(new RegExp(escapedOld, "gi"), newColor);
    }

    if (newHtml !== html) {
      setHtml(newHtml);
      message.success("Đã cập nhật màu");
    }
  };

  // Preview in new tab
  const openPreview = () => {
    const previewHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${sectionKey}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --primary: #2563eb;
      --primary-light: #dbeafe;
      --primary-dark: #1d4ed8;
      --secondary: #f59e0b;
      --secondary-dark: #d97706;
      --accent: #10b981;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
    }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
    .section-title { font-size: 2rem; font-weight: 700; color: var(--gray-800); }
    .card { background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .btn-primary { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; display: inline-block; }
    .btn-secondary { background: var(--secondary); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; display: inline-block; }
    .icon-circle { width: 3rem; height: 3rem; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; }
    .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; }
    .price-tag { font-size: 2rem; font-weight: 700; color: var(--primary); }
    .pricing-highlight { border: 2px solid var(--primary); position: relative; }
    .pricing-highlight::before { content: "Phổ biến"; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body class="bg-gray-50">
${html}
</body>
</html>`;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Handle save
  const handleSave = () => {
    onSave(sectionKey, html);
    message.success(`Đã lưu section "${sectionKey}"`);
  };

  // Handle reset
  const handleReset = () => {
    setHtml(originalHtml);
    message.info("Đã khôi phục nội dung gốc");
  };

  const tabItems = [
    {
      key: "content",
      label: "Nội dung",
      children: (
        <div style={{ maxHeight: 450, overflow: "auto" }}>
          <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
            Chỉnh sửa nội dung văn bản ({extractedContents.length} items)
          </Text>
          {extractedContents.length === 0 ? (
            <Text type="secondary">Không tìm thấy nội dung text</Text>
          ) : (
            <Form layout="vertical">
              {extractedContents.slice(0, 30).map((content) => (
                <Form.Item
                  key={content.path}
                  label={
                    <Space>
                      <Text code style={{ fontSize: 11 }}>{content.tagName}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {content.text.length > 40 ? content.text.substring(0, 40) + "..." : content.text}
                      </Text>
                    </Space>
                  }
                  style={{ marginBottom: 12 }}
                >
                  <TextArea
                    defaultValue={content.text}
                    rows={content.text.length > 100 ? 3 : 1}
                    onBlur={(e) => updateTextContent(content.path, e.target.value)}
                  />
                </Form.Item>
              ))}
              {extractedContents.length > 30 && (
                <Text type="secondary">... và {extractedContents.length - 30} items khác. Dùng tab Code để sửa.</Text>
              )}
            </Form>
          )}
        </div>
      ),
    },
    {
      key: "images",
      label: `Hình ảnh (${extractedImages.length})`,
      children: (
        <div style={{ maxHeight: 450, overflow: "auto" }}>
          <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
            Chỉnh sửa URL và SEO cho hình ảnh
          </Text>
          {extractedImages.length === 0 ? (
            <Text type="secondary">Không tìm thấy hình ảnh trong section này</Text>
          ) : (
            <Form layout="vertical">
              {extractedImages.map((img) => (
                <Card
                  key={img.index}
                  size="small"
                  style={{ marginBottom: 12 }}
                  title={
                    <Space>
                      <Text code style={{ fontSize: 11 }}>{img.tagName}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {img.src.length > 50 ? "..." + img.src.slice(-50) : img.src}
                      </Text>
                    </Space>
                  }
                >
                  <Row gutter={[12, 12]}>
                    <Col span={8}>
                      {img.tagName === "img" && img.src && (
                        <div style={{
                          width: "100%",
                          height: 80,
                          background: "#f5f5f5",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden"
                        }}>
                          <img
                            src={img.src}
                            alt={img.alt}
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </Col>
                    <Col span={16}>
                      <Form.Item label="URL" style={{ marginBottom: 8 }}>
                        <Input
                          defaultValue={img.src}
                          placeholder="https://..."
                          onBlur={(e) => {
                            if (e.target.value !== img.src) {
                              updateImage(img.src, e.target.value);
                            }
                          }}
                        />
                      </Form.Item>
                      {img.tagName === "img" && (
                        <>
                          <Form.Item label="Alt Text (SEO)" style={{ marginBottom: 8 }}>
                            <Input
                              defaultValue={img.alt}
                              placeholder="Mô tả hình ảnh cho SEO"
                              onBlur={(e) => updateImage(img.src, img.src, e.target.value)}
                            />
                          </Form.Item>
                          <Form.Item label="Title" style={{ marginBottom: 0 }}>
                            <Input
                              defaultValue={img.title}
                              placeholder="Tiêu đề khi hover"
                              onBlur={(e) => updateImage(img.src, img.src, undefined, e.target.value)}
                            />
                          </Form.Item>
                        </>
                      )}
                    </Col>
                  </Row>
                </Card>
              ))}
            </Form>
          )}
          <div style={{ marginTop: 16, padding: 12, background: "#e6f7ff", borderRadius: 8, border: "1px solid #91d5ff" }}>
            <Text style={{ fontSize: 12 }}>
              <strong>SEO Tips:</strong><br />
              • Alt text: Mô tả ngắn gọn nội dung hình ảnh (60-125 ký tự)<br />
              • Title: Thông tin bổ sung khi hover (không bắt buộc)<br />
              • URL: Sử dụng URL có chứa từ khóa liên quan
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: "colors",
      label: "Màu sắc",
      children: (
        <div style={{ maxHeight: 450, overflow: "auto" }}>
          <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
            Chỉnh sửa màu sắc ({extractedColors.length} colors)
          </Text>
          {extractedColors.length === 0 ? (
            <Text type="secondary">Không tìm thấy màu sắc để chỉnh sửa</Text>
          ) : (
            <Row gutter={[12, 12]}>
              {extractedColors.map((color) => (
                <Col span={12} key={color.selector}>
                  <Card size="small" style={{ height: "100%" }}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                      <Text strong style={{ fontSize: 12 }}>{color.property}</Text>
                      <Space>
                        <Text code style={{ fontSize: 10 }}>
                          {color.value.length > 25 ? color.value.substring(0, 25) + "..." : color.value}
                        </Text>
                        {color.value.match(/^#|^\[#/) && (
                          <ColorPicker
                            defaultValue={color.value.replace(/[\[\]]/g, "")}
                            size="small"
                            onChange={(c: Color) => {
                              updateColor(color.selector, color.value, c.toHexString());
                            }}
                          />
                        )}
                      </Space>
                      <Text type="secondary" style={{ fontSize: 10 }}>{color.element}</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Tip:</strong> CSS Variables (var(--xxx)) và Tailwind classes cần sửa trong tab Code
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      label: "Code HTML",
      children: (
        <div>
          <Text type="secondary" style={{ marginBottom: 8, display: "block" }}>
            Chỉnh sửa HTML trực tiếp
          </Text>
          <div style={{ border: "1px solid #d9d9d9", borderRadius: 8, overflow: "hidden" }}>
            <Editor
              height="420px"
              defaultLanguage="html"
              value={html}
              onChange={(value) => setHtml(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                wordWrap: "on",
                formatOnPaste: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                folding: true,
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <span>Chỉnh sửa Section:</span>
          <Text code>{sectionKey}</Text>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={950}
      styles={{ body: { paddingTop: 16 } }}
      footer={
        <Space>
          <Button icon={<UndoOutlined />} onClick={handleReset}>
            Khôi phục
          </Button>
          <Button icon={<EyeOutlined />} onClick={openPreview}>
            Preview
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Modal>
  );
}

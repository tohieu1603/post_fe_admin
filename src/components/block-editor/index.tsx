"use client";

import { useState, useCallback, useRef } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Dropdown,
  Empty,
  Tag,
  Upload,
  message,
  Tooltip,
  Modal,
  Radio,
  Select,
} from "antd";
import type { MenuProps, UploadProps } from "antd";
import {
  PlusOutlined,
  FontSizeOutlined,
  AlignLeftOutlined,
  PictureOutlined,
  UnorderedListOutlined,
  CodeOutlined,
  MessageOutlined,
  MinusOutlined,
  TableOutlined,
  QuestionCircleOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  SnippetsOutlined,
  LayoutOutlined,
} from "@ant-design/icons";
import {
  ContentBlock,
  BlockType,
  createEmptyBlock,
  BLOCK_TYPE_LABELS,
  generateBlockId,
} from "./types";
import BlockItem from "./block-item";
import { mediaApi } from "@/lib/api";

const { Text } = Typography;

interface BlockEditorProps {
  value?: ContentBlock[];
  onChange?: (blocks: ContentBlock[]) => void;
  placeholder?: string;
}

// Block type menu items
const blockTypeMenuItems: MenuProps["items"] = [
  {
    key: "heading",
    label: "Tiêu đề (H2-H6)",
    icon: <FontSizeOutlined />,
  },
  {
    key: "paragraph",
    label: "Đoạn văn",
    icon: <AlignLeftOutlined />,
  },
  {
    key: "image",
    label: "Hình ảnh",
    icon: <PictureOutlined />,
  },
  {
    key: "list",
    label: "Danh sách",
    icon: <UnorderedListOutlined />,
  },
  {
    key: "code",
    label: "Code",
    icon: <CodeOutlined />,
  },
  {
    key: "quote",
    label: "Trích dẫn",
    icon: <MessageOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "table",
    label: "Bảng",
    icon: <TableOutlined />,
  },
  {
    key: "faq",
    label: "FAQ",
    icon: <QuestionCircleOutlined />,
  },
  {
    key: "divider",
    label: "Đường kẻ",
    icon: <MinusOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "media-text",
    label: "Ảnh + Text (song song)",
    icon: <LayoutOutlined />,
  },
];

export default function BlockEditor({
  value = [],
  onChange,
  placeholder = "Bấm nút + để thêm block",
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(value);

  // Update blocks and notify parent
  const updateBlocks = useCallback(
    (newBlocks: ContentBlock[]) => {
      setBlocks(newBlocks);
      onChange?.(newBlocks);
    },
    [onChange]
  );

  // Add block at position
  const addBlock = (type: BlockType, afterIndex?: number) => {
    const newBlock = createEmptyBlock(type);
    const newBlocks = [...blocks];
    if (afterIndex !== undefined) {
      newBlocks.splice(afterIndex + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    updateBlocks(newBlocks);
  };

  // Update single block
  const handleBlockChange = (index: number, updatedBlock: ContentBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    updateBlocks(newBlocks);
  };

  // Delete block
  const handleDeleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    updateBlocks(newBlocks);
  };

  // Move block up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    updateBlocks(newBlocks);
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    updateBlocks(newBlocks);
  };

  // Duplicate block
  const handleDuplicateBlock = (index: number) => {
    const blockToCopy = blocks[index];
    const newBlock = { ...blockToCopy, id: createEmptyBlock(blockToCopy.type).id };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    updateBlocks(newBlocks);
  };

  // Clear all blocks
  const handleClearAll = () => {
    updateBlocks([]);
  };

  // Handle menu click
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    addBlock(key as BlockType);
  };

  // Generate block ID helper
  const genId = () => Math.random().toString(36).substring(2, 10);

  // Convert various JSON formats to ContentBlock[]
  const convertToBlocks = (data: any): ContentBlock[] => {
    const blocks: ContentBlock[] = [];

    // Helper to add block with auto-generated ID if missing
    const addBlock = (block: Partial<ContentBlock> & { type: BlockType }) => {
      blocks.push({ id: genId(), ...block } as ContentBlock);
    };

    // If already array of blocks
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item && typeof item === "object") {
          // Already a valid block
          if (item.type) {
            addBlock({ ...item, id: item.id || genId() });
          }
          // Object with text/content/value - convert to paragraph
          else if (item.text || item.content || item.value || item.body) {
            addBlock({ type: "paragraph", text: item.text || item.content || item.value || item.body });
          }
          // Object with title/heading - convert to heading
          else if (item.title || item.heading) {
            addBlock({
              type: "heading",
              level: item.level || 2,
              text: item.title || item.heading,
              anchor: (item.title || item.heading).toLowerCase().replace(/\s+/g, "-"),
            } as any);
          }
          // FAQ format {question, answer}
          else if (item.question && item.answer) {
            addBlock({ type: "faq", question: item.question, answer: item.answer } as any);
          }
          // List item - collect consecutive items
          else if (item.item || item.name || item.label) {
            addBlock({ type: "paragraph", text: item.item || item.name || item.label });
          }
        }
        // Plain string - paragraph
        else if (typeof item === "string") {
          // Check if looks like heading (starts with #)
          if (item.startsWith("## ")) {
            addBlock({ type: "heading", level: 2, text: item.slice(3), anchor: item.slice(3).toLowerCase().replace(/\s+/g, "-") } as any);
          } else if (item.startsWith("### ")) {
            addBlock({ type: "heading", level: 3, text: item.slice(4), anchor: item.slice(4).toLowerCase().replace(/\s+/g, "-") } as any);
          } else {
            addBlock({ type: "paragraph", text: item });
          }
        }
      });
    }
    // Object with contentBlocks/blocks/content/sections
    else if (typeof data === "object" && data !== null) {
      // Try common array fields
      const arrayFields = ["contentBlocks", "blocks", "content", "sections", "items", "data", "posts", "paragraphs", "elements"];
      for (const field of arrayFields) {
        if (Array.isArray(data[field])) {
          return convertToBlocks(data[field]);
        }
      }

      // Try nested structure { title, body/content }
      if (data.title) {
        addBlock({ type: "heading", level: 2, text: data.title, anchor: data.title.toLowerCase().replace(/\s+/g, "-") } as any);
      }
      if (data.body || data.content || data.text) {
        const content = data.body || data.content || data.text;
        if (typeof content === "string") {
          // Split by newlines for multiple paragraphs
          content.split(/\n\n+/).forEach((p: string) => {
            if (p.trim()) addBlock({ type: "paragraph", text: p.trim() });
          });
        } else if (Array.isArray(content)) {
          return convertToBlocks(content);
        }
      }

      // FAQ array
      if (data.faq || data.faqs) {
        const faqs = data.faq || data.faqs;
        if (Array.isArray(faqs)) {
          faqs.forEach((faq: any) => {
            if (faq.question && faq.answer) {
              addBlock({ type: "faq", question: faq.question, answer: faq.answer } as any);
            }
          });
        }
      }

      // Table { headers, rows }
      if (data.headers && data.rows) {
        addBlock({ type: "table", headers: data.headers, rows: data.rows } as any);
      }

      // List { items }
      if (data.items && Array.isArray(data.items) && data.items.every((i: any) => typeof i === "string")) {
        addBlock({ type: "list", style: data.ordered ? "ordered" : "unordered", items: data.items } as any);
      }
    }

    return blocks;
  };

  // Import JSON file
  const handleImportJson: UploadProps["beforeUpload"] = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const convertedBlocks = convertToBlocks(json);

        if (convertedBlocks.length > 0) {
          updateBlocks(convertedBlocks);
          message.success(`Đã import ${convertedBlocks.length} blocks từ file JSON`);
        } else {
          message.error("Không thể chuyển đổi JSON thành blocks. Kiểm tra lại cấu trúc file.");
        }
      } catch (err) {
        message.error("Lỗi đọc file JSON: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  // Export blocks to JSON
  const handleExportJson = () => {
    if (blocks.length === 0) {
      message.warning("Chưa có block nào để export");
      return;
    }
    const json = JSON.stringify(blocks, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-blocks-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Đã export ${blocks.length} blocks`);
  };

  // Generate anchor from text
  const generateAnchorFromText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Parse HTML string to blocks
  const parseHtmlToBlocks = (html: string): ContentBlock[] => {
    const result: ContentBlock[] = [];

    // Create temp div to parse HTML
    const div = document.createElement("div");
    div.innerHTML = html;

    // Process each element
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          result.push({ id: genId(), type: "paragraph", text } as ContentBlock);
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      // Headings h1-h6
      if (/^h[1-6]$/.test(tagName)) {
        const level = Math.max(2, Math.min(6, parseInt(tagName[1]))) as 2 | 3 | 4 | 5 | 6;
        const text = el.textContent?.trim() || "";
        result.push({
          id: genId(),
          type: "heading",
          level,
          text,
          anchor: generateAnchorFromText(text),
        } as ContentBlock);
        return;
      }

      // Paragraph - check for images inside first
      if (tagName === "p") {
        // Check if contains images
        const imgs = el.querySelectorAll("img");
        if (imgs.length > 0) {
          imgs.forEach((img) => {
            const src = img.getAttribute("src");
            if (src) {
              // Check if image is wrapped in <a>
              const parentA = img.closest("a");
              result.push({
                id: genId(),
                type: "image",
                url: src,
                alt: img.getAttribute("alt") || "",
                caption: "",
                title: img.getAttribute("title") || undefined,
                link: parentA?.getAttribute("href") || undefined,
                width: img.getAttribute("width") ? parseInt(img.getAttribute("width")!) : undefined,
                height: img.getAttribute("height") ? parseInt(img.getAttribute("height")!) : undefined,
                srcset: img.getAttribute("srcset") || undefined,
                sizes: img.getAttribute("sizes") || undefined,
                loading: (img.getAttribute("loading") as "lazy" | "eager") || undefined,
              } as ContentBlock);
            }
          });
          // Also get text content if any (excluding img alt)
          const textContent = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName.toLowerCase() !== "img"))
            .map((n) => n.textContent?.trim())
            .filter(Boolean)
            .join(" ");
          if (textContent) {
            result.push({ id: genId(), type: "paragraph", text: textContent } as ContentBlock);
          }
        } else {
          const text = el.textContent?.trim();
          if (text) {
            result.push({ id: genId(), type: "paragraph", text } as ContentBlock);
          }
        }
        return;
      }

      // Images
      if (tagName === "img") {
        const src = el.getAttribute("src");
        if (src) {
          // Check if wrapped in <a> for backlink
          const parentLink = el.parentElement?.tagName.toLowerCase() === "a" ? el.parentElement : null;

          result.push({
            id: genId(),
            type: "image",
            url: src,
            alt: el.getAttribute("alt") || "",
            caption: "",
            title: el.getAttribute("title") || undefined,
            link: parentLink?.getAttribute("href") || undefined,
            width: el.getAttribute("width") ? parseInt(el.getAttribute("width")!) : undefined,
            height: el.getAttribute("height") ? parseInt(el.getAttribute("height")!) : undefined,
            srcset: el.getAttribute("srcset") || undefined,
            sizes: el.getAttribute("sizes") || undefined,
            loading: (el.getAttribute("loading") as "lazy" | "eager") || undefined,
          } as ContentBlock);
        }
        return;
      }

      // Figure with image (enhanced)
      if (tagName === "figure") {
        const img = el.querySelector("img");
        const figcaption = el.querySelector("figcaption");
        const link = el.querySelector("a");
        if (img) {
          // Check for source credit
          const sourceText = figcaption?.querySelector(".source, .credit")?.textContent?.trim();
          const sourceLink = figcaption?.querySelector("a")?.getAttribute("href");

          result.push({
            id: genId(),
            type: "image",
            url: img.getAttribute("src") || "",
            alt: img.getAttribute("alt") || "",
            caption: figcaption?.textContent?.trim()?.replace(sourceText || "", "").trim() || "",
            title: img.getAttribute("title") || undefined,
            link: link?.getAttribute("href") || undefined,
            width: img.getAttribute("width") ? parseInt(img.getAttribute("width")!) : undefined,
            height: img.getAttribute("height") ? parseInt(img.getAttribute("height")!) : undefined,
            srcset: img.getAttribute("srcset") || undefined,
            sizes: img.getAttribute("sizes") || undefined,
            loading: (img.getAttribute("loading") as "lazy" | "eager") || undefined,
            source: sourceText || undefined,
            sourceUrl: sourceLink || undefined,
          } as ContentBlock);
        }
        return;
      }

      // Lists ul/ol
      if (tagName === "ul" || tagName === "ol") {
        const items: string[] = [];
        el.querySelectorAll("li").forEach((li) => {
          const text = li.textContent?.trim();
          if (text) items.push(text);
        });
        if (items.length > 0) {
          result.push({
            id: genId(),
            type: "list",
            style: tagName === "ol" ? "ordered" : "unordered",
            items,
          } as ContentBlock);
        }
        return;
      }

      // Blockquote
      if (tagName === "blockquote") {
        const text = el.textContent?.trim();
        if (text) {
          result.push({ id: genId(), type: "quote", text } as ContentBlock);
        }
        return;
      }

      // Code block (pre > code)
      if (tagName === "pre") {
        const code = el.querySelector("code");
        const text = (code || el).textContent?.trim() || "";
        const langClass = code?.className.match(/language-(\w+)/);
        result.push({
          id: genId(),
          type: "code",
          language: langClass?.[1] || "text",
          code: text,
        } as ContentBlock);
        return;
      }

      // Inline code as paragraph
      if (tagName === "code" && el.parentElement?.tagName.toLowerCase() !== "pre") {
        const text = el.textContent?.trim();
        if (text) {
          result.push({ id: genId(), type: "paragraph", text: `\`${text}\`` } as ContentBlock);
        }
        return;
      }

      // Table
      if (tagName === "table") {
        const headers: string[] = [];
        const rows: string[][] = [];

        el.querySelectorAll("thead th, thead td").forEach((th) => {
          headers.push(th.textContent?.trim() || "");
        });

        // If no thead, use first row as headers
        if (headers.length === 0) {
          const firstRow = el.querySelector("tr");
          firstRow?.querySelectorAll("th, td").forEach((cell) => {
            headers.push(cell.textContent?.trim() || "");
          });
        }

        el.querySelectorAll("tbody tr, tr").forEach((tr, idx) => {
          // Skip first row if used as headers
          if (idx === 0 && el.querySelector("thead") === null && headers.length > 0) return;

          const row: string[] = [];
          tr.querySelectorAll("td, th").forEach((td) => {
            row.push(td.textContent?.trim() || "");
          });
          if (row.length > 0) rows.push(row);
        });

        if (headers.length > 0 || rows.length > 0) {
          result.push({
            id: genId(),
            type: "table",
            headers: headers.length > 0 ? headers : rows[0]?.map((_, i) => `Col ${i + 1}`) || [],
            rows: headers.length > 0 ? rows : rows.slice(1),
          } as ContentBlock);
        }
        return;
      }

      // HR as divider
      if (tagName === "hr") {
        result.push({ id: genId(), type: "divider" } as ContentBlock);
        return;
      }

      // Div, span, section - process children
      if (["div", "span", "section", "article", "main", "aside", "header", "footer"].includes(tagName)) {
        el.childNodes.forEach(processNode);
        return;
      }

      // Link <a> - check if contains image first
      if (tagName === "a") {
        const img = el.querySelector("img");
        if (img) {
          const src = img.getAttribute("src");
          if (src) {
            result.push({
              id: genId(),
              type: "image",
              url: src,
              alt: img.getAttribute("alt") || "",
              caption: "",
              title: img.getAttribute("title") || undefined,
              link: el.getAttribute("href") || undefined,
              width: img.getAttribute("width") ? parseInt(img.getAttribute("width")!) : undefined,
              height: img.getAttribute("height") ? parseInt(img.getAttribute("height")!) : undefined,
              srcset: img.getAttribute("srcset") || undefined,
              sizes: img.getAttribute("sizes") || undefined,
              loading: (img.getAttribute("loading") as "lazy" | "eager") || undefined,
            } as ContentBlock);
          }
        } else {
          // Link without image - treat as paragraph with text
          const text = el.textContent?.trim();
          if (text && el.parentElement === div) {
            result.push({ id: genId(), type: "paragraph", text } as ContentBlock);
          }
        }
        return;
      }

      // Strong, em, b, i - treat as paragraph if standalone
      if (["strong", "em", "b", "i"].includes(tagName)) {
        const text = el.textContent?.trim();
        if (text && el.parentElement === div) {
          result.push({ id: genId(), type: "paragraph", text } as ContentBlock);
        }
        return;
      }

      // Fallback: process children
      el.childNodes.forEach(processNode);
    };

    div.childNodes.forEach(processNode);

    // Final pass: find any images that might have been missed
    // (images in nested structures, spans, etc.)
    const allImages = div.querySelectorAll("img");
    const existingImageUrls = new Set(
      result.filter((b) => b.type === "image").map((b) => (b as any).url)
    );

    allImages.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !existingImageUrls.has(src)) {
        const parentA = img.closest("a");
        result.push({
          id: genId(),
          type: "image",
          url: src,
          alt: img.getAttribute("alt") || "",
          caption: "",
          title: img.getAttribute("title") || undefined,
          link: parentA?.getAttribute("href") || undefined,
          width: img.getAttribute("width") ? parseInt(img.getAttribute("width")!) : undefined,
          height: img.getAttribute("height") ? parseInt(img.getAttribute("height")!) : undefined,
          srcset: img.getAttribute("srcset") || undefined,
          sizes: img.getAttribute("sizes") || undefined,
          loading: (img.getAttribute("loading") as "lazy" | "eager") || undefined,
        } as ContentBlock);
      }
    });

    return result;
  };

  // Parse plain text to blocks (markdown-like)
  const parsePlainTextToBlocks = (text: string): ContentBlock[] => {
    const result: ContentBlock[] = [];
    const lines = text.split(/\n/);
    let currentList: string[] = [];
    let currentListStyle: "ordered" | "unordered" = "unordered";

    const flushList = () => {
      if (currentList.length > 0) {
        result.push({
          id: genId(),
          type: "list",
          style: currentListStyle,
          items: currentList,
        } as ContentBlock);
        currentList = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushList();
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushList();
        const level = Math.max(2, Math.min(6, headingMatch[1].length)) as 2 | 3 | 4 | 5 | 6;
        const text = headingMatch[2];
        result.push({
          id: genId(),
          type: "heading",
          level,
          text,
          anchor: generateAnchorFromText(text),
        } as ContentBlock);
        continue;
      }

      // Horizontal rule
      if (/^[-*_]{3,}$/.test(line)) {
        flushList();
        result.push({ id: genId(), type: "divider" } as ContentBlock);
        continue;
      }

      // Unordered list
      const ulMatch = line.match(/^[-*+]\s+(.+)$/);
      if (ulMatch) {
        if (currentListStyle !== "unordered" && currentList.length > 0) flushList();
        currentListStyle = "unordered";
        currentList.push(ulMatch[1]);
        continue;
      }

      // Ordered list
      const olMatch = line.match(/^\d+[.)]\s+(.+)$/);
      if (olMatch) {
        if (currentListStyle !== "ordered" && currentList.length > 0) flushList();
        currentListStyle = "ordered";
        currentList.push(olMatch[1]);
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        flushList();
        result.push({
          id: genId(),
          type: "quote",
          text: line.slice(2),
        } as ContentBlock);
        continue;
      }

      // Code block
      if (line.startsWith("```")) {
        flushList();
        const lang = line.slice(3).trim() || "text";
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        result.push({
          id: genId(),
          type: "code",
          language: lang,
          code: codeLines.join("\n"),
        } as ContentBlock);
        continue;
      }

      // Image ![alt](url)
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)(.*)$/);
      if (imgMatch) {
        flushList();
        result.push({
          id: genId(),
          type: "image",
          url: imgMatch[2],
          alt: imgMatch[1],
          caption: imgMatch[3]?.trim() || "",
        } as ContentBlock);
        continue;
      }

      // Regular paragraph
      flushList();
      result.push({
        id: genId(),
        type: "paragraph",
        text: line,
      } as ContentBlock);
    }

    flushList();
    return result;
  };

  // State for paste loading
  const [pasting, setPasting] = useState(false);

  // State for layout selection modal (after paste)
  const [layoutModal, setLayoutModal] = useState<{
    visible: boolean;
    pendingBlocks: ContentBlock[];
    imageTextPairs: { imageIndex: number; textIndex: number }[];
  }>({ visible: false, pendingBlocks: [], imageTextPairs: [] });
  const [selectedLayouts, setSelectedLayouts] = useState<Record<number, "separate" | "media-left" | "media-right">>({});

  // Find adjacent image + text pairs that can be converted to media-text
  const findImageTextPairs = (parsedBlocks: ContentBlock[]): { imageIndex: number; textIndex: number }[] => {
    const pairs: { imageIndex: number; textIndex: number }[] = [];

    for (let i = 0; i < parsedBlocks.length - 1; i++) {
      const current = parsedBlocks[i];
      const next = parsedBlocks[i + 1];

      // Image followed by paragraph/heading
      if (current.type === "image" && (next.type === "paragraph" || next.type === "heading")) {
        pairs.push({ imageIndex: i, textIndex: i + 1 });
        i++; // Skip the next block as it's already paired
      }
      // Paragraph/heading followed by image
      else if ((current.type === "paragraph" || current.type === "heading") && next.type === "image") {
        pairs.push({ imageIndex: i + 1, textIndex: i });
        i++; // Skip the next block as it's already paired
      }
    }

    return pairs;
  };

  // Convert blocks based on selected layouts
  const applyLayoutSelections = () => {
    const { pendingBlocks, imageTextPairs } = layoutModal;
    const result: ContentBlock[] = [];
    const processedIndices = new Set<number>();

    // Process pairs first
    imageTextPairs.forEach((pair, pairIndex) => {
      const layout = selectedLayouts[pairIndex] || "separate";
      const imageBlock = pendingBlocks[pair.imageIndex] as any;
      const textBlock = pendingBlocks[pair.textIndex] as any;

      if (layout === "separate") {
        // Keep separate - will be added in order later
        return;
      }

      // Convert to media-text
      processedIndices.add(pair.imageIndex);
      processedIndices.add(pair.textIndex);

      result.push({
        id: genId(),
        type: "media-text",
        imageUrl: imageBlock.url || "",
        imageAlt: imageBlock.alt || "",
        imageCaption: imageBlock.caption || "",
        imageLink: imageBlock.link || "",
        title: textBlock.type === "heading" ? textBlock.text : "",
        text: textBlock.type === "paragraph" ? textBlock.text : "",
        mediaPosition: layout === "media-left" ? "left" : "right",
        mediaWidth: 50,
        verticalAlign: "center",
      } as ContentBlock);
    });

    // Add remaining blocks in order
    pendingBlocks.forEach((block, index) => {
      if (!processedIndices.has(index)) {
        result.push(block);
      }
    });

    // Sort by original order for non-converted blocks
    // (media-text blocks are inserted where the first block of pair was)

    // Close modal and update blocks
    setLayoutModal({ visible: false, pendingBlocks: [], imageTextPairs: [] });
    setSelectedLayouts({});

    if (blocks.length === 0) {
      updateBlocks(result);
    } else {
      updateBlocks([...blocks, ...result]);
    }

    message.success(`Đã thêm ${result.length} blocks`);
  };

  // Helper: Convert base64/blob URL to File and upload
  const uploadBase64Image = async (dataUrl: string, filename?: string): Promise<string | null> => {
    try {
      // Convert base64 to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Create file from blob
      const ext = blob.type.split("/")[1] || "png";
      const file = new File([blob], filename || `pasted-image-${Date.now()}.${ext}`, { type: blob.type });

      // Upload to server
      const result = await mediaApi.upload(file, "posts");
      return result.url;
    } catch (err) {
      console.error("Failed to upload pasted image:", err);
      return null;
    }
  };

  // Process images in parsed blocks - upload base64/blob images
  const processImageBlocks = async (parsedBlocks: ContentBlock[]): Promise<ContentBlock[]> => {
    const processedBlocks: ContentBlock[] = [];
    let uploadCount = 0;

    for (const block of parsedBlocks) {
      if (block.type === "image") {
        const url = (block as any).url || "";

        // Check if URL is base64 or blob
        if (url.startsWith("data:image/") || url.startsWith("blob:")) {
          const uploadedUrl = await uploadBase64Image(url);
          if (uploadedUrl) {
            processedBlocks.push({
              ...block,
              url: uploadedUrl,
            } as ContentBlock);
            uploadCount++;
          } else {
            // Skip failed uploads but add placeholder
            processedBlocks.push({
              ...block,
              url: "",
              caption: (block as any).caption || "[Upload failed]",
            } as ContentBlock);
          }
        } else {
          // Keep external URLs as-is
          processedBlocks.push(block);
        }
      } else {
        processedBlocks.push(block);
      }
    }

    if (uploadCount > 0) {
      message.info(`Đã upload ${uploadCount} ảnh từ clipboard`);
    }

    return processedBlocks;
  };

  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    setPasting(true);
    try {
      const clipboardItems = await navigator.clipboard.read();
      let htmlContent = "";
      let textContent = "";
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        // Check for direct image paste (e.g., screenshot)
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const ext = type.split("/")[1] || "png";
            const file = new File([blob], `pasted-image-${Date.now()}.${ext}`, { type });
            imageFiles.push(file);
          }
        }

        if (item.types.includes("text/html")) {
          const blob = await item.getType("text/html");
          htmlContent = await blob.text();
        }
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          textContent = await blob.text();
        }
      }

      let parsedBlocks: ContentBlock[] = [];

      // If direct image paste (screenshot), upload it
      if (imageFiles.length > 0) {
        message.loading({ content: `Đang upload ${imageFiles.length} ảnh...`, key: "paste-upload" });
        for (const file of imageFiles) {
          try {
            const result = await mediaApi.upload(file, "posts");
            parsedBlocks.push({
              id: genId(),
              type: "image",
              url: result.url,
              alt: result.altText || "",
              caption: "",
            } as ContentBlock);
          } catch (err) {
            console.error("Failed to upload pasted image:", err);
          }
        }
        message.destroy("paste-upload");
      }

      // Parse HTML content
      if (htmlContent && parsedBlocks.length === 0) {
        const htmlBlocks = parseHtmlToBlocks(htmlContent);

        // Check if any images need uploading (base64/blob)
        const hasBase64Images = htmlBlocks.some(
          (b) => b.type === "image" &&
          ((b as any).url?.startsWith("data:image/") || (b as any).url?.startsWith("blob:"))
        );

        if (hasBase64Images) {
          message.loading({ content: "Đang upload ảnh từ clipboard...", key: "paste-upload" });
          parsedBlocks = await processImageBlocks(htmlBlocks);
          message.destroy("paste-upload");
        } else {
          parsedBlocks = htmlBlocks;
        }
      }

      // Fallback to plain text
      if (parsedBlocks.length === 0 && textContent) {
        parsedBlocks = parsePlainTextToBlocks(textContent);
      }

      if (parsedBlocks.length > 0) {
        // Check for image+text pairs that can be converted to media-text
        const pairs = findImageTextPairs(parsedBlocks);

        if (pairs.length > 0) {
          // Show layout selection modal
          setLayoutModal({
            visible: true,
            pendingBlocks: parsedBlocks,
            imageTextPairs: pairs,
          });
          // Initialize all pairs as "separate" by default
          const initialLayouts: Record<number, "separate" | "media-left" | "media-right"> = {};
          pairs.forEach((_, i) => {
            initialLayouts[i] = "separate";
          });
          setSelectedLayouts(initialLayouts);
        } else {
          // No pairs found, add blocks directly
          if (blocks.length === 0) {
            updateBlocks(parsedBlocks);
          } else {
            updateBlocks([...blocks, ...parsedBlocks]);
          }
          message.success(`Đã paste ${parsedBlocks.length} blocks từ clipboard`);
        }
      } else {
        message.warning("Không tìm thấy nội dung để parse");
      }
    } catch (err) {
      // Fallback: try simple text read
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          const parsedBlocks = parsePlainTextToBlocks(text);
          if (parsedBlocks.length > 0) {
            if (blocks.length === 0) {
              updateBlocks(parsedBlocks);
            } else {
              updateBlocks([...blocks, ...parsedBlocks]);
            }
            message.success(`Đã paste ${parsedBlocks.length} blocks`);
          } else {
            message.warning("Không parse được nội dung");
          }
        }
      } catch {
        message.error("Không thể đọc clipboard. Vui lòng cho phép quyền truy cập.");
      }
    } finally {
      setPasting(false);
    }
  };

  // Count blocks by type
  const blockCounts = blocks.reduce((acc, block) => {
    acc[block.type] = (acc[block.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Toolbar */}
      <Card size="small" style={{ marginBottom: 8 }} styles={{ body: { padding: "8px 12px" } }}>
        <Space wrap>
          <Dropdown
            menu={{ items: blockTypeMenuItems, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm Block
            </Button>
          </Dropdown>

          <Text type="secondary">|</Text>

          {/* Import JSON */}
          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={handleImportJson}
          >
            <Tooltip title="Import từ file JSON">
              <Button icon={<UploadOutlined />} size="small">
                Import JSON
              </Button>
            </Tooltip>
          </Upload>

          {/* Export JSON */}
          <Tooltip title="Export blocks ra file JSON">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={handleExportJson}
              disabled={blocks.length === 0}
            >
              Export JSON
            </Button>
          </Tooltip>

          <Text type="secondary">|</Text>

          {/* Paste from clipboard */}
          <Tooltip title="Paste nội dung từ clipboard (HTML/Markdown/Text/Ảnh) và tự động parse thành blocks. Ảnh sẽ được upload tự động.">
            <Button
              icon={<SnippetsOutlined />}
              size="small"
              onClick={handlePasteFromClipboard}
              loading={pasting}
              disabled={pasting}
            >
              {pasting ? "Đang xử lý..." : "Paste to Blocks"}
            </Button>
          </Tooltip>

          {blocks.length > 0 && (
            <>
              <Text type="secondary">|</Text>
              <Text type="secondary">{blocks.length} blocks</Text>
              {Object.entries(blockCounts).map(([type, count]) => (
                <Tag key={type} color="blue">
                  {BLOCK_TYPE_LABELS[type as BlockType]}: {count}
                </Tag>
              ))}
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleClearAll}
              >
                Xóa tất cả
              </Button>
            </>
          )}
        </Space>
      </Card>

      {/* Block list */}
      <div style={{ minHeight: 200 }}>
        {blocks.length === 0 ? (
          <Card>
            <Empty
              description={placeholder}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Dropdown
                menu={{ items: blockTypeMenuItems, onClick: handleMenuClick }}
                trigger={["click"]}
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  Thêm Block đầu tiên
                </Button>
              </Dropdown>
            </Empty>
          </Card>
        ) : (
          blocks.map((block, index) => (
            <div key={block.id}>
              <BlockItem
                block={block}
                index={index}
                onChange={(updatedBlock) => handleBlockChange(index, updatedBlock)}
                onDelete={() => handleDeleteBlock(index)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
              />
              {/* Add block between */}
              <div style={{ textAlign: "center", margin: "4px 0" }}>
                <Dropdown
                  menu={{
                    items: blockTypeMenuItems,
                    onClick: ({ key }) => addBlock(key as BlockType, index),
                  }}
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    style={{ color: "#999", fontSize: 11 }}
                  >
                    Thêm block
                  </Button>
                </Dropdown>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Layout Selection Modal */}
      <Modal
        title="Chọn layout cho Ảnh + Text"
        open={layoutModal.visible}
        onOk={applyLayoutSelections}
        onCancel={() => {
          // Cancel = add all as separate blocks
          const { pendingBlocks } = layoutModal;
          if (blocks.length === 0) {
            updateBlocks(pendingBlocks);
          } else {
            updateBlocks([...blocks, ...pendingBlocks]);
          }
          setLayoutModal({ visible: false, pendingBlocks: [], imageTextPairs: [] });
          setSelectedLayouts({});
          message.info("Đã thêm blocks riêng lẻ");
        }}
        okText="Áp dụng"
        cancelText="Giữ riêng lẻ"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">
            Phát hiện {layoutModal.imageTextPairs.length} cặp ảnh + text liền kề. Chọn layout cho từng cặp:
          </Typography.Text>
        </div>

        {layoutModal.imageTextPairs.map((pair, pairIndex) => {
          const imageBlock = layoutModal.pendingBlocks[pair.imageIndex] as any;
          const textBlock = layoutModal.pendingBlocks[pair.textIndex] as any;

          return (
            <Card
              key={pairIndex}
              size="small"
              style={{ marginBottom: 12 }}
              styles={{ body: { padding: 12 } }}
            >
              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                {/* Image preview */}
                <div style={{ width: 80, flexShrink: 0 }}>
                  {imageBlock?.url && (
                    <img
                      src={imageBlock.url}
                      alt={imageBlock.alt || ""}
                      style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 4 }}
                    />
                  )}
                </div>
                {/* Text preview */}
                <div style={{ flex: 1, fontSize: 13, color: "#666" }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    {textBlock?.type === "heading" ? `H${textBlock.level}: ` : ""}
                    {(textBlock?.text || "").substring(0, 100)}
                    {(textBlock?.text || "").length > 100 ? "..." : ""}
                  </div>
                </div>
              </div>

              <Radio.Group
                value={selectedLayouts[pairIndex] || "separate"}
                onChange={(e) => setSelectedLayouts({ ...selectedLayouts, [pairIndex]: e.target.value })}
                optionType="button"
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="separate">
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    ↓ Trên dưới
                  </span>
                </Radio.Button>
                <Radio.Button value="media-left">
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <LayoutOutlined /> Ảnh trái | Text phải
                  </span>
                </Radio.Button>
                <Radio.Button value="media-right">
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Text trái | Ảnh phải <LayoutOutlined style={{ transform: "scaleX(-1)" }} />
                  </span>
                </Radio.Button>
              </Radio.Group>
            </Card>
          );
        })}
      </Modal>
    </div>
  );
}

// Export types
export type { ContentBlock, BlockType } from "./types";
export { createEmptyBlock, generateBlockId, generateAnchor, BLOCK_TYPE_LABELS } from "./types";

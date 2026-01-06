"use client";

// Block types matching backend
export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "list"
  | "code"
  | "quote"
  | "divider"
  | "table"
  | "faq"
  | "media-text";

// Base block interface
export interface BaseBlock {
  id: string;
  type: BlockType;
}

// Heading block
export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 2 | 3 | 4 | 5 | 6;
  text: string;
  anchor: string;
}

// Paragraph block
export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  text: string;
}

// Image block - Enhanced with SEO and responsive attributes
export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
  // SEO & Link
  link?: string;          // Backlink - wrap image in <a>
  title?: string;         // Title attribute for tooltip
  // Responsive
  width?: number;
  height?: number;
  srcset?: string;        // srcset for responsive images (e.g., "img-320.jpg 320w, img-640.jpg 640w")
  sizes?: string;         // sizes attribute (e.g., "(max-width: 600px) 100vw, 50vw")
  // Performance
  loading?: "lazy" | "eager";
  // Source info
  source?: string;        // Credit/source của ảnh
  sourceUrl?: string;     // Link tới nguồn gốc
}

// List block
export interface ListBlock extends BaseBlock {
  type: "list";
  style: "ordered" | "unordered";
  items: string[];
}

// Code block
export interface CodeBlock extends BaseBlock {
  type: "code";
  language: string;
  code: string;
}

// Quote block
export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
}

// Divider block
export interface DividerBlock extends BaseBlock {
  type: "divider";
}

// Table block
export interface TableBlock extends BaseBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

// FAQ block
export interface FaqBlock extends BaseBlock {
  type: "faq";
  question: string;
  answer: string;
}

// Media-Text block (image + text side by side)
export interface MediaTextBlock extends BaseBlock {
  type: "media-text";
  // Image settings
  imageUrl: string;
  imageAlt: string;
  imageCaption?: string;
  imageLink?: string;
  // Text content
  title?: string;
  text: string;
  // Layout settings
  mediaPosition: "left" | "right";
  mediaWidth: number; // Percentage: 30, 40, 50
  verticalAlign: "top" | "center" | "bottom";
  // Style options
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

// Union type for all blocks
export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | ListBlock
  | CodeBlock
  | QuoteBlock
  | DividerBlock
  | TableBlock
  | FaqBlock
  | MediaTextBlock;

// Generate unique ID
export function generateBlockId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Generate anchor from text
export function generateAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Create empty block by type
export function createEmptyBlock(type: BlockType): ContentBlock {
  const id = generateBlockId();

  switch (type) {
    case "heading":
      return { id, type: "heading", level: 2, text: "", anchor: "" };
    case "paragraph":
      return { id, type: "paragraph", text: "" };
    case "image":
      return { id, type: "image", url: "", alt: "" };
    case "list":
      return { id, type: "list", style: "unordered", items: [""] };
    case "code":
      return { id, type: "code", language: "javascript", code: "" };
    case "quote":
      return { id, type: "quote", text: "" };
    case "divider":
      return { id, type: "divider" };
    case "table":
      return { id, type: "table", headers: ["Cột 1", "Cột 2"], rows: [["", ""]] };
    case "faq":
      return { id, type: "faq", question: "", answer: "" };
    case "media-text":
      return {
        id,
        type: "media-text",
        imageUrl: "",
        imageAlt: "",
        text: "",
        mediaPosition: "left",
        mediaWidth: 50,
        verticalAlign: "center",
      };
    default:
      return { id, type: "paragraph", text: "" };
  }
}

// Block type labels
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  heading: "Tiêu đề",
  paragraph: "Đoạn văn",
  image: "Hình ảnh",
  list: "Danh sách",
  code: "Code",
  quote: "Trích dẫn",
  divider: "Đường kẻ",
  table: "Bảng",
  faq: "FAQ",
  "media-text": "Ảnh + Text",
};

// Block type icons (Ant Design icon names)
export const BLOCK_TYPE_ICONS: Record<BlockType, string> = {
  heading: "FontSizeOutlined",
  paragraph: "AlignLeftOutlined",
  image: "PictureOutlined",
  list: "UnorderedListOutlined",
  code: "CodeOutlined",
  quote: "MessageOutlined",
  divider: "MinusOutlined",
  table: "TableOutlined",
  faq: "QuestionCircleOutlined",
  "media-text": "LayoutOutlined",
};

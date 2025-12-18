"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { mediaApi } from "@/lib/api";
import TurndownService from "turndown";

// Dynamically import to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 450,
  placeholder = "Nhập nội dung Markdown...",
}: MarkdownEditorProps) {
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Create Turndown service for HTML to Markdown conversion
  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });

    // Custom rule for images - keep src and alt
    service.addRule("images", {
      filter: "img",
      replacement: (_content, node) => {
        const img = node as HTMLImageElement;
        const alt = img.alt || "";
        const src = img.src || "";
        const title = img.title ? ` "${img.title}"` : "";
        return src ? `![${alt}](${src}${title})` : "";
      },
    });

    // Keep tables
    service.addRule("tables", {
      filter: "table",
      replacement: (_content, node) => {
        const table = node as HTMLTableElement;
        const rows = Array.from(table.querySelectorAll("tr"));
        if (rows.length === 0) return "";

        let markdown = "\n";
        rows.forEach((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll("th, td"));
          const cellContents = cells.map((cell) => cell.textContent?.trim() || "");
          markdown += "| " + cellContents.join(" | ") + " |\n";

          // Add header separator after first row
          if (rowIndex === 0) {
            markdown += "| " + cells.map(() => "---").join(" | ") + " |\n";
          }
        });
        return markdown + "\n";
      },
    });

    return service;
  }, []);

  // Handle paste event for images and HTML content
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for HTML content first (copy from web page)
    const htmlContent = clipboardData.getData("text/html");

    // If HTML content exists and contains rich content (not just plain text wrapped in HTML)
    if (htmlContent && htmlContent.includes("<")) {
      // Check if it's rich content (has tags like h1, h2, p, img, table, ul, ol)
      const hasRichContent = /<(h[1-6]|p|img|table|ul|ol|blockquote|pre|code|strong|em|a)\b/i.test(htmlContent);

      if (hasRichContent) {
        e.preventDefault();

        try {
          // Convert HTML to Markdown
          const markdown = turndownService.turndown(htmlContent);

          // Insert at cursor position
          const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.substring(0, start) + markdown + value.substring(end);
            onChange(newValue);

            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
              textarea.focus();
            }, 0);
          } else {
            onChange(value + "\n" + markdown);
          }

          message.success("Đã chuyển đổi HTML sang Markdown!");
          return;
        } catch (err) {
          console.error("HTML to Markdown conversion failed:", err);
          // Fall through to default paste behavior
        }
      }
    }

    // Check for image paste
    const items = clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        setUploading(true);
        try {
          // Upload image to server
          const media = await mediaApi.upload(file, "posts");

          // Insert markdown image at cursor position
          const imageMarkdown = `![${media.altText || file.name}](${media.url})`;

          // Get cursor position from textarea
          const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
            onChange(newValue);

            // Set cursor after inserted image
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
              textarea.focus();
            }, 0);
          } else {
            // Fallback: append to end
            onChange(value + "\n" + imageMarkdown);
          }

          message.success("Đã upload ảnh thành công!");
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Không thể upload ảnh");
        } finally {
          setUploading(false);
        }
        break;
      }
    }
  }, [value, onChange, turndownService]);

  // Handle drop event for images
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    e.preventDefault();
    setUploading(true);

    try {
      const media = await mediaApi.upload(file, "posts");
      const imageMarkdown = `\n![${media.altText || file.name}](${media.url})\n`;
      onChange(value + imageMarkdown);
      message.success("Đã upload ảnh thành công!");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  return (
    <div data-color-mode="light" style={{ position: "relative" }}>
      {uploading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          borderRadius: 4,
        }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} tip="Đang upload ảnh..." />
        </div>
      )}
      <div onPaste={handlePaste} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          height={height}
          preview="live"
          textareaProps={{
            placeholder,
          }}
          previewOptions={{
            style: {
              backgroundColor: "#fff",
            },
          }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: 12, color: '#888' }}>
          📋 Copy từ web → Paste: Tự động chuyển thành Markdown (H1, H2, ảnh, bảng, list...) | 📷 Paste/kéo thả ảnh: Tự upload
        </span>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Typography, Image } from "antd";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const { Title, Paragraph, Text } = Typography;

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

export interface ContentBlock {
  id: string;
  type: BlockType;
  // Heading
  level?: 2 | 3 | 4 | 5 | 6;
  text?: string;
  anchor?: string;
  // Image - Enhanced
  url?: string;
  alt?: string;
  caption?: string;
  link?: string;          // Backlink - wrap image in <a>
  title?: string;         // Title attribute for tooltip
  width?: number;
  height?: number;
  srcset?: string;        // srcset for responsive images
  sizes?: string;         // sizes attribute
  loading?: "lazy" | "eager";
  source?: string;        // Credit/source của ảnh
  sourceUrl?: string;     // Link tới nguồn gốc
  // List
  style?: "ordered" | "unordered";
  items?: string[];
  // Code
  language?: string;
  code?: string;
  // Table
  headers?: string[];
  rows?: string[][];
  // FAQ
  question?: string;
  answer?: string;
  // Media-Text (image + text side by side)
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imageLink?: string;
  mediaPosition?: "left" | "right";
  mediaWidth?: number; // Percentage: 30, 40, 50
  verticalAlign?: "top" | "center" | "bottom";
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

interface BlockRendererProps {
  blocks: ContentBlock[];
}

// Individual block renderer
function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${block.level || 2}` as keyof React.JSX.IntrinsicElements;
      return (
        <HeadingTag
          key={block.id || index}
          id={block.anchor}
          style={{
            marginTop: block.level === 2 ? 32 : 24,
            marginBottom: 16,
          }}
        >
          {block.text}
        </HeadingTag>
      );

    case "paragraph":
      return (
        <Paragraph key={block.id || index} style={{ marginBottom: 16, lineHeight: 1.8 }}>
          {block.text}
        </Paragraph>
      );

    case "image":
      // Build image element with enhanced attributes
      const imgElement = (
        <Image
          src={block.url}
          alt={block.alt || ""}
          title={block.title}
          width={block.width}
          height={block.height}
          style={{ maxWidth: "100%", borderRadius: 8 }}
          // Note: srcset/sizes/loading handled via wrapper for native img
        />
      );

      // Wrap in link if backlink provided
      const imageWithLink = block.link ? (
        <a
          href={block.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block" }}
        >
          {imgElement}
        </a>
      ) : (
        imgElement
      );

      return (
        <figure key={block.id || index} style={{ margin: "24px 0", textAlign: "center" }}>
          {imageWithLink}
          {(block.caption || block.source) && (
            <figcaption style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
              {block.caption}
              {block.source && (
                <span style={{ marginLeft: block.caption ? 8 : 0, fontStyle: "italic" }}>
                  {block.sourceUrl ? (
                    <a
                      href={block.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1890ff" }}
                    >
                      Nguồn: {block.source}
                    </a>
                  ) : (
                    `Nguồn: ${block.source}`
                  )}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );

    case "list":
      const ListTag = block.style === "ordered" ? "ol" : "ul";
      return (
        <ListTag
          key={block.id || index}
          style={{ marginBottom: 16, paddingLeft: 24, lineHeight: 1.8 }}
        >
          {block.items?.map((item, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ListTag>
      );

    case "code":
      return (
        <div key={block.id || index} style={{ margin: "16px 0" }}>
          <SyntaxHighlighter
            language={block.language || "text"}
            style={atomOneDark}
            customStyle={{ borderRadius: 8, padding: 16 }}
          >
            {block.code || ""}
          </SyntaxHighlighter>
        </div>
      );

    case "quote":
      return (
        <blockquote
          key={block.id || index}
          style={{
            margin: "24px 0",
            padding: "16px 24px",
            borderLeft: "4px solid #1890ff",
            background: "#f9f9f9",
            fontStyle: "italic",
            color: "#555",
          }}
        >
          {block.text}
        </blockquote>
      );

    case "divider":
      return (
        <hr
          key={block.id || index}
          style={{ margin: "32px 0", border: "none", borderTop: "1px solid #e8e8e8" }}
        />
      );

    case "table":
      return (
        <div key={block.id || index} style={{ margin: "16px 0", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e8e8e8",
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {block.headers?.map((header, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "2px solid #e8e8e8",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows?.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #e8e8e8",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "faq":
      return (
        <div
          key={block.id || index}
          style={{
            margin: "16px 0",
            padding: 16,
            background: "#f6f8fa",
            borderRadius: 8,
            border: "1px solid #e8e8e8",
          }}
        >
          <Text strong style={{ display: "block", marginBottom: 8, color: "#1890ff" }}>
            Q: {block.question}
          </Text>
          <Text style={{ color: "#555" }}>A: {block.answer}</Text>
        </div>
      );

    case "media-text":
      const mediaWidth = block.mediaWidth || 50;
      const textWidth = 100 - mediaWidth;
      const isMediaLeft = block.mediaPosition !== "right";
      const verticalAlign = block.verticalAlign || "center";

      // Map vertical align to CSS
      const alignItemsMap = {
        top: "flex-start",
        center: "center",
        bottom: "flex-end",
      };

      // Image element
      const mediaImage = (
        <img
          src={block.imageUrl}
          alt={block.imageAlt || ""}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: block.borderRadius ?? 8,
            objectFit: "cover",
          }}
        />
      );

      // Wrap in link if provided
      const mediaContent = block.imageLink ? (
        <a href={block.imageLink} target="_blank" rel="noopener noreferrer">
          {mediaImage}
        </a>
      ) : (
        mediaImage
      );

      // Media section
      const mediaSection = (
        <div
          style={{
            flex: `0 0 ${mediaWidth}%`,
            maxWidth: `${mediaWidth}%`,
            padding: block.padding ?? 16,
          }}
        >
          {mediaContent}
          {block.imageCaption && (
            <p style={{ marginTop: 8, fontSize: 13, color: "#666", textAlign: "center" }}>
              {block.imageCaption}
            </p>
          )}
        </div>
      );

      // Text section
      const textSection = (
        <div
          style={{
            flex: `0 0 ${textWidth}%`,
            maxWidth: `${textWidth}%`,
            padding: block.padding ?? 16,
          }}
        >
          {block.title && (
            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 20, fontWeight: 600 }}>
              {block.title}
            </h3>
          )}
          <div style={{ lineHeight: 1.8, color: "#333" }}>
            {block.text?.split("\n").map((line, i) => (
              <p key={i} style={{ margin: "0 0 8px 0" }}>{line}</p>
            ))}
          </div>
        </div>
      );

      return (
        <div
          key={block.id || index}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: alignItemsMap[verticalAlign],
            margin: "24px 0",
            backgroundColor: block.backgroundColor || "#f9f9f9",
            borderRadius: block.borderRadius ?? 12,
            border: "1px solid #e8e8e8",
            overflow: "hidden",
          }}
        >
          {isMediaLeft ? (
            <>
              {mediaSection}
              {textSection}
            </>
          ) : (
            <>
              {textSection}
              {mediaSection}
            </>
          )}
        </div>
      );

    default:
      return null;
  }
}

/**
 * BlockRenderer - Renders content blocks (Notion-style)
 */
export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <Paragraph type="secondary">Không có nội dung</Paragraph>;
  }

  return <div className="block-content">{blocks.map((block, index) => renderBlock(block, index))}</div>;
}

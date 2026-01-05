"use client";

import { useState, useEffect, useMemo } from "react";
import { Typography, Anchor } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface TocItem {
  id: string;
  text: string;
  level: number;
  anchor?: string;
  children?: TocItem[];
}

interface TableOfContentsProps {
  content?: string; // Markdown content (optional if toc provided)
  toc?: TocItem[]; // Pre-parsed TOC from API
  title?: string;
  sticky?: boolean;
  maxLevel?: number; // Max heading level to include (2-6)
  containerSelector?: string; // Selector for scrollable container
  emptyMessage?: string; // Message to show when no headings found
}

/**
 * Extract headings from markdown content
 * Supports # H1, ## H2, ### H3, etc.
 */
function extractHeadings(markdown: string, maxLevel: number = 6): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    if (level > maxLevel) continue;

    const text = match[2].trim();
    // Create anchor from text (slugify)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, "") // Keep letters, numbers, spaces, Vietnamese chars
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Build nested tree structure from flat headings
 */
function buildTree(headings: TocItem[]): TocItem[] {
  const result: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const heading of headings) {
    const item = { ...heading, children: [] as TocItem[] };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(item);
    } else {
      stack[stack.length - 1].children!.push(item);
    }

    stack.push(item);
  }

  return result;
}

/**
 * Render TOC items recursively for Ant Design Anchor
 */
function renderAnchorItems(items: TocItem[]): { key: string; href: string; title: string; children?: any[] }[] {
  return items.map((item) => ({
    key: item.id,
    href: `#${item.id}`,
    title: item.text,
    children: item.children && item.children.length > 0 ? renderAnchorItems(item.children) : undefined,
  }));
}

export default function TableOfContents({
  content,
  toc: tocFromApi,
  title = "Mục lục",
  sticky = true,
  maxLevel = 3,
  containerSelector,
  emptyMessage,
}: TableOfContentsProps) {
  const [, setActiveId] = useState<string>("");

  // Use API toc or extract from content
  const flatHeadings = useMemo(() => {
    if (tocFromApi && tocFromApi.length > 0) {
      return tocFromApi.map(item => ({
        id: item.anchor || item.id,
        text: item.text,
        level: item.level,
      }));
    }
    return content ? extractHeadings(content, maxLevel) : [];
  }, [tocFromApi, content, maxLevel]);

  // Build TOC tree
  const tocTree = useMemo(() => buildTree(flatHeadings), [flatHeadings]);

  // Track active heading on scroll
  useEffect(() => {
    if (flatHeadings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -80% 0px",
        threshold: 0,
      }
    );

    // Observe all heading elements
    flatHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [flatHeadings]);

  if (tocTree.length === 0) {
    if (emptyMessage) {
      return (
        <div style={{ color: "#999", fontStyle: "italic", fontSize: 13 }}>
          {emptyMessage}
        </div>
      );
    }
    return null;
  }

  const anchorItems = renderAnchorItems(tocTree);

  return (
    <div
      className="toc-container"
      style={{
        position: sticky ? "sticky" : "static",
        top: sticky ? 20 : undefined,
        background: "#fafafa",
        borderRadius: 8,
        padding: 16,
        border: "1px solid #f0f0f0",
      }}
    >
      <Title level={5} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <UnorderedListOutlined />
        {title}
      </Title>
      <Anchor
        items={anchorItems}
        affix={false}
        targetOffset={80}
        getContainer={containerSelector ? () => (document.querySelector(containerSelector) as HTMLElement) || document.body : undefined}
        onClick={(e, link) => {
          e.preventDefault();
          const element = document.getElementById(link.href.replace("#", ""));
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      />
      <style jsx global>{`
        .toc-container .ant-anchor-link {
          padding: 4px 0 4px 12px;
        }
        .toc-container .ant-anchor-link-title {
          font-size: 13px;
          color: #595959;
          transition: color 0.2s;
        }
        .toc-container .ant-anchor-link-title:hover {
          color: #1890ff;
        }
        .toc-container .ant-anchor-link-active > .ant-anchor-link-title {
          color: #1890ff;
          font-weight: 500;
        }
        .toc-container .ant-anchor-ink {
          display: none;
        }
      `}</style>
    </div>
  );
}

/**
 * Utility: Add IDs to headings in HTML content
 * Used when rendering markdown to HTML
 */
export function addHeadingIds(html: string): string {
  const headingRegex = /<h([1-6])([^>]*)>([^<]+)<\/h\1>/gi;
  return html.replace(headingRegex, (match, level, attrs, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if id already exists in attrs
    if (attrs.includes("id=")) {
      return match;
    }
    return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
  });
}

/**
 * Extract TOC from HTML content (for pre-rendered content)
 */
export function extractTocFromHtml(html: string, maxLevel: number = 3): TocItem[] {
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h\1>/gi;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    if (level > maxLevel) continue;

    headings.push({
      id: match[2],
      text: match[3].trim(),
      level,
    });
  }

  return headings;
}

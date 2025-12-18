"use client";

import { Collapse, Typography, Space, Button, Input, message } from "antd";
import { QuestionCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  editable?: boolean;
  onFaqsChange?: (faqs: FaqItem[]) => void;
  title?: string;
}

/**
 * FAQ Section Component
 * - Display mode: Collapse/Accordion with Q&A
 * - Edit mode: Add, edit, delete FAQ items (uses controlled inputs to avoid nested Form conflicts)
 */
export default function FaqSection({
  faqs,
  editable = false,
  onFaqsChange,
  title = "Câu hỏi thường gặp (FAQ)",
}: FaqSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  if (!faqs || faqs.length === 0) {
    if (editable) {
      return (
        <div style={{ padding: 16, background: "#fafafa", borderRadius: 8, textAlign: "center" }}>
          <Paragraph type="secondary">Chưa có FAQ nào</Paragraph>
          <Button
            type="dashed"
            htmlType="button"
            icon={<PlusOutlined />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFaqsChange?.([{ question: "", answer: "" }]);
              setEditingIndex(0);
            }}
          >
            Thêm FAQ đầu tiên
          </Button>
        </div>
      );
    }
    return null;
  }

  // Start editing a FAQ item
  const startEditing = (index: number) => {
    setEditQuestion(faqs[index].question);
    setEditAnswer(faqs[index].answer);
    setEditingIndex(index);
  };

  // Save edited FAQ item
  const saveEdit = () => {
    if (editingIndex === null) return;
    if (!editQuestion.trim() || !editAnswer.trim()) {
      message.error("Vui lòng nhập đầy đủ câu hỏi và trả lời");
      return;
    }
    const newFaqs = [...faqs];
    newFaqs[editingIndex] = { question: editQuestion.trim(), answer: editAnswer.trim() };
    onFaqsChange?.(newFaqs);
    setEditingIndex(null);
    setEditQuestion("");
    setEditAnswer("");
    message.success("Đã cập nhật FAQ");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  // Build collapse items for display mode
  const collapseItems = faqs.map((faq, index) => ({
    key: index.toString(),
    label: (
      <Space>
        <QuestionCircleOutlined style={{ color: "#1890ff" }} />
        <span style={{ fontWeight: 500 }}>{faq.question || "(Chưa có câu hỏi)"}</span>
      </Space>
    ),
    children: (
      <div>
        {editable && editingIndex === index ? (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Câu hỏi <span style={{ color: "red" }}>*</span></label>
              <Input
                placeholder="Nhập câu hỏi"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Trả lời <span style={{ color: "red" }}>*</span></label>
              <TextArea
                rows={3}
                placeholder="Nhập câu trả lời"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
              />
            </div>
            <Space>
              <Button
                type="primary"
                size="small"
                htmlType="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  saveEdit();
                }}
              >
                Lưu
              </Button>
              <Button size="small" htmlType="button" onClick={cancelEdit}>
                Hủy
              </Button>
            </Space>
          </div>
        ) : (
          <div>
            <Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>{faq.answer}</Paragraph>
            {editable && (
              <Space style={{ marginTop: 12 }}>
                <Button
                  size="small"
                  htmlType="button"
                  icon={<EditOutlined />}
                  onClick={() => startEditing(index)}
                >
                  Sửa
                </Button>
                <Button
                  size="small"
                  htmlType="button"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const newFaqs = faqs.filter((_, i) => i !== index);
                    onFaqsChange?.(newFaqs);
                    message.success("Đã xóa FAQ");
                  }}
                >
                  Xóa
                </Button>
              </Space>
            )}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div
      className="faq-section"
      itemScope
      itemType="https://schema.org/FAQPage"
      style={{ background: "#fafafa", padding: 20, borderRadius: 8 }}
    >
      <Title level={4} style={{ marginBottom: 16 }}>
        <QuestionCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} />
        {title}
      </Title>
      <Collapse
        accordion
        items={collapseItems}
        bordered={false}
        style={{ background: "transparent" }}
      />
      {editable && (
        <Button
          type="dashed"
          htmlType="button"
          icon={<PlusOutlined />}
          block
          style={{ marginTop: 16 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newFaqs = [...faqs, { question: "", answer: "" }];
            onFaqsChange?.(newFaqs);
            setEditingIndex(newFaqs.length - 1);
            setEditQuestion("");
            setEditAnswer("");
          }}
        >
          Thêm FAQ mới
        </Button>
      )}
      {/* Schema.org FAQ markup for SEO */}
      {faqs.map((faq, index) => (
        <div
          key={index}
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
          style={{ display: "none" }}
        >
          <span itemProp="name">{faq.question}</span>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <span itemProp="text">{faq.answer}</span>
          </div>
        </div>
      ))}
      <style jsx global>{`
        .faq-section .ant-collapse-header {
          padding: 12px 16px !important;
          background: white;
          border-radius: 8px !important;
          margin-bottom: 8px;
        }
        .faq-section .ant-collapse-content {
          border-radius: 0 0 8px 8px;
        }
        .faq-section .ant-collapse-item {
          border: none !important;
        }
      `}</style>
    </div>
  );
}

/**
 * Convert FAQ array to Markdown format
 */
export function faqsToMarkdown(faqs: FaqItem[]): string {
  if (!faqs || faqs.length === 0) return "";

  return faqs
    .map((faq) => `**Q: ${faq.question}**\n\n${faq.answer}`)
    .join("\n\n---\n\n");
}

/**
 * Parse FAQ from Markdown format
 * Expects format: **Q: Question** followed by answer text
 */
export function parseFaqsFromMarkdown(markdown: string): FaqItem[] {
  const faqRegex = /\*\*Q:\s*(.+?)\*\*\s*\n+([\s\S]+?)(?=\n+\*\*Q:|$)/g;
  const faqs: FaqItem[] = [];
  let match;

  while ((match = faqRegex.exec(markdown)) !== null) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim().replace(/---\s*$/, "").trim(),
    });
  }

  return faqs;
}

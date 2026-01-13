"use client";

import { Card, Typography, Tag, Space, Button, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { DictionaryTerm } from "@/lib/api";

const { Title, Text, Paragraph } = Typography;

interface Props {
  term: DictionaryTerm;
}

// Get first letter for avatar
const getFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase();
};

export default function DictionaryDetailClient({ term }: Props) {
  const router = useRouter();

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/admin/dictionary")}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      {/* Main Card */}
      <Card
        style={{
          borderRadius: 16,
          background: "linear-gradient(135deg, #fdf8f3 0%, #fef9f5 100%)",
          border: "1px solid #f0e6dc",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          {/* Avatar with first letter */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: "linear-gradient(135deg, #8b1538 0%, #a91d3a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getFirstLetter(term.term)}
          </div>

          {/* Term info */}
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
              {term.term}
            </Title>
            {term.synonym && (
              <Text type="secondary" style={{ fontSize: 14, fontStyle: "italic" }}>
                Đồng nghĩa: {term.synonym}
              </Text>
            )}
          </div>
        </div>

        <Divider style={{ margin: "16px 0", borderColor: "#e8ddd4" }} />

        {/* Definition */}
        <div style={{ marginBottom: 24 }}>
          <Text
            strong
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#666",
            }}
          >
            Định nghĩa
          </Text>
          <Paragraph
            style={{
              fontSize: 18,
              color: "#333",
              marginTop: 8,
              marginBottom: 0,
              lineHeight: 1.6,
            }}
          >
            {term.definition}
          </Paragraph>
        </div>

        {/* Description */}
        {term.description && (
          <div
            style={{
              background: "#faf5f0",
              padding: 16,
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <Text
              strong
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#666",
              }}
            >
              Giải thích chi tiết
            </Text>
            <div
              style={{ marginTop: 8, color: "#444", lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: term.description }}
            />
          </div>
        )}

        {/* Examples */}
        {term.examples && term.examples.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Text
              strong
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#666",
              }}
            >
              Ví dụ minh họa
            </Text>
            <div
              style={{
                marginTop: 8,
                borderLeft: "3px solid #a91d3a",
                paddingLeft: 16,
              }}
            >
              {term.examples.map((example, index) => (
                <Paragraph
                  key={index}
                  style={{
                    fontStyle: "italic",
                    color: "#555",
                    marginBottom: index === term.examples!.length - 1 ? 0 : 8,
                  }}
                >
                  "{example}"
                </Paragraph>
              ))}
            </div>
          </div>
        )}

        {/* Related terms */}
        {term.relatedTerms && term.relatedTerms.length > 0 && (
          <div>
            <Text
              strong
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#666",
              }}
            >
              Thuật ngữ liên quan
            </Text>
            <div style={{ marginTop: 12 }}>
              <Space wrap>
                {term.relatedTerms.map((relatedTerm) => (
                  <Tag
                    key={relatedTerm}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontSize: 14,
                      background: "#fff",
                      border: "1px solid #d9d9d9",
                      cursor: "pointer",
                    }}
                  >
                    {relatedTerm}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

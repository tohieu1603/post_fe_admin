"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  List,
  Collapse,
  Alert,
  Badge,
  Tooltip,
  Spin,
  Divider,
  message,
  Empty,
} from "antd";
import {
  BulbOutlined,
  ThunderboltOutlined,
  PlusCircleOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  CopyOutlined,
  CheckOutlined,
  WarningOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import {
  aiSeoApi,
  ContentOptimizationResult,
  ContentOptimizationSuggestion,
  HeadingSuggestion,
  KeywordSuggestion,
  InternalLinkOptSuggestion,
  FaqSuggestion,
} from "@/lib/api";

const { Text, Paragraph } = Typography;

interface ContentOptimizerProps {
  title: string;
  content: string;
  focusKeyword?: string;
  postId?: string;
  onApplyHeading?: (heading: HeadingSuggestion) => void;
  onApplyFaq?: (faq: FaqSuggestion) => void;
  onApplyLink?: (link: InternalLinkOptSuggestion) => void;
}

export default function ContentOptimizer({
  title,
  content,
  focusKeyword,
  postId,
  onApplyHeading,
  onApplyFaq,
  onApplyLink,
}: ContentOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentOptimizationResult | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!title || !content) {
      message.warning("Cần có tiêu đề và nội dung để phân tích");
      return;
    }

    setLoading(true);
    try {
      const response = await aiSeoApi.optimizeContent({
        title,
        content,
        focusKeyword,
        excludePostId: postId,
      });

      if (response.success && response.data) {
        setResult(response.data);
        message.success(`Phân tích hoàn tất: ${response.data.summary.totalSuggestions} gợi ý`);
      } else {
        message.error(response.error || "Không thể phân tích nội dung");
      }
    } catch (error) {
      message.error("Lỗi khi phân tích nội dung");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    message.success("Đã copy!");
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "blue";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Quan trọng";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "add_heading":
        return <FontSizeOutlined />;
      case "add_keyword":
        return <ThunderboltOutlined />;
      case "add_internal_link":
        return <LinkOutlined />;
      case "add_faq":
        return <QuestionCircleOutlined />;
      case "improve_intro":
      case "add_section":
      case "improve_readability":
        return <FileTextOutlined />;
      default:
        return <BulbOutlined />;
    }
  };

  const renderSuggestionItem = (item: ContentOptimizationSuggestion, index: number) => (
    <List.Item key={index}>
      <List.Item.Meta
        avatar={
          <Badge color={getPriorityColor(item.priority)} dot>
            {getSuggestionIcon(item.type)}
          </Badge>
        }
        title={
          <Space>
            <Text strong>{item.title}</Text>
            <Tag color={getPriorityColor(item.priority)} style={{ fontSize: 10 }}>
              {getPriorityLabel(item.priority)}
            </Tag>
          </Space>
        }
        description={
          <div>
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              {item.description}
            </Paragraph>
            <div
              style={{
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 4,
                padding: "8px 12px",
                marginBottom: 8,
              }}
            >
              <Text code style={{ whiteSpace: "pre-wrap" }}>
                {item.suggestion}
              </Text>
            </div>
            <Space size="small">
              <Button
                size="small"
                icon={copiedItem === `suggestion-${index}` ? <CheckOutlined /> : <CopyOutlined />}
                onClick={() => copyToClipboard(item.suggestion, `suggestion-${index}`)}
              >
                Copy
              </Button>
              {item.position && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Vị trí: {item.position}
                </Text>
              )}
            </Space>
          </div>
        }
      />
    </List.Item>
  );

  const renderHeadingSuggestions = (headings: HeadingSuggestion[]) => (
    <List
      size="small"
      dataSource={headings}
      renderItem={(item, index) => (
        <List.Item
          actions={[
            <Button
              key="copy"
              size="small"
              icon={copiedItem === `heading-${index}` ? <CheckOutlined /> : <CopyOutlined />}
              onClick={() => copyToClipboard(item.text, `heading-${index}`)}
            />,
            onApplyHeading && (
              <Button
                key="apply"
                size="small"
                type="primary"
                onClick={() => onApplyHeading(item)}
              >
                Áp dụng
              </Button>
            ),
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={<Tag color="blue">{item.type.toUpperCase()}</Tag>}
            title={item.text}
            description={
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.reason}
                </Text>
                {item.afterSection && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Sau phần: {item.afterSection}
                  </Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderKeywordSuggestions = (keywords: KeywordSuggestion[]) => (
    <List
      size="small"
      dataSource={keywords}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<ThunderboltOutlined style={{ color: "#faad14" }} />}
            title={
              <Space>
                <Text strong>"{item.keyword}"</Text>
                <Tag>
                  {item.currentCount} → {item.suggestedCount} lần
                </Tag>
              </Space>
            }
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Nên thêm tại: {item.placements.join(", ")}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderInternalLinkSuggestions = (links: InternalLinkOptSuggestion[]) => (
    <List
      size="small"
      dataSource={links}
      renderItem={(item, index) => (
        <List.Item
          actions={[
            <Button
              key="copy"
              size="small"
              icon={copiedItem === `link-${index}` ? <CheckOutlined /> : <CopyOutlined />}
              onClick={() =>
                copyToClipboard(`[${item.anchorText}](/p/${item.targetSlug})`, `link-${index}`)
              }
            />,
            onApplyLink && (
              <Button
                key="apply"
                size="small"
                type="primary"
                onClick={() => onApplyLink(item)}
              >
                Chèn
              </Button>
            ),
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={<LinkOutlined style={{ color: "#1890ff" }} />}
            title={
              <Space>
                <Text code>{item.anchorText}</Text>
                <Text type="secondary">→</Text>
                <Text>{item.targetPost}</Text>
              </Space>
            }
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Ngữ cảnh: {item.context}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderFaqSuggestions = (faqs: FaqSuggestion[]) => (
    <List
      size="small"
      dataSource={faqs}
      renderItem={(item, index) => (
        <List.Item
          actions={[
            <Button
              key="copy"
              size="small"
              icon={copiedItem === `faq-${index}` ? <CheckOutlined /> : <CopyOutlined />}
              onClick={() =>
                copyToClipboard(`**Q: ${item.question}**\n\nA: ${item.suggestedAnswer}`, `faq-${index}`)
              }
            />,
            onApplyFaq && (
              <Button
                key="apply"
                size="small"
                type="primary"
                onClick={() => onApplyFaq(item)}
              >
                Thêm FAQ
              </Button>
            ),
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={<QuestionCircleOutlined style={{ color: "#fa8c16" }} />}
            title={<Text strong>Q: {item.question}</Text>}
            description={
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2, expandable: true, symbol: "xem thêm" }}
                style={{ marginBottom: 0, fontSize: 12 }}
              >
                A: {item.suggestedAnswer}
              </Paragraph>
            }
          />
        </List.Item>
      )}
    />
  );

  const collapseItems = result
    ? [
        {
          key: "suggestions",
          label: (
            <Space>
              <BulbOutlined />
              <span>Gợi ý cải thiện</span>
              <Badge
                count={result.suggestions.length}
                style={{ backgroundColor: "#52c41a" }}
              />
            </Space>
          ),
          children: (
            <List
              size="small"
              dataSource={result.suggestions}
              renderItem={renderSuggestionItem}
              locale={{ emptyText: "Không có gợi ý" }}
            />
          ),
        },
        {
          key: "headings",
          label: (
            <Space>
              <FontSizeOutlined />
              <span>Gợi ý Heading mới</span>
              <Badge count={result.headingSuggestions.length} />
            </Space>
          ),
          children: renderHeadingSuggestions(result.headingSuggestions),
        },
        {
          key: "keywords",
          label: (
            <Space>
              <ThunderboltOutlined />
              <span>Tối ưu Keyword</span>
              <Badge
                count={result.keywordSuggestions.length}
                style={{ backgroundColor: "#faad14" }}
              />
            </Space>
          ),
          children: renderKeywordSuggestions(result.keywordSuggestions),
        },
        {
          key: "links",
          label: (
            <Space>
              <LinkOutlined />
              <span>Internal Link gợi ý</span>
              <Badge
                count={result.internalLinkSuggestions.length}
                style={{ backgroundColor: "#1890ff" }}
              />
            </Space>
          ),
          children: renderInternalLinkSuggestions(result.internalLinkSuggestions),
        },
        {
          key: "faqs",
          label: (
            <Space>
              <QuestionCircleOutlined />
              <span>FAQ gợi ý</span>
              <Badge
                count={result.faqSuggestions.length}
                style={{ backgroundColor: "#fa8c16" }}
              />
            </Space>
          ),
          children: renderFaqSuggestions(result.faqSuggestions),
        },
      ]
    : [];

  return (
    <Card
      title={
        <Space>
          <RocketOutlined style={{ color: "#1890ff" }} />
          <span>Content Optimizer</span>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<BulbOutlined />}
          loading={loading}
          onClick={handleAnalyze}
          disabled={!title || !content}
        >
          Phân tích & Gợi ý
        </Button>
      }
      size="small"
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">AI đang phân tích nội dung...</Text>
          </div>
        </div>
      ) : result ? (
        <>
          {/* Summary */}
          <Alert
            type="info"
            showIcon
            icon={<BulbOutlined />}
            message={
              <Space split={<Divider type="vertical" />}>
                <span>
                  Tổng: <strong>{result.summary.totalSuggestions}</strong> gợi ý
                </span>
                <span>
                  <Tag color="red">{result.summary.highPriority} cao</Tag>
                </span>
                <span>
                  <Tag color="orange">{result.summary.mediumPriority} TB</Tag>
                </span>
                <span>
                  <Tag color="blue">{result.summary.lowPriority} thấp</Tag>
                </span>
                <Tooltip title="Điểm cải thiện ước tính nếu áp dụng tất cả gợi ý">
                  <span style={{ color: "#52c41a" }}>
                    +{result.summary.estimatedImprovementScore} điểm SEO
                  </span>
                </Tooltip>
              </Space>
            }
            style={{ marginBottom: 16 }}
          />

          {/* Detailed Suggestions */}
          <Collapse
            items={collapseItems}
            defaultActiveKey={["suggestions"]}
            size="small"
          />
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={0}>
              <Text type="secondary">
                AI sẽ phân tích nội dung và đưa ra gợi ý cụ thể
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Ví dụ: Thêm H2 "Nguyên liệu cần chuẩn bị", keyword cần xuất hiện thêm, internal link nên chèn...
              </Text>
            </Space>
          }
        />
      )}
    </Card>
  );
}

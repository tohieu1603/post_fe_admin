"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Space,
  Progress,
  Tag,
  List,
  Typography,
  Alert,
  Tooltip,
  Spin,
  Collapse,
  Divider,
  Badge,
  Row,
  Col,
  Input,
} from "antd";
import {
  RobotOutlined,
  BulbOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  FileSearchOutlined,
  CodeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  aiSeoApi,
  SmartMetaResponse,
  RealtimeSeoScore,
  InternalLinkSuggestion,
  DuplicateCheckResult,
  SchemaResponse,
} from "@/lib/api";

const { Text, Paragraph } = Typography;

interface SeoAiPanelProps {
  title: string;
  content: string;
  metaDescription?: string;
  focusKeyword?: string;
  postId?: string;
  onApplyMeta?: (meta: SmartMetaResponse) => void;
  onApplyLink?: (link: InternalLinkSuggestion) => void;
}

export default function SeoAiPanel({
  title,
  content,
  metaDescription,
  focusKeyword,
  postId,
  onApplyMeta,
  onApplyLink,
}: SeoAiPanelProps) {
  // States
  const [loading, setLoading] = useState<string | null>(null);
  const [smartMeta, setSmartMeta] = useState<SmartMetaResponse | null>(null);
  const [seoScore, setSeoScore] = useState<RealtimeSeoScore | null>(null);
  const [internalLinks, setInternalLinks] = useState<InternalLinkSuggestion[]>([]);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | null>(null);
  const [schema, setSchema] = useState<SchemaResponse | null>(null);

  // Helper functions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "warning":
        return <WarningOutlined style={{ color: "#faad14" }} />;
      case "error":
        return <CloseCircleOutlined style={{ color: "#f5222d" }} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    if (score >= 40) return "#fa8c16";
    return "#f5222d";
  };

  // API handlers
  const handleGenerateSmartMeta = async () => {
    if (!title) return;
    setLoading("smartMeta");
    try {
      const result = await aiSeoApi.generateSmartMeta(title, content);
      if (result.success && result.data) {
        setSmartMeta(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleGetSeoScore = async () => {
    if (!title || !content) return;
    setLoading("seoScore");
    try {
      const result = await aiSeoApi.getRealtimeSeoScore({
        title,
        metaDescription,
        content,
        focusKeyword,
      });
      if (result.success && result.data) {
        setSeoScore(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleSuggestLinks = async () => {
    if (!content) return;
    setLoading("links");
    try {
      const result = await aiSeoApi.suggestInternalLinks(content, postId);
      if (result.success && result.data) {
        setInternalLinks(result.data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!content) return;
    setLoading("duplicate");
    try {
      const result = await aiSeoApi.checkDuplicateContent(content, postId);
      if (result.success && result.data) {
        setDuplicateCheck(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateSchema = async () => {
    if (!postId) return;
    setLoading("schema");
    try {
      const result = await aiSeoApi.generateSchema(postId);
      if (result.success && result.data) {
        setSchema(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const collapseItems = [
    {
      key: "score",
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>SEO Score (AI)</span>
          {seoScore && (
            <Badge
              count={seoScore.score}
              style={{ backgroundColor: getScoreColor(seoScore.score) }}
            />
          )}
        </Space>
      ),
      children: (
        <div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleGetSeoScore}
            loading={loading === "seoScore"}
            disabled={!title || !content}
            block
            style={{ marginBottom: 16 }}
          >
            Phân tích SEO
          </Button>

          {seoScore && (
            <>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Progress
                  type="circle"
                  percent={seoScore.score}
                  strokeColor={getScoreColor(seoScore.score)}
                  size={80}
                />
              </div>

              <List
                size="small"
                dataSource={Object.entries(seoScore.breakdown)}
                renderItem={([key, value]) => (
                  <List.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Space>
                        {getStatusIcon(value.status)}
                        <Text>{key}</Text>
                      </Space>
                      <Tag color={value.status === "good" ? "success" : value.status === "warning" ? "warning" : "error"}>
                        {value.score}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 4 }}>
                      {value.message}
                    </Text>
                  </List.Item>
                )}
              />

              {seoScore.suggestions.length > 0 && (
                <Alert
                  type="info"
                  message="Gợi ý cải thiện"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {seoScore.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  }
                  style={{ marginTop: 12 }}
                />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "smartMeta",
      label: (
        <Space>
          <BulbOutlined />
          <span>Smart Meta Generator</span>
        </Space>
      ),
      children: (
        <div>
          <Button
            icon={<RobotOutlined />}
            onClick={handleGenerateSmartMeta}
            loading={loading === "smartMeta"}
            disabled={!title}
            block
            style={{ marginBottom: 16 }}
          >
            Tạo Meta từ tiêu đề
          </Button>

          {smartMeta && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Meta Title:</Text>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Input value={smartMeta.metaTitle} readOnly size="small" />
                  <Tooltip title="Copy">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(smartMeta.metaTitle)}
                    />
                  </Tooltip>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Text strong>Meta Description:</Text>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
                  <Input.TextArea value={smartMeta.metaDescription} readOnly rows={2} size="small" />
                  <Tooltip title="Copy">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(smartMeta.metaDescription)}
                    />
                  </Tooltip>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Text strong>Focus Keyword:</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>{smartMeta.focusKeyword}</Tag>
              </div>

              <div>
                <Text strong>Secondary Keywords:</Text>
                <div style={{ marginTop: 4 }}>
                  {smartMeta.secondaryKeywords.map((kw) => (
                    <Tag key={kw}>{kw}</Tag>
                  ))}
                </div>
              </div>

              {onApplyMeta && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => onApplyMeta(smartMeta)}
                  style={{ marginTop: 12 }}
                  block
                >
                  Áp dụng Meta
                </Button>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "links",
      label: (
        <Space>
          <LinkOutlined />
          <span>Internal Links</span>
          {internalLinks.length > 0 && <Badge count={internalLinks.length} />}
        </Space>
      ),
      children: (
        <div>
          <Button
            icon={<LinkOutlined />}
            onClick={handleSuggestLinks}
            loading={loading === "links"}
            disabled={!content}
            block
            style={{ marginBottom: 16 }}
          >
            Gợi ý Internal Links
          </Button>

          {internalLinks.length > 0 && (
            <List
              size="small"
              dataSource={internalLinks}
              renderItem={(link) => (
                <List.Item
                  actions={[
                    onApplyLink && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => onApplyLink(link)}
                        key="apply"
                      >
                        Chèn
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{link.postTitle}</Text>
                        <Tag color="blue">{link.relevanceScore}%</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Anchor: "{link.anchorText}"
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {link.context}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
    {
      key: "duplicate",
      label: (
        <Space>
          <FileSearchOutlined />
          <span>Duplicate Check</span>
          {duplicateCheck && (
            <Tag color={duplicateCheck.isDuplicate ? "error" : "success"}>
              {duplicateCheck.isDuplicate ? "Có trùng" : "OK"}
            </Tag>
          )}
        </Space>
      ),
      children: (
        <div>
          <Button
            icon={<FileSearchOutlined />}
            onClick={handleCheckDuplicate}
            loading={loading === "duplicate"}
            disabled={!content}
            block
            style={{ marginBottom: 16 }}
          >
            Kiểm tra trùng lặp
          </Button>

          {duplicateCheck && (
            <>
              <Alert
                type={duplicateCheck.isDuplicate ? "warning" : "success"}
                message={`Độ tương tự: ${duplicateCheck.similarityScore}%`}
                description={duplicateCheck.recommendation}
                style={{ marginBottom: 12 }}
              />

              {duplicateCheck.matches.length > 0 && (
                <List
                  size="small"
                  header={<Text strong>Bài viết tương tự:</Text>}
                  dataSource={duplicateCheck.matches}
                  renderItem={(match) => (
                    <List.Item>
                      <Space direction="vertical" size={0}>
                        <Space>
                          <Text>{match.postTitle}</Text>
                          <Tag color="orange">{match.similarity}%</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Cụm từ trùng: {match.matchedPhrases.slice(0, 3).join(", ")}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "schema",
      label: (
        <Space>
          <CodeOutlined />
          <span>Schema Generator</span>
        </Space>
      ),
      children: (
        <div>
          <Button
            icon={<CodeOutlined />}
            onClick={handleGenerateSchema}
            loading={loading === "schema"}
            disabled={!postId}
            block
            style={{ marginBottom: 16 }}
          >
            Tạo Schema JSON-LD
          </Button>

          {!postId && (
            <Alert
              type="info"
              message="Lưu bài viết trước để tạo Schema"
              style={{ marginBottom: 12 }}
            />
          )}

          {schema && (
            <div>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(JSON.stringify(schema.articleSchema, null, 2))}
                    block
                  >
                    Article Schema
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(JSON.stringify(schema.breadcrumbSchema, null, 2))}
                    block
                  >
                    Breadcrumb
                  </Button>
                </Col>
                {schema.faqSchema && (
                  <Col span={24}>
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(JSON.stringify(schema.faqSchema, null, 2))}
                      block
                    >
                      FAQ Schema
                    </Button>
                  </Col>
                )}
              </Row>

              <Divider style={{ margin: "12px 0" }} />

              <Text type="secondary" style={{ fontSize: 11 }}>
                Copy và dán vào thẻ &lt;script type="application/ld+json"&gt; trong head của trang.
              </Text>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>AI SEO Assistant</span>
        </Space>
      }
      size="small"
    >
      <Collapse
        items={collapseItems}
        defaultActiveKey={["score"]}
        size="small"
        accordion
      />
    </Card>
  );
}

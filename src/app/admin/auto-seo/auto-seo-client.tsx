"use client";

import { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Empty,
  Spin,
  Alert,
  Badge,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  RocketOutlined,
  LineChartOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  KeyOutlined,
  FileTextOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  BulbOutlined,
  CopyOutlined,
  EditOutlined,
  ScheduleOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  AutoSeoDashboard,
  SeoLog,
  Keyword,
  IndexStatus,
  Post,
  autoSeoApi,
  postApi,
  aiSeoApi,
  schedulerApi,
  AiSeoAnalysis,
  AiTitleSuggestion,
  AiKeywordSuggestion,
  AiContentOutline,
  SeoReport,
  SchedulerStatus,
  ScheduledTaskResult,
} from "@/lib/api";

const { Title, Text, Paragraph } = Typography;

// Score color helper
const getScoreColor = (score: number) => {
  if (score >= 80) return "#52c41a";
  if (score >= 60) return "#faad14";
  if (score >= 40) return "#fa8c16";
  return "#f5222d";
};

const getScoreStatus = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "normal";
  return "exception";
};

export default function AutoSeoClient() {
  const [dashboard, setDashboard] = useState<AutoSeoDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [indexStatuses, setIndexStatuses] = useState<IndexStatus[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [keywordModalOpen, setKeywordModalOpen] = useState(false);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [form] = Form.useForm();

  // AI SEO states
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiSeoAnalysis | null>(null);
  const [aiTitles, setAiTitles] = useState<AiTitleSuggestion[]>([]);
  const [aiKeywords, setAiKeywords] = useState<AiKeywordSuggestion[]>([]);
  const [aiOutline, setAiOutline] = useState<AiContentOutline | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSelectedPostId, setAiSelectedPostId] = useState<string | null>(null);
  const [aiTopic, setAiTopic] = useState("");

  // Scheduler states
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [seoReport, setSeoReport] = useState<SeoReport | null>(null);
  const [schedulerLoading, setSchedulerLoading] = useState<string | null>(null);
  const [taskResults, setTaskResults] = useState<ScheduledTaskResult[]>([]);

  // Fetch dashboard
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await autoSeoApi.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Fetch keywords
  const fetchKeywords = async () => {
    try {
      const data = await autoSeoApi.getKeywords();
      setKeywords(data);
    } catch (e) {
      message.error("Không thể tải keywords");
    }
  };

  // Fetch index statuses
  const fetchIndexStatuses = async () => {
    try {
      const data = await autoSeoApi.getIndexStatus();
      setIndexStatuses(data);
    } catch (e) {
      message.error("Không thể tải index status");
    }
  };

  // Fetch posts for analysis
  const fetchPosts = async () => {
    try {
      const { data } = await postApi.getAll({ status: "published", limit: 100 });
      setPosts(data);
    } catch (e) {
      // Ignore
    }
  };

  // Fetch scheduler status
  const fetchSchedulerStatus = async () => {
    try {
      const result = await schedulerApi.getStatus();
      if (result.success && result.data) {
        setSchedulerStatus(result.data);
        if (result.data.lastReport) {
          setSeoReport(result.data.lastReport);
        }
      }
    } catch (e) {
      // Ignore
    }
  };

  // Fetch last report
  const fetchLastReport = async () => {
    try {
      const result = await schedulerApi.getLastReport();
      if (result.success && result.data) {
        setSeoReport(result.data);
      }
    } catch (e) {
      // Ignore
    }
  };

  // Generate report
  const handleGenerateReport = async (period: 'daily' | 'weekly' | 'monthly') => {
    setSchedulerLoading(`report-${period}`);
    try {
      const result = await schedulerApi.generateReport(period);
      if (result.success && result.data) {
        setSeoReport(result.data);
        message.success(`Đã tạo báo cáo ${period}!`);
      } else {
        message.error(result.error || "Không thể tạo báo cáo");
      }
    } catch (e) {
      message.error("Lỗi khi tạo báo cáo");
    } finally {
      setSchedulerLoading(null);
    }
  };

  // Trigger scheduled tasks
  const handleTriggerTasks = async (type: 'daily' | 'weekly' | 'monthly') => {
    setSchedulerLoading(`trigger-${type}`);
    setTaskResults([]);
    try {
      let result;
      switch (type) {
        case 'daily':
          result = await schedulerApi.triggerDailyTasks();
          break;
        case 'weekly':
          result = await schedulerApi.triggerWeeklyTasks();
          break;
        case 'monthly':
          result = await schedulerApi.triggerMonthlyTasks();
          break;
      }
      if (result.success && result.data) {
        setTaskResults(result.data);
        const successCount = result.data.filter(t => t.success).length;
        message.success(`Hoàn thành ${successCount}/${result.data.length} tasks`);
        fetchSchedulerStatus();
        fetchDashboard();
      } else {
        message.error(result.error || "Không thể chạy tasks");
      }
    } catch (e) {
      message.error("Lỗi khi chạy scheduled tasks");
    } finally {
      setSchedulerLoading(null);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchKeywords();
    fetchIndexStatuses();
    fetchPosts();
    fetchSchedulerStatus();
  }, []);

  // Track keyword
  const handleTrackKeyword = async (values: any) => {
    try {
      await autoSeoApi.trackKeyword(values);
      message.success("Đã thêm keyword theo dõi");
      setKeywordModalOpen(false);
      form.resetFields();
      fetchKeywords();
      fetchDashboard();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Delete keyword
  const handleDeleteKeyword = async (id: string) => {
    try {
      await autoSeoApi.deleteKeyword(id);
      message.success("Đã xóa keyword");
      fetchKeywords();
      fetchDashboard();
    } catch (e) {
      message.error("Không thể xóa keyword");
    }
  };

  // Analyze post
  const handleAnalyzePost = async () => {
    if (!selectedPostId) return;

    setAnalyzing(true);
    try {
      const result = await autoSeoApi.analyzePost(selectedPostId);
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        message.success(`Phân tích hoàn tất! Score: ${result.data.overallScore}`);
        fetchDashboard();
      } else {
        message.error(result.error || "Phân tích thất bại");
      }
    } catch (e) {
      message.error("Không thể phân tích bài viết");
    } finally {
      setAnalyzing(false);
    }
  };

  // Submit URL for indexing
  const handleSubmitForIndexing = async (url: string) => {
    try {
      const result = await autoSeoApi.submitUrlForIndexing(url);
      if (result.success) {
        message.success("Đã gửi URL để index");
        fetchIndexStatuses();
        fetchDashboard();
      } else {
        message.warning(result.error || "Gửi thất bại");
      }
    } catch (e) {
      message.error("Không thể gửi URL");
    }
  };

  // AI SEO: Analyze post with DeepSeek
  const handleAiAnalyzePost = async () => {
    if (!aiSelectedPostId) return;
    setAiAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      const result = await aiSeoApi.analyzePost(aiSelectedPostId);
      if (result.success && result.data) {
        setAiAnalysisResult(result.data);
        message.success("Phân tích AI hoàn tất!");
      } else {
        message.error(result.error || "Phân tích AI thất bại");
      }
    } catch (e) {
      message.error("Không thể phân tích với AI");
    } finally {
      setAiAnalyzing(false);
    }
  };

  // AI SEO: Generate titles
  const handleAiSuggestTitles = async () => {
    if (!aiSelectedPostId) return;
    setAiLoading("titles");
    setAiTitles([]);
    try {
      const result = await aiSeoApi.suggestTitles(aiSelectedPostId, 5);
      if (result.success && result.data) {
        setAiTitles(result.data);
        message.success("Đã tạo gợi ý tiêu đề!");
      } else {
        message.error(result.error || "Không thể tạo tiêu đề");
      }
    } catch (e) {
      message.error("Lỗi khi tạo tiêu đề");
    } finally {
      setAiLoading(null);
    }
  };

  // AI SEO: Suggest keywords
  const handleAiSuggestKeywords = async () => {
    if (!aiTopic) {
      message.warning("Vui lòng nhập chủ đề");
      return;
    }
    setAiLoading("keywords");
    setAiKeywords([]);
    try {
      const result = await aiSeoApi.suggestKeywords(aiTopic, 10);
      if (result.success && result.data) {
        setAiKeywords(result.data);
        message.success("Đã tạo gợi ý keywords!");
      } else {
        message.error(result.error || "Không thể tạo keywords");
      }
    } catch (e) {
      message.error("Lỗi khi tạo keywords");
    } finally {
      setAiLoading(null);
    }
  };

  // AI SEO: Generate outline
  const handleAiGenerateOutline = async () => {
    if (!aiTopic) {
      message.warning("Vui lòng nhập chủ đề");
      return;
    }
    setAiLoading("outline");
    setAiOutline(null);
    try {
      const result = await aiSeoApi.generateOutline(aiTopic);
      if (result.success && result.data) {
        setAiOutline(result.data);
        message.success("Đã tạo dàn ý!");
      } else {
        message.error(result.error || "Không thể tạo dàn ý");
      }
    } catch (e) {
      message.error("Lỗi khi tạo dàn ý");
    } finally {
      setAiLoading(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Đã copy!");
  };

  // Keyword columns
  const keywordColumns: ColumnsType<Keyword> = [
    {
      title: "Keyword",
      dataIndex: "keyword",
      key: "keyword",
      render: (keyword) => <Text strong>{keyword}</Text>,
    },
    {
      title: "Target URL",
      dataIndex: "targetUrl",
      key: "targetUrl",
      ellipsis: true,
      render: (url) => url ? <Text code>{url}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "Search Volume",
      dataIndex: "searchVolume",
      key: "searchVolume",
      width: 120,
      align: "center",
      render: (vol) => vol ? vol.toLocaleString() : "-",
    },
    {
      title: "Rank",
      dataIndex: "currentRank",
      key: "currentRank",
      width: 80,
      align: "center",
      render: (rank, record) => {
        if (!rank) return "-";
        const diff = record.previousRank ? record.previousRank - rank : 0;
        return (
          <Space>
            <Text strong>{rank}</Text>
            {diff > 0 && <Text type="success">+{diff}</Text>}
            {diff < 0 && <Text type="danger">{diff}</Text>}
          </Space>
        );
      },
    },
    {
      title: "CTR",
      dataIndex: "ctr",
      key: "ctr",
      width: 80,
      align: "center",
      render: (ctr) => `${(ctr * 100).toFixed(1)}%`,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Xóa keyword này?"
          onConfirm={() => handleDeleteKeyword(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // Index status columns
  const indexColumns: ColumnsType<IndexStatus> = [
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      ellipsis: true,
      render: (url) => <Text code>{url}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          indexed: { color: "success", icon: <CheckCircleOutlined /> },
          submitted: { color: "processing", icon: <SyncOutlined spin /> },
          pending: { color: "warning", icon: <ClockCircleOutlined /> },
          error: { color: "error", icon: <ExclamationCircleOutlined /> },
          not_indexed: { color: "default", icon: <ExclamationCircleOutlined /> },
        };
        const { color, icon } = config[status] || { color: "default", icon: null };
        return <Tag color={color} icon={icon}>{status}</Tag>;
      },
    },
    {
      title: "Mobile Score",
      dataIndex: "mobileScore",
      key: "mobileScore",
      width: 120,
      align: "center",
      render: (score) => score ? (
        <Progress
          type="circle"
          size={40}
          percent={score}
          strokeColor={getScoreColor(score)}
        />
      ) : "-",
    },
    {
      title: "Desktop Score",
      dataIndex: "desktopScore",
      key: "desktopScore",
      width: 120,
      align: "center",
      render: (score) => score ? (
        <Progress
          type="circle"
          size={40}
          percent={score}
          strokeColor={getScoreColor(score)}
        />
      ) : "-",
    },
    {
      title: "Last Checked",
      dataIndex: "lastChecked",
      key: "lastChecked",
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Gửi lại để index">
          <Button
            type="text"
            size="small"
            icon={<RocketOutlined />}
            onClick={() => handleSubmitForIndexing(record.url)}
          />
        </Tooltip>
      ),
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: "dashboard",
      label: (
        <span>
          <BarChartOutlined /> Dashboard
        </span>
      ),
      children: (
        <div>
          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={4}>
              <Card>
                <Statistic
                  title="Tổng bài viết"
                  value={dashboard?.totalPosts || 0}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card>
                <Statistic
                  title="Đã phân tích"
                  value={dashboard?.analyzedPosts || 0}
                  prefix={<SearchOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card>
                <Statistic
                  title="Điểm TB"
                  value={dashboard?.avgScore || 0}
                  suffix="/100"
                  valueStyle={{ color: getScoreColor(dashboard?.avgScore || 0) }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card>
                <Statistic
                  title="Đã index"
                  value={dashboard?.indexedUrls || 0}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card>
                <Statistic
                  title="Chờ index"
                  value={dashboard?.pendingUrls || 0}
                  prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card>
                <Statistic
                  title="Keywords"
                  value={dashboard?.trackedKeywords || 0}
                  prefix={<KeyOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Score Distribution */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Card title="Phân bố điểm SEO" size="small">
                {dashboard?.scoreDistribution?.length ? (
                  <div>
                    {dashboard.scoreDistribution.map((item) => (
                      <div key={item.range} style={{ marginBottom: 8 }}>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Text>{item.range}</Text>
                          <Text strong>{item.count} posts</Text>
                        </Space>
                        <Progress
                          percent={dashboard.analyzedPosts ? (item.count / dashboard.analyzedPosts) * 100 : 0}
                          showInfo={false}
                          strokeColor={
                            item.range === "81-100" ? "#52c41a" :
                            item.range === "61-80" ? "#73d13d" :
                            item.range === "41-60" ? "#faad14" :
                            item.range === "21-40" ? "#fa8c16" : "#f5222d"
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="Chưa có dữ liệu" />
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Hoạt động gần đây" size="small">
                {dashboard?.recentActivity?.length ? (
                  <List
                    size="small"
                    dataSource={dashboard.recentActivity.slice(0, 5)}
                    renderItem={(item) => (
                      <List.Item>
                        <Space>
                          <Badge
                            status={
                              item.status === "success" ? "success" :
                              item.status === "failed" ? "error" :
                              item.status === "pending" ? "processing" : "default"
                            }
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </Text>
                          <Text>{item.action}</Text>
                          {item.message && (
                            <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>
                              - {item.message}
                            </Text>
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Chưa có hoạt động" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Keyword Rankings */}
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>Top Keyword Rankings</span>
              </Space>
            }
            style={{ marginTop: 24 }}
            size="small"
          >
            {keywords.length > 0 ? (
              <Table
                columns={[
                  {
                    title: "Keyword",
                    dataIndex: "keyword",
                    key: "keyword",
                    render: (keyword: string) => <Text strong>{keyword}</Text>,
                  },
                  {
                    title: "Position",
                    dataIndex: "currentRank",
                    key: "currentRank",
                    width: 100,
                    align: "center" as const,
                    render: (rank: number | null, record: Keyword) => {
                      if (!rank) return <Text type="secondary">-</Text>;
                      const diff = record.previousRank ? record.previousRank - rank : 0;
                      return (
                        <Space>
                          <Tag color={rank <= 3 ? "gold" : rank <= 10 ? "green" : rank <= 20 ? "blue" : "default"}>
                            #{rank}
                          </Tag>
                          {diff > 0 && <Text type="success" style={{ fontSize: 11 }}>▲{diff}</Text>}
                          {diff < 0 && <Text type="danger" style={{ fontSize: 11 }}>▼{Math.abs(diff)}</Text>}
                        </Space>
                      );
                    },
                    sorter: (a: Keyword, b: Keyword) => (a.currentRank || 999) - (b.currentRank || 999),
                    defaultSortOrder: "ascend" as const,
                  },
                  {
                    title: "Clicks",
                    dataIndex: "clicks",
                    key: "clicks",
                    width: 80,
                    align: "center" as const,
                    render: (clicks: number) => clicks.toLocaleString(),
                    sorter: (a: Keyword, b: Keyword) => a.clicks - b.clicks,
                  },
                  {
                    title: "Impressions",
                    dataIndex: "impressions",
                    key: "impressions",
                    width: 100,
                    align: "center" as const,
                    render: (imp: number) => imp.toLocaleString(),
                    sorter: (a: Keyword, b: Keyword) => a.impressions - b.impressions,
                  },
                  {
                    title: "CTR",
                    dataIndex: "ctr",
                    key: "ctr",
                    width: 80,
                    align: "center" as const,
                    render: (ctr: number) => (
                      <Tag color={ctr >= 0.05 ? "green" : ctr >= 0.02 ? "blue" : "default"}>
                        {(ctr * 100).toFixed(1)}%
                      </Tag>
                    ),
                    sorter: (a: Keyword, b: Keyword) => a.ctr - b.ctr,
                  },
                ]}
                dataSource={keywords.slice(0, 10)}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty
                description="Chưa có keyword nào được theo dõi"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setKeywordModalOpen(true)}>
                  Thêm keyword
                </Button>
              </Empty>
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="Thao tác nhanh" style={{ marginTop: 24 }} size="small">
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setAnalyzeModalOpen(true)}
              >
                Phân tích bài viết
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setKeywordModalOpen(true)}>
                Thêm keyword
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={async () => {
                  message.loading("Đang đồng bộ keywords...");
                  const result = await autoSeoApi.syncKeywords();
                  if (result.success) {
                    message.success(`Đã đồng bộ ${result.synced} keywords`);
                    fetchKeywords();
                  } else {
                    message.info(result.error || "Không thể đồng bộ");
                  }
                }}
              >
                Sync từ Search Console
              </Button>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: "keywords",
      label: (
        <span>
          <KeyOutlined /> Keywords ({keywords.length})
        </span>
      ),
      children: (
        <Card
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setKeywordModalOpen(true)}>
              Thêm keyword
            </Button>
          }
        >
          <Table
            columns={keywordColumns}
            dataSource={keywords}
            rowKey="id"
            pagination={{ pageSize: 20, showTotal: (t) => `Tổng ${t} keywords` }}
            size="middle"
          />
        </Card>
      ),
    },
    {
      key: "indexing",
      label: (
        <span>
          <GlobalOutlined /> Index Status ({indexStatuses.length})
        </span>
      ),
      children: (
        <Card>
          <Table
            columns={indexColumns}
            dataSource={indexStatuses}
            rowKey="id"
            pagination={{ pageSize: 20, showTotal: (t) => `Tổng ${t} URLs` }}
            size="middle"
          />
        </Card>
      ),
    },
    {
      key: "ai-seo",
      label: (
        <span>
          <RobotOutlined /> AI SEO (DeepSeek)
        </span>
      ),
      children: (
        <div>
          <Alert
            message="AI SEO sử dụng DeepSeek AI để phân tích và tối ưu hóa SEO thông minh"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            {/* AI Analyze Post */}
            <Col xs={24} lg={12}>
              <Card title={<><RobotOutlined /> Phân tích AI</>} size="small">
                <Form.Item label="Chọn bài viết">
                  <Select
                    placeholder="Chọn bài viết để phân tích với AI"
                    value={aiSelectedPostId}
                    onChange={setAiSelectedPostId}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    options={posts.map((p) => ({ value: p.id, label: p.title }))}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Space wrap>
                  <Button
                    type="primary"
                    onClick={handleAiAnalyzePost}
                    loading={aiAnalyzing}
                    disabled={!aiSelectedPostId}
                    icon={<SearchOutlined />}
                  >
                    Phân tích SEO
                  </Button>
                  <Button
                    onClick={handleAiSuggestTitles}
                    loading={aiLoading === "titles"}
                    disabled={!aiSelectedPostId}
                    icon={<BulbOutlined />}
                  >
                    Gợi ý tiêu đề
                  </Button>
                </Space>

                {/* AI Analysis Result */}
                {aiAnalysisResult && (
                  <div style={{ marginTop: 16 }}>
                    <Card size="small" title="Kết quả phân tích AI">
                      <Row gutter={16}>
                        <Col span={8}>
                          <div style={{ textAlign: "center" }}>
                            <Progress
                              type="circle"
                              percent={aiAnalysisResult.overallScore}
                              strokeColor={getScoreColor(aiAnalysisResult.overallScore)}
                              size={100}
                            />
                            <div style={{ marginTop: 8 }}>
                              <Text strong>Điểm AI</Text>
                            </div>
                          </div>
                        </Col>
                        <Col span={16}>
                          {/* Title Analysis */}
                          <div style={{ marginBottom: 8 }}>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Text>Tiêu đề</Text>
                              <Tag color={aiAnalysisResult.titleAnalysis.score >= 70 ? "success" : aiAnalysisResult.titleAnalysis.score >= 50 ? "warning" : "error"}>
                                {aiAnalysisResult.titleAnalysis.score}/100
                              </Tag>
                            </Space>
                            {aiAnalysisResult.titleAnalysis.improvedTitle && (
                              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                                Gợi ý: {aiAnalysisResult.titleAnalysis.improvedTitle}
                              </Text>
                            )}
                          </div>

                          {/* Meta Description Analysis */}
                          <div style={{ marginBottom: 8 }}>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Text>Meta Description</Text>
                              <Tag color={aiAnalysisResult.metaDescriptionAnalysis.score >= 70 ? "success" : aiAnalysisResult.metaDescriptionAnalysis.score >= 50 ? "warning" : "error"}>
                                {aiAnalysisResult.metaDescriptionAnalysis.score}/100
                              </Tag>
                            </Space>
                          </div>

                          {/* Content Analysis */}
                          <div style={{ marginBottom: 8 }}>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Text>Nội dung</Text>
                              <Tag color={aiAnalysisResult.contentAnalysis.score >= 70 ? "success" : aiAnalysisResult.contentAnalysis.score >= 50 ? "warning" : "error"}>
                                {aiAnalysisResult.contentAnalysis.score}/100
                              </Tag>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                              Readability: {aiAnalysisResult.contentAnalysis.readability}
                            </Text>
                          </div>

                          {/* Keyword Analysis */}
                          <div style={{ marginBottom: 8 }}>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Text>Từ khóa</Text>
                              <Tag color={aiAnalysisResult.keywordAnalysis.score >= 70 ? "success" : aiAnalysisResult.keywordAnalysis.score >= 50 ? "warning" : "error"}>
                                {aiAnalysisResult.keywordAnalysis.score}/100
                              </Tag>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                              Density: {aiAnalysisResult.keywordAnalysis.density}
                            </Text>
                          </div>

                          {/* Structure Analysis */}
                          <div style={{ marginBottom: 8 }}>
                            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                              <Text>Cấu trúc</Text>
                              <Tag color={aiAnalysisResult.structureAnalysis.score >= 70 ? "success" : aiAnalysisResult.structureAnalysis.score >= 50 ? "warning" : "error"}>
                                {aiAnalysisResult.structureAnalysis.score}/100
                              </Tag>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                              {aiAnalysisResult.structureAnalysis.headingStructure}
                            </Text>
                          </div>
                        </Col>
                      </Row>

                      {/* Keywords detected */}
                      {aiAnalysisResult.keywordAnalysis.detectedKeywords?.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <Text strong>Từ khóa phát hiện:</Text>
                          <div style={{ marginTop: 8 }}>
                            {aiAnalysisResult.keywordAnalysis.detectedKeywords.map((kw, i) => (
                              <Tag key={i} color="blue" style={{ marginBottom: 4 }}>{kw}</Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Keywords */}
                      {aiAnalysisResult.keywordAnalysis.suggestedKeywords?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <Text strong>Từ khóa gợi ý thêm:</Text>
                          <div style={{ marginTop: 8 }}>
                            {aiAnalysisResult.keywordAnalysis.suggestedKeywords.map((kw, i) => (
                              <Tag key={i} color="green" style={{ marginBottom: 4 }}>{kw}</Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {aiAnalysisResult.summary && (
                        <Alert
                          message="Tổng kết"
                          description={aiAnalysisResult.summary}
                          type="info"
                          style={{ marginTop: 16 }}
                        />
                      )}

                      {/* Competitor Insights */}
                      {aiAnalysisResult.competitorInsights && aiAnalysisResult.competitorInsights.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <Text strong>Insights đối thủ:</Text>
                          <List
                            size="small"
                            dataSource={aiAnalysisResult.competitorInsights}
                            renderItem={(item) => (
                              <List.Item>
                                <Text><BulbOutlined style={{ color: "#1890ff", marginRight: 8 }} />{item}</Text>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* AI Title Suggestions */}
                {aiTitles.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Card size="small" title="Gợi ý tiêu đề từ AI">
                      <List
                        size="small"
                        dataSource={aiTitles}
                        renderItem={(item, index) => (
                          <List.Item
                            actions={[
                              <Tooltip title="Copy tiêu đề" key="copy">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<CopyOutlined />}
                                  onClick={() => copyToClipboard(item.title)}
                                />
                              </Tooltip>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Tag color="blue">{index + 1}</Tag>}
                              title={item.title}
                              description={
                                <Space direction="vertical" size={0}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>{item.reason}</Text>
                                  <Space size={4} style={{ marginTop: 4 }}>
                                    {item.keywords?.map((k) => <Tag key={k}>{k}</Tag>)}
                                  </Space>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </div>
                )}
              </Card>
            </Col>

            {/* AI Tools */}
            <Col xs={24} lg={12}>
              <Card title={<><BulbOutlined /> Công cụ AI</>} size="small">
                <Form.Item label="Chủ đề / Topic">
                  <Input
                    placeholder="Nhập chủ đề để tạo keywords hoặc dàn ý"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                </Form.Item>

                <Space wrap>
                  <Button
                    onClick={handleAiSuggestKeywords}
                    loading={aiLoading === "keywords"}
                    disabled={!aiTopic}
                    icon={<KeyOutlined />}
                  >
                    Gợi ý Keywords
                  </Button>
                  <Button
                    onClick={handleAiGenerateOutline}
                    loading={aiLoading === "outline"}
                    disabled={!aiTopic}
                    icon={<FileTextOutlined />}
                  >
                    Tạo dàn ý
                  </Button>
                </Space>

                {/* AI Keywords */}
                {aiKeywords.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Card size="small" title="Gợi ý Keywords từ AI">
                      <List
                        size="small"
                        dataSource={aiKeywords}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <Button
                                type="text"
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => copyToClipboard(item.keyword)}
                                key="copy"
                              />
                            ]}
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  <Text strong>{item.keyword}</Text>
                                  <Tag color={item.type === "primary" ? "blue" : item.type === "secondary" ? "green" : "orange"}>
                                    {item.type}
                                  </Tag>
                                  <Tag color={item.competition === "low" ? "success" : item.competition === "medium" ? "warning" : "error"}>
                                    {item.competition}
                                  </Tag>
                                </Space>
                              }
                              description={<Text type="secondary">{item.searchIntent}</Text>}
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </div>
                )}

                {/* AI Outline */}
                {aiOutline && (
                  <div style={{ marginTop: 16 }}>
                    <Card
                      size="small"
                      title="Dàn ý từ AI"
                      extra={
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => {
                            const text = `# ${aiOutline.title}\n\n${aiOutline.introduction}\n\n${aiOutline.sections.map(s =>
                              `## ${s.heading}\n${s.subheadings.map(sh => `### ${sh}`).join('\n')}\n${s.keyPoints.map(kp => `- ${kp}`).join('\n')}`
                            ).join('\n\n')}\n\n## Kết luận\n${aiOutline.conclusion}`;
                            copyToClipboard(text);
                          }}
                        >
                          Copy tất cả
                        </Button>
                      }
                    >
                      <Title level={5}>{aiOutline.title}</Title>
                      <Paragraph type="secondary">{aiOutline.introduction}</Paragraph>

                      {aiOutline.sections.map((section, idx) => (
                        <div key={idx} style={{ marginTop: 16 }}>
                          <Text strong style={{ fontSize: 15 }}>{section.heading}</Text>
                          <ul style={{ margin: "8px 0" }}>
                            {section.subheadings.map((sh, i) => (
                              <li key={i}><Text>{sh}</Text></li>
                            ))}
                          </ul>
                          <Space size={4} wrap>
                            {section.keyPoints.map((kp, i) => (
                              <Tag key={i} color="blue">{kp}</Tag>
                            ))}
                          </Space>
                        </div>
                      ))}

                      <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
                        <Text strong>Kết luận:</Text>
                        <Paragraph style={{ margin: 0 }}>{aiOutline.conclusion}</Paragraph>
                      </div>

                      <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                        Độ dài đề xuất: ~{aiOutline.estimatedWordCount} từ
                      </Text>
                    </Card>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "scheduler",
      label: (
        <span>
          <ScheduleOutlined /> Scheduled Tasks
        </span>
      ),
      children: (
        <div>
          {/* Scheduler Status */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Scheduler Status"
                  value={schedulerStatus?.isRunning ? "Running" : "Stopped"}
                  valueStyle={{ color: schedulerStatus?.isRunning ? "#52c41a" : "#ff4d4f" }}
                  prefix={schedulerStatus?.isRunning ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Active Tasks"
                  value={schedulerStatus?.tasksCount || 0}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Last Report"
                  value={seoReport ? new Date(seoReport.generatedAt).toLocaleString("vi-VN") : "N/A"}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Trigger Tasks */}
          <Card title="Run Scheduled Tasks" style={{ marginTop: 16 }}>
            <Alert
              message="Lưu ý: Các tác vụ này thường chạy tự động theo lịch. Bạn có thể chạy thủ công để kiểm tra."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Space wrap>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={schedulerLoading === "trigger-daily"}
                onClick={() => handleTriggerTasks("daily")}
              >
                Run Daily Tasks
              </Button>
              <Button
                icon={<PlayCircleOutlined />}
                loading={schedulerLoading === "trigger-weekly"}
                onClick={() => handleTriggerTasks("weekly")}
              >
                Run Weekly Tasks
              </Button>
              <Button
                icon={<PlayCircleOutlined />}
                loading={schedulerLoading === "trigger-monthly"}
                onClick={() => handleTriggerTasks("monthly")}
              >
                Run Monthly Tasks
              </Button>
            </Space>

            {/* Task Results */}
            {taskResults.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Kết quả:</Text>
                <List
                  size="small"
                  dataSource={taskResults}
                  renderItem={(item) => (
                    <List.Item>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Space>
                          {item.success ? (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          ) : (
                            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                          )}
                          <Text>{item.task}</Text>
                        </Space>
                        <Space>
                          <Tag color={item.success ? "success" : "error"}>
                            {item.success ? "Success" : "Failed"}
                          </Tag>
                          <Text type="secondary">{item.duration}ms</Text>
                        </Space>
                      </Space>
                      {item.error && (
                        <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                          Error: {item.error}
                        </Text>
                      )}
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>

          {/* Generate Report */}
          <Card title="Generate SEO Report" style={{ marginTop: 16 }}>
            <Space wrap>
              <Button
                icon={<BarChartOutlined />}
                loading={schedulerLoading === "report-daily"}
                onClick={() => handleGenerateReport("daily")}
              >
                Daily Report
              </Button>
              <Button
                icon={<BarChartOutlined />}
                loading={schedulerLoading === "report-weekly"}
                onClick={() => handleGenerateReport("weekly")}
              >
                Weekly Report
              </Button>
              <Button
                icon={<BarChartOutlined />}
                loading={schedulerLoading === "report-monthly"}
                onClick={() => handleGenerateReport("monthly")}
              >
                Monthly Report
              </Button>
            </Space>
          </Card>

          {/* Report Display */}
          {seoReport && (
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>
                    SEO Report ({seoReport.period.charAt(0).toUpperCase() + seoReport.period.slice(1)})
                  </span>
                  <Tag color="blue">{new Date(seoReport.generatedAt).toLocaleString("vi-VN")}</Tag>
                </Space>
              }
              style={{ marginTop: 16 }}
            >
              {/* Summary Stats */}
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8} md={4}>
                  <Statistic title="Total Posts" value={seoReport.summary.totalPosts} />
                </Col>
                <Col xs={12} sm={8} md={4}>
                  <Statistic title="Analyzed" value={seoReport.summary.analyzedPosts} />
                </Col>
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Avg Score"
                    value={seoReport.summary.avgScore}
                    suffix="/100"
                    valueStyle={{ color: getScoreColor(seoReport.summary.avgScore) }}
                  />
                </Col>
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Score Change"
                    value={seoReport.summary.scoreChange}
                    prefix={seoReport.summary.scoreChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    valueStyle={{ color: seoReport.summary.scoreChange >= 0 ? "#52c41a" : "#ff4d4f" }}
                  />
                </Col>
                <Col xs={12} sm={8} md={4}>
                  <Statistic title="Indexed URLs" value={seoReport.summary.indexedUrls} />
                </Col>
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Avg Position"
                    value={seoReport.summary.avgPosition}
                    prefix="#"
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 24 }}>
                {/* Top Performers */}
                <Col xs={24} md={12}>
                  <Card size="small" title={<><CheckCircleOutlined style={{ color: "#52c41a" }} /> Top Performers</>}>
                    {seoReport.topPerformers.length > 0 ? (
                      <List
                        size="small"
                        dataSource={seoReport.topPerformers}
                        renderItem={(item, index) => (
                          <List.Item>
                            <Space>
                              <Tag color="gold">{index + 1}</Tag>
                              <Text ellipsis style={{ maxWidth: 200 }}>{item.title}</Text>
                              <Tag color="success">{item.score}/100</Tag>
                            </Space>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>

                {/* Needs Attention */}
                <Col xs={24} md={12}>
                  <Card size="small" title={<><ExclamationCircleOutlined style={{ color: "#faad14" }} /> Needs Attention</>}>
                    {seoReport.needsAttention.length > 0 ? (
                      <List
                        size="small"
                        dataSource={seoReport.needsAttention}
                        renderItem={(item) => (
                          <List.Item>
                            <div>
                              <Space>
                                <Text ellipsis style={{ maxWidth: 180 }}>{item.title}</Text>
                                <Tag color="warning">{item.score}/100</Tag>
                              </Space>
                              <div>
                                {item.issues.map((issue, i) => (
                                  <Tag key={i} color="default" style={{ marginTop: 4, fontSize: 11 }}>
                                    {issue}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="All posts are in good shape!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Keyword Rankings */}
              {seoReport.keywordRankings.length > 0 && (
                <Card size="small" title="Keyword Rankings" style={{ marginTop: 16 }}>
                  <Table
                    size="small"
                    dataSource={seoReport.keywordRankings}
                    rowKey="keyword"
                    pagination={false}
                    columns={[
                      {
                        title: "Keyword",
                        dataIndex: "keyword",
                        key: "keyword",
                        render: (kw: string) => <Text strong>{kw}</Text>,
                      },
                      {
                        title: "Position",
                        dataIndex: "position",
                        key: "position",
                        width: 100,
                        align: "center" as const,
                        render: (pos: number) => (
                          <Tag color={pos <= 3 ? "gold" : pos <= 10 ? "green" : "default"}>
                            #{pos}
                          </Tag>
                        ),
                      },
                      {
                        title: "Change",
                        dataIndex: "change",
                        key: "change",
                        width: 80,
                        align: "center" as const,
                        render: (change: number) => (
                          <Text style={{ color: change > 0 ? "#52c41a" : change < 0 ? "#ff4d4f" : "#8c8c8c" }}>
                            {change > 0 ? `+${change}` : change}
                          </Text>
                        ),
                      },
                      {
                        title: "Clicks",
                        dataIndex: "clicks",
                        key: "clicks",
                        width: 80,
                        align: "center" as const,
                      },
                      {
                        title: "Impressions",
                        dataIndex: "impressions",
                        key: "impressions",
                        width: 100,
                        align: "center" as const,
                      },
                    ]}
                  />
                </Card>
              )}
            </Card>
          )}

          {/* Schedule Info */}
          <Card title="Schedule Information" style={{ marginTop: 16 }}>
            <List
              size="small"
              dataSource={[
                { task: "Daily Tasks", schedule: "Every day at 2:00 AM", description: "Analyze new posts, sync rankings, check index status" },
                { task: "Weekly Tasks", schedule: "Every Sunday at 3:00 AM", description: "Full SEO audit, broken links check, content freshness" },
                { task: "Monthly Tasks", schedule: "1st of month at 4:00 AM", description: "Comprehensive report, archive old logs, re-analyze low scores" },
                { task: "Hourly Check", schedule: "Every hour", description: "Quick check for new posts to analyze" },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CalendarOutlined style={{ fontSize: 20, color: "#1890ff" }} />}
                    title={<Text strong>{item.task}</Text>}
                    description={
                      <>
                        <Tag color="blue">{item.schedule}</Tag>
                        <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                          {item.description}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>
          <ThunderboltOutlined /> Auto SEO
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchDashboard} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {/* Tabs */}
      <Tabs items={tabItems} />

      {/* Add Keyword Modal */}
      <Modal
        title="Thêm keyword theo dõi"
        open={keywordModalOpen}
        onCancel={() => setKeywordModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTrackKeyword}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="keyword"
            label="Keyword"
            rules={[{ required: true, message: "Vui lòng nhập keyword" }]}
          >
            <Input placeholder="Nhập từ khóa muốn theo dõi" />
          </Form.Item>

          <Form.Item name="targetUrl" label="Target URL">
            <Input placeholder="/bai-viet-muc-tieu/" />
          </Form.Item>

          <Form.Item name="searchVolume" label="Search Volume">
            <InputNumber
              placeholder="Lượng tìm kiếm hàng tháng"
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setKeywordModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Analyze Post Modal */}
      <Modal
        title="Phân tích SEO bài viết"
        open={analyzeModalOpen}
        onCancel={() => {
          setAnalyzeModalOpen(false);
          setSelectedPostId(null);
          setAnalysisResult(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <Form.Item label="Chọn bài viết">
            <Select
              placeholder="Chọn bài viết để phân tích"
              value={selectedPostId}
              onChange={setSelectedPostId}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={posts.map((p) => ({ value: p.id, label: p.title }))}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Button
            type="primary"
            onClick={handleAnalyzePost}
            loading={analyzing}
            disabled={!selectedPostId}
            icon={<SearchOutlined />}
          >
            Phân tích
          </Button>

          {/* Analysis Result */}
          {analysisResult && (
            <div style={{ marginTop: 24 }}>
              <Card size="small" title="Kết quả phân tích">
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <Progress
                        type="circle"
                        percent={analysisResult.overallScore}
                        strokeColor={getScoreColor(analysisResult.overallScore)}
                        size={120}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Điểm tổng</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={16}>
                    <Row gutter={[8, 8]}>
                      {Object.entries(analysisResult.scores).map(([key, value]) => (
                        <Col span={12} key={key}>
                          <Space>
                            <Text>{key}:</Text>
                            <Progress
                              percent={value as number}
                              size="small"
                              style={{ width: 100 }}
                              status={getScoreStatus(value as number) as any}
                            />
                          </Space>
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>

                {/* Content Analysis */}
                <div style={{ marginTop: 16 }}>
                  <Text strong>Phân tích nội dung:</Text>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={6}>
                      <Statistic title="Số từ" value={analysisResult.analysis.wordCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Đoạn văn" value={analysisResult.analysis.paragraphCount} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="H2" value={analysisResult.analysis.headings.h2} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Hình ảnh" value={analysisResult.analysis.images.total} />
                    </Col>
                  </Row>
                </div>

                {/* Suggestions */}
                {analysisResult.suggestions?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Gợi ý cải thiện:</Text>
                    <List
                      size="small"
                      dataSource={analysisResult.suggestions.filter((s: any) => s.type !== "success")}
                      renderItem={(item: any) => (
                        <List.Item>
                          <Space>
                            {item.type === "error" && <ExclamationCircleOutlined style={{ color: "#f5222d" }} />}
                            {item.type === "warning" && <ExclamationCircleOutlined style={{ color: "#faad14" }} />}
                            {item.type === "info" && <ExclamationCircleOutlined style={{ color: "#1890ff" }} />}
                            <Tag>{item.category}</Tag>
                            <Text>{item.message}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

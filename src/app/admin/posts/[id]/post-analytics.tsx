"use client";

import { useEffect, useState } from "react";
import { Card, Statistic, Row, Col, Spin, Typography, Table, Select, Empty } from "antd";
import {
  EyeOutlined,
  ShareAltOutlined,
  QuestionCircleOutlined,
  UnorderedListOutlined,
  TagOutlined,
  LinkOutlined,
  FacebookFilled,
  TwitterOutlined,
  CopyOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { analyticsApi, PostAnalyticsResponse } from "@/lib/api";

const { Text } = Typography;

interface PostAnalyticsProps {
  postId: string;
}

export default function PostAnalytics({ postId }: PostAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PostAnalyticsResponse | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.getPostAnalytics(postId, days);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [postId, days]);

  if (loading) {
    return (
      <Card size="small" style={{ marginBottom: 16, textAlign: "center", padding: 20 }}>
        <Spin />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Empty description="Không có dữ liệu analytics" />
      </Card>
    );
  }

  const { summary } = data;
  const totalShares = summary.shareFacebook + summary.shareTwitter + summary.shareCopyLink;

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Thống kê tương tác</span>
          <Select
            size="small"
            value={days}
            onChange={setDays}
            style={{ width: 120 }}
            options={[
              { value: 7, label: "7 ngày" },
              { value: 30, label: "30 ngày" },
              { value: 90, label: "90 ngày" },
            ]}
          />
        </div>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      {/* Main Stats */}
      <Row gutter={[8, 16]}>
        <Col span={12}>
          <Statistic
            title="Lượt xem"
            value={summary.totalViews}
            prefix={<EyeOutlined />}
            valueStyle={{ fontSize: 20 }}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Unique: {summary.uniqueViews}
          </Text>
        </Col>
        <Col span={12}>
          <Statistic
            title="Chia sẻ"
            value={totalShares}
            prefix={<ShareAltOutlined />}
            valueStyle={{ fontSize: 20, color: "#1890ff" }}
          />
        </Col>
      </Row>

      {/* Share breakdown */}
      {totalShares > 0 && (
        <div style={{ marginTop: 12, padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: "block" }}>
            Chi tiết chia sẻ:
          </Text>
          <Row gutter={8}>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <FacebookFilled style={{ color: "#1877f2", fontSize: 16 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>{summary.shareFacebook}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <TwitterOutlined style={{ color: "#1da1f2", fontSize: 16 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>{summary.shareTwitter}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <CopyOutlined style={{ color: "#666", fontSize: 16 }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>{summary.shareCopyLink}</div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Other interactions */}
      <div style={{ marginTop: 12, padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <QuestionCircleOutlined style={{ color: "#52c41a" }} />
              <Text style={{ fontSize: 12 }}>FAQ clicks:</Text>
              <Text strong>{summary.faqClicks}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <UnorderedListOutlined style={{ color: "#722ed1" }} />
              <Text style={{ fontSize: 12 }}>TOC clicks:</Text>
              <Text strong>{summary.tocClicks}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TagOutlined style={{ color: "#eb2f96" }} />
              <Text style={{ fontSize: 12 }}>Tag clicks:</Text>
              <Text strong>{summary.tagClicks}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LinkOutlined style={{ color: "#fa8c16" }} />
              <Text style={{ fontSize: 12 }}>Related:</Text>
              <Text strong>{summary.relatedPostClicks}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FolderOutlined style={{ color: "#13c2c2" }} />
              <Text style={{ fontSize: 12 }}>Category:</Text>
              <Text strong>{summary.categoryLinkClicks}</Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* FAQ Details */}
      {data.faqDetails && data.faqDetails.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: "block" }}>
            <QuestionCircleOutlined /> FAQ được click nhiều nhất:
          </Text>
          <Table
            dataSource={data.faqDetails.slice(0, 5)}
            columns={[
              {
                title: "Câu hỏi",
                dataIndex: "question",
                key: "question",
                render: (text: string) => (
                  <Text style={{ fontSize: 11 }} ellipsis={{ tooltip: text }}>
                    {text?.substring(0, 40)}...
                  </Text>
                ),
              },
              {
                title: "Clicks",
                dataIndex: "count",
                key: "count",
                width: 60,
                align: "right",
              },
            ]}
            size="small"
            pagination={false}
            rowKey="question"
            style={{ fontSize: 11 }}
          />
        </div>
      )}

      {/* TOC Details */}
      {data.tocDetails && data.tocDetails.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: "block" }}>
            <UnorderedListOutlined /> Mục lục được click nhiều nhất:
          </Text>
          <Table
            dataSource={data.tocDetails.slice(0, 5)}
            columns={[
              {
                title: "Heading",
                dataIndex: "heading",
                key: "heading",
                render: (text: string) => (
                  <Text style={{ fontSize: 11 }} ellipsis={{ tooltip: text }}>
                    {text?.substring(0, 30)}...
                  </Text>
                ),
              },
              {
                title: "Clicks",
                dataIndex: "count",
                key: "count",
                width: 60,
                align: "right",
              },
            ]}
            size="small"
            pagination={false}
            rowKey="anchor"
            style={{ fontSize: 11 }}
          />
        </div>
      )}

      {/* Referrers */}
      {data.referrers && data.referrers.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: "block" }}>
            <LinkOutlined /> Nguồn truy cập:
          </Text>
          <Table
            dataSource={data.referrers.slice(0, 5)}
            columns={[
              {
                title: "URL",
                dataIndex: "url",
                key: "url",
                render: (url: string) => {
                  try {
                    const hostname = new URL(url).hostname;
                    return (
                      <Text style={{ fontSize: 11 }} ellipsis={{ tooltip: url }}>
                        {hostname}
                      </Text>
                    );
                  } catch {
                    return <Text style={{ fontSize: 11 }}>{url?.substring(0, 30)}</Text>;
                  }
                },
              },
              {
                title: "Views",
                dataIndex: "count",
                key: "count",
                width: 60,
                align: "right",
              },
            ]}
            size="small"
            pagination={false}
            rowKey="url"
            style={{ fontSize: 11 }}
          />
        </div>
      )}
    </Card>
  );
}

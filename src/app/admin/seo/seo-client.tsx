"use client";

import { useState } from "react";
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
  Switch,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  GlobalOutlined,
  LinkOutlined,
  RobotOutlined,
  FileSearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Redirect, SitemapConfig, SeoGlobalSettings, seoApi, settingsApi } from "@/lib/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SeoClientProps {
  initialRedirects: Redirect[];
  initialRobotsTxt: string;
  initialSitemapConfig: SitemapConfig;
  initialSeoGlobalSettings: SeoGlobalSettings;
  initialError: string | null;
}

export default function SeoClient({
  initialRedirects,
  initialRobotsTxt,
  initialSitemapConfig,
  initialSeoGlobalSettings,
  initialError,
}: SeoClientProps) {
  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects);
  const [robotsTxt, setRobotsTxt] = useState(initialRobotsTxt);
  const [sitemapConfig, setSitemapConfig] = useState<SitemapConfig>(initialSitemapConfig);
  const [seoGlobal, setSeoGlobal] = useState<SeoGlobalSettings>(initialSeoGlobalSettings);
  const [loading, setLoading] = useState(false);
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [form] = Form.useForm();
  const [robotsForm] = Form.useForm();
  const [sitemapForm] = Form.useForm();
  const [seoForm] = Form.useForm();

  // Fetch redirects
  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const data = await seoApi.getAllRedirects();
      setRedirects(data);
    } catch (e) {
      message.error("Không thể tải redirects");
    } finally {
      setLoading(false);
    }
  };

  // Open redirect modal
  const openRedirectModal = (redirect?: Redirect) => {
    setEditingRedirect(redirect || null);
    form.resetFields();
    if (redirect) {
      form.setFieldsValue({
        fromPath: redirect.fromPath,
        toPath: redirect.toPath,
        statusCode: redirect.statusCode,
        isActive: redirect.isActive,
        note: redirect.note,
      });
    } else {
      form.setFieldsValue({
        statusCode: 301,
        isActive: true,
      });
    }
    setRedirectModalOpen(true);
  };

  // Submit redirect
  const handleRedirectSubmit = async (values: any) => {
    try {
      if (editingRedirect) {
        await seoApi.updateRedirect(editingRedirect.id, values);
        message.success("Cập nhật redirect thành công");
      } else {
        await seoApi.createRedirect(values);
        message.success("Tạo redirect thành công");
      }
      setRedirectModalOpen(false);
      fetchRedirects();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Delete redirect
  const handleDeleteRedirect = async (id: string) => {
    try {
      await seoApi.deleteRedirect(id);
      message.success("Xóa redirect thành công");
      fetchRedirects();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể xóa redirect");
    }
  };

  // Save robots.txt
  const handleSaveRobots = async () => {
    try {
      await seoApi.updateRobotsTxt(robotsTxt);
      message.success("Lưu robots.txt thành công");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Save sitemap config
  const handleSaveSitemap = async (values: any) => {
    try {
      await seoApi.updateSitemapConfig(values);
      setSitemapConfig(values);
      message.success("Lưu sitemap config thành công");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Save SEO global settings
  const handleSaveSeoGlobal = async (values: any) => {
    try {
      await settingsApi.updateSeoGlobalSettings(values);
      setSeoGlobal(values);
      message.success("Lưu SEO settings thành công");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Redirect columns
  const redirectColumns: ColumnsType<Redirect> = [
    {
      title: "Từ URL",
      dataIndex: "fromPath",
      key: "fromPath",
      render: (path) => <Text code>{path}</Text>,
    },
    {
      title: "Đến URL",
      dataIndex: "toPath",
      key: "toPath",
      render: (path) => <Text code>{path}</Text>,
    },
    {
      title: "Status",
      dataIndex: "statusCode",
      key: "statusCode",
      width: 100,
      align: "center",
      render: (code) => <Tag color={code === 301 ? "blue" : "green"}>{code}</Tag>,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>{isActive ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Hits",
      dataIndex: "hitCount",
      key: "hitCount",
      width: 80,
      align: "center",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openRedirectModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa redirect"
            onConfirm={() => handleDeleteRedirect(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "global",
      label: (
        <span>
          <GlobalOutlined /> SEO Global
        </span>
      ),
      children: (
        <Card>
          <Form
            form={seoForm}
            layout="vertical"
            initialValues={seoGlobal}
            onFinish={handleSaveSeoGlobal}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="defaultMetaTitle" label="Default Meta Title">
                  <Input placeholder="Default title cho trang" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="defaultOgImage" label="Default OG Image URL">
                  <Input placeholder="https://example.com/og-image.jpg" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="defaultMetaDescription" label="Default Meta Description">
              <TextArea rows={3} placeholder="Default description cho trang" />
            </Form.Item>

            <Title level={5}>Schema Organization</Title>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name={["schemaOrganization", "name"]} label="Organization Name">
                  <Input placeholder="Tên công ty/tổ chức" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={["schemaOrganization", "url"]} label="Organization URL">
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name={["schemaOrganization", "logo"]} label="Organization Logo URL">
              <Input placeholder="https://example.com/logo.png" />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit">
                Lưu cài đặt SEO
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: "redirects",
      label: (
        <span>
          <LinkOutlined /> Redirects
        </span>
      ),
      children: (
        <Card
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openRedirectModal()}>
              Thêm redirect
            </Button>
          }
        >
          <Table
            columns={redirectColumns}
            dataSource={redirects}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} redirects`,
            }}
            size="middle"
          />
        </Card>
      ),
    },
    {
      key: "robots",
      label: (
        <span>
          <RobotOutlined /> Robots.txt
        </span>
      ),
      children: (
        <Card>
          <TextArea
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            rows={15}
            style={{ fontFamily: "monospace" }}
            placeholder={`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://example.com/sitemap.xml`}
          />
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={handleSaveRobots}>
              Lưu robots.txt
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: "sitemap",
      label: (
        <span>
          <FileSearchOutlined /> Sitemap
        </span>
      ),
      children: (
        <Card>
          <Form
            form={sitemapForm}
            layout="vertical"
            initialValues={sitemapConfig}
            onFinish={handleSaveSitemap}
          >
            <Form.Item name="enabled" label="Bật Sitemap" valuePropName="checked">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="changeFrequency" label="Change Frequency">
                  <Select
                    options={[
                      { value: "always", label: "Always" },
                      { value: "hourly", label: "Hourly" },
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                      { value: "monthly", label: "Monthly" },
                      { value: "yearly", label: "Yearly" },
                      { value: "never", label: "Never" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="priority" label="Default Priority">
                  <InputNumber min={0} max={1} step={0.1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="excludePatterns" label="Exclude Patterns (mỗi pattern một dòng)">
              <TextArea
                rows={4}
                placeholder="/admin/*&#10;/private/*&#10;*.pdf"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Lưu cài đặt Sitemap
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>
          <SettingOutlined /> SEO Center
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchRedirects} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Error */}
      {initialError && (
        <Card style={{ marginBottom: 16, background: "#fff2f0", border: "1px solid #ffccc7" }}>
          <Text type="danger">{initialError}</Text>
        </Card>
      )}

      {/* Tabs */}
      <Tabs items={tabItems} />

      {/* Redirect Modal */}
      <Modal
        title={editingRedirect ? "Sửa redirect" : "Thêm redirect"}
        open={redirectModalOpen}
        onCancel={() => setRedirectModalOpen(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRedirectSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="fromPath"
            label="Từ URL"
            rules={[{ required: true, message: "Vui lòng nhập URL nguồn" }]}
          >
            <Input placeholder="/old-page" addonBefore="/" />
          </Form.Item>

          <Form.Item
            name="toPath"
            label="Đến URL"
            rules={[{ required: true, message: "Vui lòng nhập URL đích" }]}
          >
            <Input placeholder="/new-page hoặc https://..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="statusCode" label="Status Code">
                <Select
                  options={[
                    { value: 301, label: "301 - Permanent" },
                    { value: 302, label: "302 - Temporary" },
                    { value: 307, label: "307 - Temporary (keep method)" },
                    { value: 308, label: "308 - Permanent (keep method)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú cho redirect này" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setRedirectModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingRedirect ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

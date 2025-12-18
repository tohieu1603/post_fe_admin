"use client";

import { useState } from "react";
import {
  Tabs,
  Card,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
  Row,
  Col,
  Upload,
  Space,
} from "antd";
import {
  SettingOutlined,
  GlobalOutlined,
  MailOutlined,
  ApiOutlined,
  UploadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { SiteSettings, EmailSettings, ApiKeySettings, settingsApi } from "@/lib/api";

const { Title, Text } = Typography;

interface SettingsClientProps {
  initialSiteSettings: SiteSettings;
  initialEmailSettings: EmailSettings;
  initialApiKeySettings: ApiKeySettings;
  initialError: string | null;
}

export default function SettingsClient({
  initialSiteSettings,
  initialEmailSettings,
  initialApiKeySettings,
  initialError,
}: SettingsClientProps) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(initialEmailSettings);
  const [apiKeySettings, setApiKeySettings] = useState<ApiKeySettings>(initialApiKeySettings);
  const [saving, setSaving] = useState(false);

  const [siteForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [apiForm] = Form.useForm();

  // Save site settings
  const handleSaveSite = async (values: SiteSettings) => {
    setSaving(true);
    try {
      await settingsApi.updateSiteSettings(values);
      setSiteSettings(values);
      message.success("Lưu cài đặt site thành công");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  // Save email settings
  const handleSaveEmail = async (values: EmailSettings) => {
    setSaving(true);
    try {
      await settingsApi.updateEmailSettings(values);
      setEmailSettings(values);
      message.success("Lưu cài đặt email thành công");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  // Save API key settings
  const handleSaveApiKeys = async (values: ApiKeySettings) => {
    setSaving(true);
    try {
      await settingsApi.updateApiKeySettings(values);
      setApiKeySettings(values);
      message.success("Lưu API keys thành công");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const tabItems = [
    {
      key: "site",
      label: (
        <span>
          <GlobalOutlined /> Cài đặt Site
        </span>
      ),
      children: (
        <Card>
          <Form
            form={siteForm}
            layout="vertical"
            initialValues={siteSettings}
            onFinish={handleSaveSite}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="siteName"
                  label="Tên Website"
                  rules={[{ required: true, message: "Vui lòng nhập tên website" }]}
                >
                  <Input placeholder="My Website" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="siteUrl" label="URL Website">
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="siteDescription" label="Mô tả Website">
              <Input.TextArea rows={3} placeholder="Mô tả ngắn về website của bạn" />
            </Form.Item>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="siteLogo" label="Logo URL">
                  <Input placeholder="https://example.com/logo.png" />
                </Form.Item>
                {siteSettings.siteLogo && (
                  <div style={{ marginBottom: 16 }}>
                    <img src={siteSettings.siteLogo} alt="Logo" style={{ maxHeight: 60 }} />
                  </div>
                )}
              </Col>
              <Col span={12}>
                <Form.Item name="siteFavicon" label="Favicon URL">
                  <Input placeholder="https://example.com/favicon.ico" />
                </Form.Item>
                {siteSettings.siteFavicon && (
                  <div style={{ marginBottom: 16 }}>
                    <img src={siteSettings.siteFavicon} alt="Favicon" style={{ maxHeight: 32 }} />
                  </div>
                )}
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                Lưu cài đặt Site
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: "email",
      label: (
        <span>
          <MailOutlined /> Cài đặt Email
        </span>
      ),
      children: (
        <Card>
          <Form
            form={emailForm}
            layout="vertical"
            initialValues={emailSettings}
            onFinish={handleSaveEmail}
          >
            <Title level={5}>SMTP Settings</Title>
            <Row gutter={24}>
              <Col span={16}>
                <Form.Item name="smtpHost" label="SMTP Host">
                  <Input placeholder="smtp.gmail.com" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="smtpPort" label="SMTP Port">
                  <InputNumber placeholder="587" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="smtpUser" label="SMTP Username">
                  <Input placeholder="your-email@gmail.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="smtpPassword" label="SMTP Password">
                  <Input.Password placeholder="App password hoặc SMTP password" />
                </Form.Item>
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 24 }}>Email Sender</Title>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="fromEmail" label="From Email">
                  <Input placeholder="noreply@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fromName" label="From Name">
                  <Input placeholder="My Website" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24 }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Lưu cài đặt Email
                </Button>
                <Button>Test gửi email</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: "api",
      label: (
        <span>
          <ApiOutlined /> API Keys
        </span>
      ),
      children: (
        <Card>
          <Form
            form={apiForm}
            layout="vertical"
            initialValues={apiKeySettings}
            onFinish={handleSaveApiKeys}
          >
            <Title level={5}>Google Analytics</Title>
            <Form.Item
              name="googleAnalyticsId"
              label="Google Analytics ID"
              help="Ví dụ: G-XXXXXXXXXX hoặc UA-XXXXXXX-X"
            >
              <Input placeholder="G-XXXXXXXXXX" />
            </Form.Item>

            <Title level={5} style={{ marginTop: 24 }}>Google Search Console</Title>
            <Form.Item
              name="googleSearchConsoleId"
              label="Verification ID"
              help="Meta tag content từ Google Search Console"
            >
              <Input placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </Form.Item>

            <Title level={5} style={{ marginTop: 24 }}>Facebook</Title>
            <Form.Item
              name="facebookPixelId"
              label="Facebook Pixel ID"
              help="ID từ Facebook Events Manager"
            >
              <Input placeholder="XXXXXXXXXXXXXXXX" />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                Lưu API Keys
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
          <SettingOutlined /> Settings
        </Title>
      </div>

      {/* Error */}
      {initialError && (
        <Card style={{ marginBottom: 16, background: "#fff2f0", border: "1px solid #ffccc7" }}>
          <Text type="danger">{initialError}</Text>
        </Card>
      )}

      {/* Tabs */}
      <Tabs items={tabItems} />
    </div>
  );
}

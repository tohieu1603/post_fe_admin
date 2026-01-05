"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Space } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import Link from "next/link";
import { authApi } from "@/lib/api";

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LoginForm) => {
    setSubmitting(true);
    try {
      const response = await authApi.login(values);
      localStorage.setItem("managepost_access_token", response.accessToken);
      localStorage.setItem("managepost_refresh_token", response.refreshToken);
      message.success("Đăng nhập thành công!");
      window.location.href = "/admin";
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            ManagePost
          </Title>
          <Text type="secondary">Đăng nhập để quản lý nội dung</Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              icon={<LoginOutlined />}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Space>
              <Text type="secondary">Chưa có tài khoản?</Text>
              <Link href="/auth/register">Đăng ký ngay</Link>
            </Space>
          </div>
        </Form>

        <div
          style={{
            marginTop: 24,
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Default admin: admin@managepost.local / Admin@123
          </Text>
        </div>
      </Card>
    </div>
  );
}

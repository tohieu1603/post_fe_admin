"use client";

import { Card, Row, Col, Typography, Statistic } from "antd";
import {
  FolderOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div>
      <Title level={3}>Trang chủ</Title>
      <Paragraph type="secondary">
        Chào mừng đến với hệ thống quản lý bài viết ManagePost
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Link href="/admin/categories">
            <Card
              hoverable
              style={{ height: "100%" }}
            >
              <Statistic
                title="Danh mục"
                prefix={<FolderOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                Quản lý danh mục bài viết với cấu trúc đa cấp (cha - con)
              </Paragraph>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12}>
          <Link href="/admin/posts">
            <Card
              hoverable
              style={{ height: "100%" }}
            >
              <Statistic
                title="Bài viết"
                prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                Tạo và quản lý bài viết với Markdown editor
              </Paragraph>
            </Card>
          </Link>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={5}>Hướng dẫn sử dụng</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small" type="inner" title={<><FolderOutlined /> Quản lý Danh mục</>}>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Tạo danh mục cha và danh mục con</li>
                <li>Sắp xếp thứ tự hiển thị</li>
                <li>Bật/tắt trạng thái hoạt động</li>
                <li>Slug tự động tạo từ tên</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" type="inner" title={<><EditOutlined /> Quản lý Bài viết</>}>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Soạn thảo nội dung với Markdown</li>
                <li>Phân loại bài viết theo danh mục</li>
                <li>Quản lý trạng thái: Nháp, Xuất bản, Lưu trữ</li>
                <li>Hỗ trợ SEO với meta title/description</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

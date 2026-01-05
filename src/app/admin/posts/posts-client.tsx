"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Typography,
  Input,
  Select,
  Popconfirm,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  EyeOutlined,
  SearchOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Post, Category, PostsResponse, postApi } from "@/lib/api";

const { Title, Text } = Typography;

interface PostsClientProps {
  initialPosts: PostsResponse;
  initialCategories: Category[];
  initialError: string | null;
}

export default function PostsClient({
  initialPosts,
  initialCategories,
  initialError,
}: PostsClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts.data);
  const [pagination, setPagination] = useState(initialPosts.pagination);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const data = await postApi.getAll({
        page,
        limit: 10,
        status: filterStatus || undefined,
        categoryId: filterCategory || undefined,
        search: searchTerm || undefined,
      });
      setPosts(data.data);
      setPagination(data.pagination);
    } catch (e) {
      message.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPosts(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await postApi.delete(id);
      message.success("Xóa bài viết thành công");
      fetchPosts(pagination.page);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể xóa bài viết");
    }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await postApi.updateStatus(postId, newStatus);
      message.success("Cập nhật trạng thái thành công");
      fetchPosts(pagination.page);
    } catch (e) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      draft: { color: "warning", text: "Bản nháp" },
      published: { color: "success", text: "Đã xuất bản" },
      archived: { color: "default", text: "Đã lưu trữ" },
    };
    return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
  };

  const columns: ColumnsType<Post> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Link href={`/admin/posts/${record.id}`}>
            <Text strong style={{ color: "#1890ff" }}>{title}</Text>
          </Link>
          {record.excerpt && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.excerpt.length > 80
                  ? record.excerpt.substring(0, 80) + "..."
                  : record.excerpt}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 180,
      render: (slug) => <Text code copyable={{ text: slug }}>{slug}</Text>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => (
        category ? <Tag color="blue">{category.name}</Tag> : <Text type="secondary">—</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status, record) => (
        <Select
          value={status}
          size="small"
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          options={[
            { value: "draft", label: "Bản nháp" },
            { value: "published", label: "Đã xuất bản" },
            { value: "archived", label: "Đã lưu trữ" },
          ]}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Preview">
            <Link href={`/admin/p/${record.slug}`} target="_blank">
              <Button type="text" size="small" icon={<GlobalOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Link href={`/admin/posts/${record.id}`}>
              <Button type="text" size="small" icon={<EyeOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Sửa">
            <Link href={`/admin/posts/${record.id}/edit`}>
              <Button type="text" size="small" icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Xóa bài viết"
            description="Bạn có chắc muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
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

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>
          <FileTextOutlined /> Quản lý Bài viết
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchPosts(1)} loading={loading}>
            Làm mới
          </Button>
          <Link href="/admin/posts/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm bài viết
            </Button>
          </Link>
        </Space>
      </div>

      {/* Error */}
      {initialError && (
        <Card style={{ marginBottom: 16, background: "#fff2f0", border: "1px solid #ffccc7" }}>
          <Text type="danger">{initialError}</Text>
        </Card>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            value={filterStatus || undefined}
            onChange={(value) => setFilterStatus(value || "")}
            style={{ width: 140 }}
            allowClear
            options={[
              { value: "draft", label: "Bản nháp" },
              { value: "published", label: "Đã xuất bản" },
              { value: "archived", label: "Đã lưu trữ" },
            ]}
          />
          <Select
            placeholder="Danh mục"
            value={filterCategory || undefined}
            onChange={(value) => setFilterCategory(value || "")}
            style={{ width: 200 }}
            allowClear
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name,
            }))}
          />
          <Button type="primary" onClick={handleSearch}>
            Lọc
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} bài viết`,
            onChange: (page) => fetchPosts(page),
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}

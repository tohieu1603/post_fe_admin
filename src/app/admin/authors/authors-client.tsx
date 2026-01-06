"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Avatar,
  Row,
  Col,
  Tabs,
  Divider,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  UploadOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  GithubOutlined,
  YoutubeOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Author, AuthorsResponse, authorApi, mediaApi } from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";
import AuthorFormModal from "./author-form-modal";

const { Title, Text } = Typography;

interface AuthorsClientProps {
  initialAuthors: AuthorsResponse;
  initialError: string | null;
}

export default function AuthorsClient({
  initialAuthors,
  initialError,
}: AuthorsClientProps) {
  const [authorsData, setAuthorsData] = useState<AuthorsResponse>(initialAuthors);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(undefined);
  const [filterFeatured, setFilterFeatured] = useState<boolean | undefined>(undefined);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
  });

  // Fetch authors
  const fetchAuthors = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }) => {
    setLoading(true);
    try {
      const result = await authorApi.getAll({
        page: params?.page || pagination.current || 1,
        limit: params?.limit || pagination.pageSize || 20,
        search: params?.search ?? searchText,
        isActive: params?.isActive ?? filterStatus,
        isFeatured: params?.isFeatured ?? filterFeatured,
      });
      setAuthorsData(result);
    } catch (e) {
      message.error("Không thể tải danh sách tác giả");
    } finally {
      setLoading(false);
    }
  };

  // Search debounced
  const debouncedSearch = useDebouncedCallback((value: string) => {
    fetchAuthors({ page: 1, search: value });
  }, 300);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  // Handle filter change
  const handleFilterChange = (
    status?: boolean,
    featured?: boolean
  ) => {
    setFilterStatus(status);
    setFilterFeatured(featured);
    fetchAuthors({
      page: 1,
      isActive: status,
      isFeatured: featured,
    });
  };

  // Handle table change
  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination(pag);
    fetchAuthors({
      page: pag.current,
      limit: pag.pageSize,
    });
  };

  // Open modal for create/edit
  const openModal = (author?: Author) => {
    setEditingAuthor(author || null);
    setModalOpen(true);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingAuthor(null);
    fetchAuthors();
  };

  // Delete author
  const handleDelete = async (id: string) => {
    try {
      await authorApi.delete(id);
      message.success("Xóa tác giả thành công");
      fetchAuthors();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể xóa tác giả");
    }
  };

  // Toggle active
  const handleToggleActive = async (id: string) => {
    try {
      await authorApi.toggleActive(id);
      message.success("Cập nhật trạng thái thành công");
      fetchAuthors();
    } catch (e) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (id: string) => {
    try {
      await authorApi.toggleFeatured(id);
      message.success("Cập nhật nổi bật thành công");
      fetchAuthors();
    } catch (e) {
      message.error("Không thể cập nhật nổi bật");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText("");
    setFilterStatus(undefined);
    setFilterFeatured(undefined);
    fetchAuthors({ page: 1, search: "", isActive: undefined, isFeatured: undefined });
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Table columns
  const columns: ColumnsType<Author> = [
    {
      title: "Tác giả",
      key: "author",
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatarUrl}
            icon={<UserOutlined />}
            size={48}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              <a onClick={() => openModal(record)}>{record.name}</a>
              {record.isFeatured && (
                <StarFilled style={{ color: "#faad14", marginLeft: 8 }} />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.jobTitle || "Chưa có chức danh"}
              {record.company && ` @ ${record.company}`}
            </Text>
          </div>
        </Space>
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
      title: "Chuyên môn",
      dataIndex: "expertise",
      key: "expertise",
      width: 200,
      render: (expertise: string[]) =>
        expertise && expertise.length > 0 ? (
          <Space wrap size={4}>
            {expertise.slice(0, 3).map((tag) => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
            {expertise.length > 3 && (
              <Tag>+{expertise.length - 3}</Tag>
            )}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Bài viết",
      dataIndex: "postsCount",
      key: "postsCount",
      width: 90,
      align: "center",
      render: (count) => count || 0,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          size="small"
          onChange={() => handleToggleActive(record.id)}
        />
      ),
    },
    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      width: 90,
      align: "center",
      render: (isFeatured, record) => (
        <Button
          type="text"
          icon={isFeatured ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
          onClick={() => handleToggleFeatured(record.id)}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      render: (date) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tác giả"
            description="Bạn có chắc muốn xóa tác giả này?"
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

  const isFiltering = searchText || filterStatus !== undefined || filterFeatured !== undefined;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>
          <UserOutlined /> Quản lý Tác giả (E-E-A-T)
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchAuthors()} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm tác giả
          </Button>
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
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Input
                placeholder="Tìm kiếm tên, bio..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                placeholder="Trạng thái"
                value={filterStatus}
                onChange={(v) => handleFilterChange(v, filterFeatured)}
                style={{ width: 140 }}
                allowClear
                options={[
                  { value: true, label: "Hoạt động" },
                  { value: false, label: "Ẩn" },
                ]}
              />
              <Select
                placeholder="Nổi bật"
                value={filterFeatured}
                onChange={(v) => handleFilterChange(filterStatus, v)}
                style={{ width: 140 }}
                allowClear
                options={[
                  { value: true, label: "Nổi bật" },
                  { value: false, label: "Không nổi bật" },
                ]}
              />
              {isFiltering && (
                <Button onClick={clearFilters} type="link">
                  Xóa bộ lọc
                </Button>
              )}
            </Space>
          </Col>
          <Col>
            <Text type="secondary">
              Tổng: {authorsData.total} tác giả
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={authorsData.data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: authorsData.page,
            pageSize: authorsData.limit,
            total: authorsData.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} tác giả`,
          }}
          onChange={handleTableChange}
          size="middle"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <AuthorFormModal
        open={modalOpen}
        author={editingAuthor}
        onClose={() => {
          setModalOpen(false);
          setEditingAuthor(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

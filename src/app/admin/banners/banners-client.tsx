"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Tooltip,
  Image,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
} from "antd";
import {
  PictureOutlined,
  SyncOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  FireOutlined,
  EyeOutlined,
  SelectOutlined,
  ReloadOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Banner, BannerPosition, BannerStatistics, TrendingSyncResult, Post } from "@/lib/api";
import { bannerApi, postApi } from "@/lib/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const positionLabels: Record<BannerPosition, string> = {
  hero: "Hero (Trang chủ)",
  sidebar: "Sidebar",
  category: "Danh mục",
  footer: "Footer",
};

const positionColors: Record<BannerPosition, string> = {
  hero: "volcano",
  sidebar: "blue",
  category: "green",
  footer: "purple",
};

export default function BannersClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [statistics, setStatistics] = useState<BannerStatistics | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<TrendingSyncResult | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [form] = Form.useForm();

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, statsRes] = await Promise.all([
        bannerApi.getAll({ limit: 100 }),
        bannerApi.getStatistics(),
      ]);
      setBanners(bannersRes.data);
      setStatistics(statsRes);
    } catch (err) {
      message.error("Không thể tải dữ liệu banner");
    } finally {
      setLoading(false);
    }
  };

  // Load posts for dropdown
  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await postApi.getAll({ status: "published", limit: 100 });
      setPosts(res.data);
    } catch {
      // Ignore
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync trending banners
  const handleSyncTrending = async () => {
    setSyncLoading(true);
    try {
      const result = await bannerApi.syncTrending({ topCount: 10 });
      setLastSyncResult(result);
      message.success(`Đồng bộ xong: +${result.created} mới, ${result.updated} cập nhật, -${result.removed} xóa`);
      loadData();
    } catch (err) {
      message.error("Không thể đồng bộ trending");
    } finally {
      setSyncLoading(false);
    }
  };

  // Delete banner
  const handleDelete = async (id: string) => {
    try {
      await bannerApi.delete(id);
      message.success("Đã xóa banner");
      loadData();
    } catch {
      message.error("Không thể xóa banner");
    }
  };

  // Open create/edit modal
  const openModal = (banner?: Banner) => {
    setEditingBanner(banner || null);
    loadPosts();
    if (banner) {
      form.setFieldsValue({
        postId: banner.postId,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        position: banner.position,
        sortOrder: banner.sortOrder,
        status: banner.status,
        startDate: banner.startDate ? dayjs(banner.startDate) : null,
        endDate: banner.endDate ? dayjs(banner.endDate) : null,
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  // Save banner
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.startDate?.toISOString() || null,
        endDate: values.endDate?.toISOString() || null,
      };

      if (editingBanner) {
        await bannerApi.update(editingBanner.id, data);
        message.success("Đã cập nhật banner");
      } else {
        await bannerApi.create(data);
        message.success("Đã tạo banner");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  // Table columns
  const columns: ColumnsType<Banner> = [
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "image",
      width: 120,
      render: (url: string) => (
        <Image
          src={url}
          alt="Banner"
          width={100}
          height={60}
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgewaE="
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: Banner) => (
        <div>
          <Text strong style={{ display: "block" }}>{title}</Text>
          {record.subtitle && (
            <Text type="secondary" style={{ fontSize: 12 }}>{record.subtitle}</Text>
          )}
        </div>
      ),
    },
    {
      title: "Danh mục",
      key: "category",
      width: 140,
      render: (_: unknown, record: Banner) => {
        const categoryName = record.post?.categoryId
          ? (record.post as { categoryId?: { name?: string } }).categoryId?.name
          : null;
        return categoryName ? (
          <Tag color="cyan" icon={<FolderOutlined />}>
            {categoryName}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      width: 140,
      render: (position: BannerPosition) => (
        <Tag color={positionColors[position]}>{positionLabels[position]}</Tag>
      ),
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      align: "center",
      render: (rank: number, record: Banner) => (
        record.isAutoAssigned ? (
          <Tag color="volcano" icon={<FireOutlined />}>
            #{rank}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: "Loại",
      key: "type",
      width: 100,
      render: (_: unknown, record: Banner) => (
        record.isAutoAssigned ? (
          <Tag color="orange">Auto</Tag>
        ) : (
          <Tag color="blue">Thủ công</Tag>
        )
      ),
    },
    {
      title: "Thống kê",
      key: "stats",
      width: 140,
      render: (_: unknown, record: Banner) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            <EyeOutlined style={{ marginRight: 4 }} />
            {record.viewCount?.toLocaleString() || 0} views
          </Text>
          <Text style={{ fontSize: 12 }}>
            <SelectOutlined style={{ marginRight: 4 }} />
            {record.clickCount?.toLocaleString() || 0} clicks
          </Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: "green",
          inactive: "default",
          scheduled: "blue",
        };
        const labels: Record<string, string> = {
          active: "Hoạt động",
          inactive: "Tạm dừng",
          scheduled: "Đặt lịch",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_: unknown, record: Banner) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa banner này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <PictureOutlined /> Quản lý Banner
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng Banner"
              value={statistics?.total || 0}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hero"
              value={statistics?.byPosition.hero || 0}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Auto (Trending)"
              value={statistics?.autoAssigned || 0}
              valueStyle={{ color: "#faad14" }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Thủ công"
              value={statistics?.manual || 0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<EditOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<SyncOutlined spin={syncLoading} />}
            onClick={handleSyncTrending}
            loading={syncLoading}
          >
            Đồng bộ Trending (Top 10)
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm Banner thủ công
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            Làm mới
          </Button>
        </Space>

        {lastSyncResult && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">
              Lần đồng bộ gần nhất: +{lastSyncResult.created} mới, {lastSyncResult.updated} cập nhật, -{lastSyncResult.removed} xóa
            </Text>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={banners}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingBanner ? "Sửa Banner" : "Thêm Banner"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editingBanner ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="postId"
            label="Bài viết"
            rules={[{ required: true, message: "Vui lòng chọn bài viết" }]}
          >
            <Select
              placeholder="Chọn bài viết"
              showSearch
              loading={postsLoading}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={posts.map((p) => ({
                value: p.id,
                label: p.title,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="Tự động lấy từ bài viết nếu bỏ trống" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subtitle" label="Tiêu đề phụ">
                <Input placeholder="Tiêu đề phụ (tùy chọn)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="imageUrl" label="URL Hình ảnh">
            <Input placeholder="Tự động lấy cover image từ bài viết nếu bỏ trống" />
          </Form.Item>

          <Form.Item name="linkUrl" label="URL Link">
            <Input placeholder="Tự động tạo từ slug bài viết nếu bỏ trống" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Vị trí"
                initialValue="hero"
              >
                <Select
                  options={[
                    { value: "hero", label: "Hero (Trang chủ)" },
                    { value: "sidebar", label: "Sidebar" },
                    { value: "category", label: "Danh mục" },
                    { value: "footer", label: "Footer" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="active"
              >
                <Select
                  options={[
                    { value: "active", label: "Hoạt động" },
                    { value: "inactive", label: "Tạm dừng" },
                    { value: "scheduled", label: "Đặt lịch" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sortOrder" label="Thứ tự" initialValue={0}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker style={{ width: "100%" }} showTime />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker style={{ width: "100%" }} showTime />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

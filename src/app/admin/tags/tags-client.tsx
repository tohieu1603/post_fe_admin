"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Tag as AntTag,
  Modal,
  Form,
  Input,
  ColorPicker,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Select,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TagOutlined,
  SearchOutlined,
  MergeCellsOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Tag, tagApi } from "@/lib/api";

const { Title, Text } = Typography;

interface TagsClientProps {
  initialTags: Tag[];
  initialError: string | null;
}

export default function TagsClient({ initialTags, initialError }: TagsClientProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();
  const [mergeForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Filtered data
  const filteredTags = useMemo(() => {
    if (!searchText) return tags;
    const search = searchText.toLowerCase();
    return tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(search) ||
        tag.slug.toLowerCase().includes(search)
    );
  }, [tags, searchText]);

  // Fetch tags
  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await tagApi.getAll();
      setTags(data);
    } catch (e) {
      message.error("Không thể tải tags");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for create/edit
  const openModal = (tag?: Tag) => {
    setEditingTag(tag || null);
    form.resetFields();
    if (tag) {
      form.setFieldsValue({
        name: tag.name,
        slug: tag.slug,
        color: tag.color || "#1890ff",
      });
    } else {
      form.setFieldsValue({
        color: "#1890ff",
      });
    }
    setModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        color: typeof values.color === "string" ? values.color : values.color?.toHexString?.() || values.color,
      };

      if (editingTag) {
        await tagApi.update(editingTag.id, data);
        message.success("Cập nhật tag thành công");
      } else {
        await tagApi.create(data);
        message.success("Tạo tag thành công");
      }
      setModalOpen(false);
      fetchTags();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Delete tag
  const handleDelete = async (id: string) => {
    try {
      await tagApi.delete(id);
      message.success("Xóa tag thành công");
      fetchTags();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể xóa tag");
    }
  };

  // Merge tags
  const handleMerge = async (values: { sourceId: string; targetId: string }) => {
    try {
      await tagApi.merge(values.sourceId, values.targetId);
      message.success("Merge tags thành công");
      setMergeModalOpen(false);
      mergeForm.resetFields();
      fetchTags();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể merge tags");
    }
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
  const columns: ColumnsType<Tag> = [
    {
      title: "Tag",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <AntTag color={record.color || "#1890ff"}>{name}</AntTag>
        </Space>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 200,
      render: (slug) => <Text code copyable={{ text: slug }}>{slug}</Text>,
    },
    {
      title: "Số bài viết",
      dataIndex: "postCount",
      key: "postCount",
      width: 120,
      align: "center",
      sorter: (a, b) => (a.postCount || 0) - (b.postCount || 0),
      render: (count) => <AntTag>{count || 0}</AntTag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
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
            title="Xóa tag"
            description="Bạn có chắc muốn xóa tag này?"
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
          <TagOutlined /> Quản lý Tags
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTags} loading={loading}>
            Làm mới
          </Button>
          <Button icon={<MergeCellsOutlined />} onClick={() => setMergeModalOpen(true)}>
            Merge Tags
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm tag
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
            <Input
              placeholder="Tìm kiếm tên, slug..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Col>
          <Col>
            <Text type="secondary">Tổng: {filteredTags.length} tags</Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTags}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} tags`,
          }}
          size="middle"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTag ? "Sửa tag" : "Thêm tag"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Tên tag"
            rules={[{ required: true, message: "Vui lòng nhập tên tag" }]}
          >
            <Input placeholder="Nhập tên tag" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            tooltip="Để trống sẽ tự động tạo từ tên"
          >
            <Input placeholder="Tự động tạo từ tên" addonBefore="/" />
          </Form.Item>

          <Form.Item name="color" label="Màu sắc">
            <ColorPicker showText format="hex" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTag ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Merge Modal */}
      <Modal
        title="Merge Tags"
        open={mergeModalOpen}
        onCancel={() => {
          setMergeModalOpen(false);
          mergeForm.resetFields();
        }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={mergeForm}
          layout="vertical"
          onFinish={handleMerge}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="sourceId"
            label="Tag nguồn (sẽ bị xóa)"
            rules={[{ required: true, message: "Vui lòng chọn tag nguồn" }]}
          >
            <Select
              placeholder="Chọn tag sẽ bị xóa"
              showSearch
              optionFilterProp="label"
              options={tags.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="targetId"
            label="Tag đích (giữ lại)"
            rules={[{ required: true, message: "Vui lòng chọn tag đích" }]}
          >
            <Select
              placeholder="Chọn tag sẽ giữ lại"
              showSearch
              optionFilterProp="label"
              options={tags.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </Form.Item>

          <Text type="secondary">
            Tất cả bài viết có tag nguồn sẽ được chuyển sang tag đích. Tag nguồn sẽ bị xóa.
          </Text>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setMergeModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Merge
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

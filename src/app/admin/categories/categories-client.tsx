"use client";

import { useState, useMemo, useCallback } from "react";
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
  TreeSelect,
  Select,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Descriptions,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FolderOutlined,
  SearchOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Category, categoryApi } from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CategoriesClientProps {
  initialCategories: Category[];
  initialTreeCategories: Category[];
  initialError: string | null;
}

// Convert tree to table data with children
const buildTableTreeData = (categories: Category[]): any[] => {
  return categories.map((cat) => ({
    ...cat,
    key: cat.id,
    children: cat.children && cat.children.length > 0
      ? buildTableTreeData(cat.children)
      : undefined,
  }));
};

export default function CategoriesClient({
  initialCategories,
  initialTreeCategories,
  initialError,
}: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [treeCategories, setTreeCategories] = useState<Category[]>(initialTreeCategories);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [detailCategory, setDetailCategory] = useState<Category | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterParent, setFilterParent] = useState<string | undefined>(undefined);

  // Build tree table data
  const tableData = useMemo(() => {
    return buildTableTreeData(treeCategories);
  }, [treeCategories]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = categories;

    if (searchText) {
      const search = searchText.toLowerCase();
      data = data.filter(
        (cat) =>
          cat.name.toLowerCase().includes(search) ||
          cat.slug.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== undefined) {
      data = data.filter((cat) => cat.isActive === (filterStatus === "active"));
    }

    if (filterParent === "root") {
      data = data.filter((cat) => !cat.parentId);
    } else if (filterParent) {
      data = data.filter((cat) => cat.parentId === filterParent);
    }

    return data;
  }, [categories, searchText, filterStatus, filterParent]);

  // Check if using filters (show flat list) or tree view
  const isFiltering = searchText || filterStatus !== undefined || filterParent;

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [cats, treeCats] = await Promise.all([
        categoryApi.getAll(),
        categoryApi.getTree(),
      ]);
      setCategories(cats);
      setTreeCategories(treeCats);
    } catch (e) {
      message.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  // Build tree data for TreeSelect
  const buildTreeSelectData = (cats: Category[], excludeId?: string): any[] => {
    return cats
      .filter((c) => c.id !== excludeId)
      .map((cat) => ({
        value: cat.id,
        title: cat.name,
        children: cat.children ? buildTreeSelectData(cat.children, excludeId) : [],
      }));
  };

  // Auto-generate slug from name (debounced)
  const generateSlugFromName = useDebouncedCallback(async (name: string) => {
    if (!name || slugManuallyEdited) return;

    setGeneratingSlug(true);
    try {
      const result = await categoryApi.generateSlug(name);
      form.setFieldValue("slug", result.slug);
    } catch (e) {
      // Ignore error, user can enter manually
    } finally {
      setGeneratingSlug(false);
    }
  }, 300);

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    generateSlugFromName(name);
  };

  // Handle slug change (mark as manually edited)
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSlugManuallyEdited(true);
    }
  };

  // Open modal for create/edit
  const openModal = (category?: Category, parentId?: string) => {
    setEditingCategory(category || null);
    setSlugManuallyEdited(!!category); // If editing, don't auto-gen slug
    form.resetFields();
    if (category) {
      form.setFieldsValue({
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else if (parentId) {
      form.setFieldsValue({
        parentId,
        sortOrder: 0,
        isActive: true,
      });
    } else {
      form.setFieldsValue({
        sortOrder: 0,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, values);
        message.success("Cập nhật danh mục thành công");
      } else {
        await categoryApi.create(values);
        message.success("Tạo danh mục thành công");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    try {
      await categoryApi.delete(id);
      message.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể xóa danh mục");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText("");
    setFilterStatus(undefined);
    setFilterParent(undefined);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get parent name
  const getParentName = (parentId: string | null): string => {
    if (!parentId) return "—";
    const parent = categories.find((c) => c.id === parentId);
    return parent?.name || "—";
  };

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <FolderOutlined style={{ color: record.parentId ? "#52c41a" : "#1890ff" }} />
          <a
            onClick={() => {
              setDetailCategory(record);
              setDetailModalOpen(true);
            }}
            style={{ fontWeight: record.parentId ? "normal" : 500 }}
          >
            {name}
          </a>
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
      title: "Thứ tự",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 100,
      align: "center",
      sorter: (a, b) => a.sortOrder - b.sortOrder,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Thêm con">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => openModal(undefined, record.id)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc muốn xóa?"
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

  // Add parent column when filtering
  if (isFiltering) {
    columns.splice(2, 0, {
      title: "Danh mục cha",
      dataIndex: "parentId",
      key: "parentId",
      width: 150,
      render: (parentId) => {
        const parentName = getParentName(parentId);
        return parentName !== "—" ? (
          <Tag color="blue">{parentName}</Tag>
        ) : (
          <Text type="secondary">Gốc</Text>
        );
      },
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>
          <FolderOutlined /> Quản lý Danh mục
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm danh mục
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
                placeholder="Tìm kiếm tên, slug..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                placeholder="Trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 140 }}
                allowClear
                options={[
                  { value: "active", label: "Hoạt động" },
                  { value: "inactive", label: "Ẩn" },
                ]}
              />
              <Select
                placeholder="Danh mục cha"
                value={filterParent}
                onChange={setFilterParent}
                style={{ width: 180 }}
                allowClear
                options={[
                  { value: "root", label: "Chỉ danh mục gốc" },
                  ...categories
                    .filter((c) => !c.parentId)
                    .map((c) => ({ value: c.id, label: c.name })),
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
              {isFiltering
                ? `Đang lọc: ${filteredData.length} kết quả`
                : `Tổng: ${categories.length} danh mục`}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={isFiltering ? filteredData : tableData}
          rowKey="id"
          loading={loading}
          expandable={!isFiltering ? {
            defaultExpandAllRows: true,
            indentSize: 24,
          } : undefined}
          pagination={isFiltering ? {
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} danh mục`,
          } : false}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
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
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input
              placeholder="Nhập tên danh mục"
              onChange={handleNameChange}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label={
              <Space>
                <span>Slug</span>
                <LinkOutlined />
                {generatingSlug && <Text type="secondary">(đang tạo...)</Text>}
              </Space>
            }
            tooltip="Tự động tạo từ tên, hoặc nhập thủ công"
          >
            <Input
              placeholder="Tự động tạo từ tên"
              onChange={handleSlugChange}
              addonBefore="/"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả danh mục (tùy chọn)" />
          </Form.Item>

          <Form.Item name="parentId" label="Danh mục cha">
            <TreeSelect
              treeData={buildTreeSelectData(treeCategories, editingCategory?.id)}
              placeholder="Chọn danh mục cha (để trống = danh mục gốc)"
              allowClear
              treeDefaultExpandAll
              showSearch
              treeNodeFilterProp="title"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sortOrder" label="Thứ tự sắp xếp">
                <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết danh mục"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalOpen(false);
              if (detailCategory) openModal(detailCategory);
            }}
          >
            Sửa
          </Button>,
        ]}
        width={600}
      >
        {detailCategory && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">
              <Text copyable>{detailCategory.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên">{detailCategory.name}</Descriptions.Item>
            <Descriptions.Item label="Slug">
              <Text code copyable>{detailCategory.slug}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {detailCategory.description || <Text type="secondary">Không có</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục cha">
              {getParentName(detailCategory.parentId) !== "—" ? (
                <Tag color="blue">{getParentName(detailCategory.parentId)}</Tag>
              ) : (
                <Text type="secondary">Danh mục gốc</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Thứ tự">{detailCategory.sortOrder}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailCategory.isActive ? "success" : "default"}>
                {detailCategory.isActive ? "Hoạt động" : "Ẩn"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(detailCategory.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDate(detailCategory.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

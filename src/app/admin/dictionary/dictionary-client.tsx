"use client";

import { useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  ReloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { dictionaryApi, DictionaryTerm, DictionaryResponse } from "@/lib/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DictionaryClientProps {
  initialData: DictionaryResponse;
  initialError: string | null;
}

export default function DictionaryClient({ initialData, initialError }: DictionaryClientProps) {
  const router = useRouter();
  const [data, setData] = useState<DictionaryTerm[]>(initialData?.data || []);
  const [pagination, setPagination] = useState(initialData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<DictionaryTerm | null>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = useCallback(async (page = 1, search = searchText) => {
    setLoading(true);
    try {
      const response = await dictionaryApi.getAll({ page, limit: 20, search });
      setData(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  // Handle search
  const handleSearch = () => {
    fetchData(1, searchText);
  };

  // Open modal for create/edit
  const openModal = (term?: DictionaryTerm) => {
    setEditingTerm(term || null);
    if (term) {
      form.setFieldsValue({
        ...term,
        examples: term.examples?.join("\n") || "",
        relatedTerms: term.relatedTerms?.join(", ") || "",
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Parse arrays
      const payload = {
        ...values,
        examples: values.examples ? values.examples.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
        relatedTerms: values.relatedTerms ? values.relatedTerms.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      };

      if (editingTerm) {
        await dictionaryApi.update(editingTerm.id, payload);
        message.success("Cập nhật thành công");
      } else {
        await dictionaryApi.create(payload);
        message.success("Tạo mới thành công");
      }

      setIsModalOpen(false);
      fetchData(pagination.page);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await dictionaryApi.delete(id);
      message.success("Xóa thành công");
      fetchData(pagination.page);
    } catch (error) {
      message.error("Không thể xóa");
    }
  };

  // Generate slug
  const handleGenerateSlug = async () => {
    const term = form.getFieldValue("term");
    if (!term) {
      message.warning("Vui lòng nhập thuật ngữ trước");
      return;
    }
    try {
      const { slug } = await dictionaryApi.generateSlug(term);
      form.setFieldsValue({ slug });
    } catch (error) {
      message.error("Không thể tạo slug");
    }
  };

  // Table columns
  const columns: ColumnsType<DictionaryTerm> = [
    {
      title: "Thuật ngữ",
      dataIndex: "term",
      key: "term",
      width: 220,
      render: (text, record) => (
        <Space
          style={{ cursor: "pointer" }}
          onClick={() => router.push(`/admin/dictionary/${record.id}`)}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "linear-gradient(135deg, #8b1538 0%, #a91d3a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {text.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong>{text}</Text>
            {record.synonym && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>Đồng nghĩa: {record.synonym}</Text>
              </>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Định nghĩa",
      dataIndex: "definition",
      key: "definition",
      ellipsis: true,
    },
    {
      title: "Từ liên quan",
      dataIndex: "relatedTerms",
      key: "relatedTerms",
      width: 200,
      render: (terms: string[]) => (
        <Space wrap size={2}>
          {terms?.slice(0, 2).map((t) => (
            <Tag key={t} color="blue">{t}</Tag>
          ))}
          {terms?.length > 2 && <Tag>+{terms.length - 2}</Tag>}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={() => router.push(`/admin/dictionary/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (initialError) {
    return (
      <Card>
        <Text type="danger">{initialError}</Text>
        <Button onClick={() => fetchData(1)} style={{ marginLeft: 16 }}>
          Thử lại
        </Button>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Space>
            <BookOutlined style={{ fontSize: 24 }} />
            <Title level={4} style={{ margin: 0 }}>Từ điển thuật ngữ</Title>
            <Badge count={pagination.total} style={{ backgroundColor: "#52c41a" }} />
          </Space>
          <Space>
            <Input
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(1)}>
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Thêm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} thuật ngữ`,
            onChange: (page) => fetchData(page),
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTerm ? "Sửa thuật ngữ" : "Thêm thuật ngữ mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        okText={editingTerm ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="term"
              label="Thuật ngữ"
              rules={[{ required: true, message: "Vui lòng nhập thuật ngữ" }]}
            >
              <Input placeholder="Ví dụ: AI" />
            </Form.Item>

            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ required: true, message: "Vui lòng nhập slug" }]}
            >
              <Input
                placeholder="ai"
                addonAfter={
                  <Button type="link" size="small" onClick={handleGenerateSlug} style={{ margin: -7 }}>
                    Tạo tự động
                  </Button>
                }
              />
            </Form.Item>
          </div>

          <Form.Item name="synonym" label="Đồng nghĩa">
            <Input placeholder="Ví dụ: Trí tuệ nhân tạo" />
          </Form.Item>

          <Form.Item
            name="definition"
            label="Định nghĩa"
            rules={[{ required: true, message: "Vui lòng nhập định nghĩa" }]}
          >
            <TextArea rows={2} placeholder="Định nghĩa ngắn gọn về thuật ngữ" maxLength={1000} showCount />
          </Form.Item>

          <Form.Item name="description" label="Giải thích chi tiết">
            <TextArea rows={4} placeholder="Giải thích chi tiết về thuật ngữ" />
          </Form.Item>

          <Form.Item name="examples" label="Ví dụ minh họa (mỗi dòng một ví dụ)">
            <TextArea rows={3} placeholder="ChatGPT là một ứng dụng AI chatbot phổ biến" />
          </Form.Item>

          <Form.Item name="relatedTerms" label="Thuật ngữ liên quan (cách nhau bởi dấu phẩy)">
            <Input placeholder="Machine Learning, Deep Learning, LLM" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

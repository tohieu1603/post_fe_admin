"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Typography,
  Empty,
  Spin,
  Collapse,
  Tooltip,
  Upload,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  GlobalOutlined,
  UploadOutlined,
  FileAddOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { pageContentApi, PageContent } from "@/lib/api";
import { SectionEditorModal } from "@/components/section-editor";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PagesPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Upload JSON modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"create" | "update">("create");
  const [uploadPageSlug, setUploadPageSlug] = useState("");
  const [uploadJson, setUploadJson] = useState("");
  const [uploadPageName, setUploadPageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section editor states
  const [sectionEditorOpen, setSectionEditorOpen] = useState(false);
  const [editingSectionKey, setEditingSectionKey] = useState("");
  const [editingSectionHtml, setEditingSectionHtml] = useState("");
  const [editingSectionPageSlug, setEditingSectionPageSlug] = useState("");

  const [form] = Form.useForm();

  // Load pages list
  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await pageContentApi.getAll(false);
      setPages(data);
    } catch {
      message.error("Không thể tải danh sách trang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Handle edit page JSON
  const handleEditPage = (page: PageContent) => {
    setEditingPage(page);
    form.setFieldsValue({
      pageName: page.pageName,
      content: JSON.stringify(page.content, null, 2),
      isActive: page.isActive,
    });
    setEditModalOpen(true);
  };

  // Handle save page JSON
  const handleSavePage = async () => {
    try {
      const values = await form.validateFields();
      if (!editingPage) return;

      let content;
      try {
        content = JSON.parse(values.content);
      } catch {
        message.error("JSON không hợp lệ");
        return;
      }

      await pageContentApi.update(editingPage.pageSlug, {
        pageName: values.pageName,
        content,
        isActive: values.isActive,
      });

      message.success("Đã cập nhật trang");
      setEditModalOpen(false);
      loadPages();
    } catch {
      message.error("Lỗi khi cập nhật");
    }
  };

  // Handle upload JSON - open modal for new page
  const handleOpenUploadModal = () => {
    setUploadMode("create");
    setUploadPageSlug("");
    setUploadPageName("");
    setUploadJson("");
    setUploadModalOpen(true);
  };

  // Handle update JSON - open modal for existing page
  const handleOpenUpdateModal = (page: PageContent) => {
    setUploadMode("update");
    setUploadPageSlug(page.pageSlug);
    setUploadPageName(page.pageName);
    setUploadJson("");
    setUploadModalOpen(true);
  };

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      message.error("Vui lòng chọn file JSON");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content); // Validate JSON
        setUploadJson(content);
        message.success(`Đã đọc file: ${file.name}`);

        // Auto set page name from file name if creating new
        if (uploadMode === "create" && !uploadPageName) {
          const nameFromFile = file.name.replace(".json", "").replace(/-/g, " ");
          setUploadPageName(nameFromFile.charAt(0).toUpperCase() + nameFromFile.slice(1));
        }
      } catch {
        message.error("File JSON không hợp lệ");
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle upload/update submit
  const handleUploadSubmit = async () => {
    if (!uploadJson) {
      message.error("Vui lòng upload file JSON hoặc paste nội dung JSON");
      return;
    }

    if (uploadMode === "create" && !uploadPageSlug) {
      message.error("Vui lòng nhập Page Slug");
      return;
    }

    if (uploadMode === "create" && !uploadPageName) {
      message.error("Vui lòng nhập tên trang");
      return;
    }

    let content;
    try {
      content = JSON.parse(uploadJson);
    } catch {
      message.error("JSON không hợp lệ");
      return;
    }

    try {
      if (uploadMode === "create") {
        // Create new page
        await pageContentApi.upsert(uploadPageSlug, {
          pageName: uploadPageName,
          content,
          isActive: true,
        });
        message.success(`Đã tạo trang: ${uploadPageSlug}`);
      } else {
        // Update existing page
        await pageContentApi.update(uploadPageSlug, {
          content,
        });
        message.success(`Đã cập nhật JSON cho trang: ${uploadPageSlug}`);
      }

      setUploadModalOpen(false);
      loadPages();
    } catch {
      message.error("Lỗi khi lưu trang");
    }
  };

  // Handle edit section
  const handleEditSection = (page: PageContent, sectionKey: string) => {
    const section = page.content[sectionKey];
    if (!section?.html) {
      message.error("Section không có HTML content");
      return;
    }
    setEditingSectionPageSlug(page.pageSlug);
    setEditingSectionKey(sectionKey);
    setEditingSectionHtml(section.html);
    setSectionEditorOpen(true);
  };

  // Handle save section
  const handleSaveSection = async (sectionKey: string, newHtml: string) => {
    try {
      const page = pages.find((p) => p.pageSlug === editingSectionPageSlug);
      if (!page) return;

      const updatedContent = {
        ...page.content,
        [sectionKey]: {
          ...page.content[sectionKey],
          html: newHtml,
        },
      };

      await pageContentApi.update(page.pageSlug, {
        content: updatedContent,
      });

      setSectionEditorOpen(false);
      loadPages();
    } catch {
      message.error("Lỗi khi lưu section");
    }
  };

  // Handle toggle active
  const handleToggleActive = async (page: PageContent) => {
    try {
      await pageContentApi.toggleActive(page.pageSlug);
      message.success(page.isActive ? "Đã ẩn trang" : "Đã hiện trang");
      loadPages();
    } catch {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Handle delete
  const handleDelete = async (page: PageContent) => {
    try {
      await pageContentApi.delete(page.pageSlug);
      message.success("Đã xóa trang");
      loadPages();
    } catch {
      message.error("Lỗi khi xóa trang");
    }
  };

  // Handle preview section
  const handlePreviewSection = (sectionKey: string, html: string) => {
    setPreviewTitle(`Preview: ${sectionKey}`);
    setPreviewHtml(html);
    setPreviewModalOpen(true);
  };

  // Handle preview full page
  const handlePreviewFullPage = (page: PageContent) => {
    const sections = page.content;
    const sectionOrder = [
      "header",
      "hero",
      "tableOfContents",
      "benefits",
      "features",
      "standards",
      "pricing",
      "process",
      "contact",
      "footer",
    ];

    const combinedHtml = sectionOrder
      .filter((key) => sections[key]?.html)
      .map((key) => sections[key].html)
      .join("\n");

    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.pageName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --primary: #2563eb;
      --primary-light: #dbeafe;
      --primary-dark: #1d4ed8;
      --secondary: #f59e0b;
      --secondary-dark: #d97706;
      --accent: #10b981;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
    }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
    .btn-primary {
      background: var(--primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      display: inline-block;
      text-decoration: none;
    }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-secondary {
      background: var(--secondary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      display: inline-block;
      text-decoration: none;
    }
    .card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-800);
      position: relative;
    }
    .section-title::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background: var(--primary);
      margin-top: 1rem;
    }
    .section-title.centered::after {
      margin-left: auto;
      margin-right: auto;
    }
    .icon-circle {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-light);
      color: var(--primary);
    }
    .price-tag {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
    }
    .pricing-highlight {
      border: 2px solid var(--primary);
      position: relative;
    }
    .pricing-highlight::before {
      content: 'Phổ biến';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: white;
      padding: 0.25rem 1rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--gray-200);
      border-radius: 0.5rem;
      font-size: 1rem;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }
  </style>
</head>
<body class="bg-white">
${combinedHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const columns = [
    {
      title: "Page Slug",
      dataIndex: "pageSlug",
      key: "pageSlug",
      width: 250,
      render: (slug: string) => <Text code>{slug}</Text>,
    },
    {
      title: "Tên trang",
      dataIndex: "pageName",
      key: "pageName",
    },
    {
      title: "Sections",
      dataIndex: "content",
      key: "content",
      width: 100,
      render: (content: Record<string, unknown>) => (
        <Tag color="blue">{Object.keys(content).length} sections</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean, record: PageContent) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Hiện"
          unCheckedChildren="Ẩn"
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 280,
      render: (_: unknown, record: PageContent) => (
        <Space size="small">
          <Tooltip title="Preview Web">
            <Button
              type="primary"
              icon={<GlobalOutlined />}
              onClick={() => handlePreviewFullPage(record)}
            >
              Preview
            </Button>
          </Tooltip>
          <Tooltip title="Update JSON">
            <Button
              icon={<SyncOutlined />}
              onClick={() => handleOpenUpdateModal(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa JSON">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditPage(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa trang này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Expandable row to show sections with Edit buttons
  const expandedRowRender = (record: PageContent) => {
    const sections = record.content;
    const sectionKeys = Object.keys(sections);

    return (
      <div style={{ padding: "12px 0" }}>
        <Text strong style={{ marginBottom: 12, display: "block" }}>
          Các sections ({sectionKeys.length}):
        </Text>
        <Space wrap size={[8, 8]}>
          {sectionKeys.map((key) => (
            <Card
              key={key}
              size="small"
              style={{ width: 180 }}
              styles={{ body: { padding: "8px 12px" } }}
            >
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13 }}>{key}</Text>
              </div>
              <Space size={4}>
                <Tooltip title="Xem preview">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreviewSection(key, sections[key].html)}
                  />
                </Tooltip>
                <Tooltip title="Chỉnh sửa section">
                  <Button
                    size="small"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEditSection(record, key)}
                  >
                    Sửa
                  </Button>
                </Tooltip>
              </Space>
            </Card>
          ))}
        </Space>
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Quản lý Page Content
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={handleOpenUploadModal}
          >
            Upload JSON
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadPages}>
            Tải lại
          </Button>
        </Space>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : pages.length === 0 ? (
          <Empty description="Chưa có trang nào. Hãy upload JSON để tạo trang mới.">
            <Button type="primary" onClick={handleOpenUploadModal}>
              Upload JSON ngay
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={pages}
            rowKey="_id"
            loading={loading}
            pagination={false}
            size="middle"
            expandable={{
              expandedRowRender,
              rowExpandable: (record) =>
                Object.keys(record.content).length > 0,
            }}
          />
        )}
      </Card>

      {/* Upload/Update JSON Modal */}
      <Modal
        title={uploadMode === "create" ? "Upload JSON - Tạo trang mới" : `Update JSON - ${uploadPageSlug}`}
        open={uploadModalOpen}
        onOk={handleUploadSubmit}
        onCancel={() => setUploadModalOpen(false)}
        width={800}
        okText={uploadMode === "create" ? "Tạo trang" : "Cập nhật"}
        cancelText="Hủy"
      >
        {/* Hidden file input */}
        <input
          type="file"
          accept=".json"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileSelect}
        />

        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Upload button */}
          <div>
            <Button
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
              size="large"
              style={{ width: "100%" }}
            >
              Chọn file JSON từ máy tính
            </Button>
          </div>

          <Divider>hoặc paste JSON trực tiếp</Divider>

          {/* Slug input - only for create mode */}
          {uploadMode === "create" && (
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Page Slug <Text type="danger">*</Text>
              </Text>
              <Input
                placeholder="vd: thiet-ke-website-doanh-nghiep"
                value={uploadPageSlug}
                onChange={(e) => setUploadPageSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Slug dùng để định danh trang, chỉ gồm chữ thường, số và dấu gạch ngang
              </Text>
            </div>
          )}

          {/* Page name - only for create mode */}
          {uploadMode === "create" && (
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Tên trang <Text type="danger">*</Text>
              </Text>
              <Input
                placeholder="vd: Thiết kế website doanh nghiệp"
                value={uploadPageName}
                onChange={(e) => setUploadPageName(e.target.value)}
              />
            </div>
          )}

          {/* JSON content */}
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Nội dung JSON {uploadJson && <Tag color="green">Đã có nội dung</Tag>}
            </Text>
            <TextArea
              rows={15}
              placeholder='{"header": {"id": "header", "html": "..."}, ...}'
              value={uploadJson}
              onChange={(e) => setUploadJson(e.target.value)}
              style={{ fontFamily: "monospace", fontSize: 11 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Edit Page JSON Modal */}
      <Modal
        title={`Sửa trang: ${editingPage?.pageSlug}`}
        open={editModalOpen}
        onOk={handleSavePage}
        onCancel={() => setEditModalOpen(false)}
        width={1000}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="pageName"
            label="Tên trang"
            rules={[{ required: true, message: "Vui lòng nhập tên trang" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="content"
            label="JSON Content"
            rules={[{ required: true, message: "Vui lòng nhập JSON content" }]}
          >
            <TextArea
              rows={20}
              style={{ fontFamily: "monospace", fontSize: 11 }}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Section Modal */}
      <Modal
        title={previewTitle}
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={1200}
      >
        <Collapse
          items={[
            {
              key: "source",
              label: "Xem mã nguồn HTML",
              children: (
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 16,
                    borderRadius: 8,
                    overflow: "auto",
                    maxHeight: 300,
                    fontSize: 11,
                  }}
                >
                  {previewHtml}
                </pre>
              ),
            },
          ]}
          style={{ marginBottom: 16 }}
        />
        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            padding: 16,
            minHeight: 200,
            maxHeight: 500,
            overflow: "auto",
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Modal>

      {/* Section Editor Modal */}
      <SectionEditorModal
        open={sectionEditorOpen}
        sectionKey={editingSectionKey}
        sectionHtml={editingSectionHtml}
        onSave={handleSaveSection}
        onCancel={() => setSectionEditorOpen(false)}
      />
    </div>
  );
}

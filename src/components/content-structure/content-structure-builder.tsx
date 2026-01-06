"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  List,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Rate,
  Collapse,
  Tooltip,
  message,
  Empty,
  Spin,
  Divider,
  Row,
  Col,
  Badge,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  FileTextOutlined,
  PictureOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  TableOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  CodeOutlined,
  Html5Outlined,
  SyncOutlined,
  EyeOutlined,
  SaveOutlined,
  DragOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import type {
  ContentStructure,
  ContentSection,
  SectionType,
  TocItem,
  FaqItem,
  ReviewBlock,
} from "@/lib/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Extended ContentStructure for legacy section-based builder
interface LegacyContentStructure extends ContentStructure {
  sections?: ContentSection[];
  estimatedReadTime?: number;
  lastStructureUpdate?: string;
}

interface ContentStructureBuilderProps {
  postId: string;
  structure: LegacyContentStructure | null;
  onStructureChange: (structure: LegacyContentStructure) => void;
  onSave?: (structure: LegacyContentStructure, updateContent?: boolean) => Promise<void>;
  loading?: boolean;
}

// Section type configurations
const SECTION_TYPES: { type: SectionType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "heading", label: "Heading", icon: <FontSizeOutlined />, color: "blue" },
  { type: "paragraph", label: "Đoạn văn", icon: <FileTextOutlined />, color: "default" },
  { type: "image", label: "Hình ảnh", icon: <PictureOutlined />, color: "green" },
  { type: "list", label: "Danh sách", icon: <UnorderedListOutlined />, color: "cyan" },
  { type: "table", label: "Bảng", icon: <TableOutlined />, color: "purple" },
  { type: "faq", label: "FAQ", icon: <QuestionCircleOutlined />, color: "orange" },
  { type: "review", label: "Đánh giá", icon: <StarOutlined />, color: "gold" },
  { type: "quote", label: "Trích dẫn", icon: <FileTextOutlined />, color: "magenta" },
  { type: "code", label: "Code", icon: <CodeOutlined />, color: "geekblue" },
  { type: "html", label: "HTML", icon: <Html5Outlined />, color: "red" },
];

export default function ContentStructureBuilder({
  postId,
  structure,
  onStructureChange,
  onSave,
  loading = false,
}: ContentStructureBuilderProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [selectedType, setSelectedType] = useState<SectionType>("heading");
  const [afterSectionId, setAfterSectionId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (editingSection) {
      form.setFieldsValue({
        type: editingSection.type,
        level: editingSection.level,
        text: editingSection.text,
        content: editingSection.content,
        language: editingSection.language,
        imageUrl: editingSection.image?.url,
        imageAlt: editingSection.image?.alt,
        imageCaption: editingSection.image?.caption,
        listType: editingSection.list?.type,
        listItems: editingSection.list?.items?.join("\n"),
        tableHeaders: editingSection.table?.headers?.join(","),
        tableRows: editingSection.table?.rows?.map(r => r.join(",")).join("\n"),
        faqs: editingSection.faqs,
        reviewProvider: editingSection.review?.provider,
        reviewRating: editingSection.review?.rating,
        reviewSummary: editingSection.review?.summary,
        reviewPros: editingSection.review?.pros?.join("\n"),
        reviewCons: editingSection.review?.cons?.join("\n"),
      });
    }
  }, [editingSection, form]);

  // Add new section
  const handleAddSection = (values: any) => {
    const newSection: Partial<ContentSection> = {
      type: selectedType,
    };

    switch (selectedType) {
      case "heading":
        newSection.level = values.level || 2;
        newSection.text = values.text;
        break;
      case "paragraph":
      case "quote":
        newSection.content = values.content;
        break;
      case "code":
        newSection.content = values.content;
        newSection.language = values.language || "text";
        break;
      case "html":
        newSection.content = values.content;
        break;
      case "image":
        newSection.image = {
          url: values.imageUrl,
          alt: values.imageAlt || "",
          caption: values.imageCaption,
        };
        break;
      case "list":
        newSection.list = {
          type: values.listType || "unordered",
          items: values.listItems?.split("\n").filter((i: string) => i.trim()) || [],
        };
        break;
      case "table":
        newSection.table = {
          headers: values.tableHeaders?.split(",").map((h: string) => h.trim()) || [],
          rows: values.tableRows?.split("\n").map((r: string) => r.split(",").map((c: string) => c.trim())) || [],
        };
        break;
      case "faq":
        newSection.faqs = values.faqs || [];
        break;
      case "review":
        newSection.review = {
          provider: values.reviewProvider,
          rating: values.reviewRating || 0,
          summary: values.reviewSummary,
          pros: values.reviewPros?.split("\n").filter((p: string) => p.trim()) || [],
          cons: values.reviewCons?.split("\n").filter((c: string) => c.trim()) || [],
        };
        break;
    }

    // Add to structure
    const sections = [...(structure?.sections || [])];
    const newSectionFull: ContentSection = {
      ...newSection,
      id: `temp-${Date.now()}`,
      order: sections.length,
    } as ContentSection;

    if (afterSectionId) {
      const index = sections.findIndex(s => s.id === afterSectionId);
      if (index !== -1) {
        sections.splice(index + 1, 0, newSectionFull);
      } else {
        sections.push(newSectionFull);
      }
    } else {
      sections.push(newSectionFull);
    }

    // Recalculate orders
    sections.forEach((s, i) => { s.order = i; });

    // Update TOC
    const toc = buildToc(sections);

    onStructureChange({
      ...structure,
      sections,
      toc,
      lastStructureUpdate: new Date().toISOString(),
    } as ContentStructure);

    setAddModalOpen(false);
    form.resetFields();
    message.success("Đã thêm section!");
  };

  // Update section
  const handleUpdateSection = (values: any) => {
    if (!editingSection || !structure) return;

    const updatedSection: ContentSection = { ...editingSection };

    switch (editingSection.type) {
      case "heading":
        updatedSection.level = values.level;
        updatedSection.text = values.text;
        break;
      case "paragraph":
      case "quote":
        updatedSection.content = values.content;
        break;
      case "code":
        updatedSection.content = values.content;
        updatedSection.language = values.language;
        break;
      case "html":
        updatedSection.content = values.content;
        break;
      case "image":
        updatedSection.image = {
          url: values.imageUrl,
          alt: values.imageAlt || "",
          caption: values.imageCaption,
        };
        break;
      case "list":
        updatedSection.list = {
          type: values.listType,
          items: values.listItems?.split("\n").filter((i: string) => i.trim()) || [],
        };
        break;
      case "table":
        updatedSection.table = {
          headers: values.tableHeaders?.split(",").map((h: string) => h.trim()) || [],
          rows: values.tableRows?.split("\n").map((r: string) => r.split(",").map((c: string) => c.trim())) || [],
        };
        break;
      case "faq":
        updatedSection.faqs = values.faqs || [];
        break;
      case "review":
        updatedSection.review = {
          provider: values.reviewProvider,
          rating: values.reviewRating || 0,
          summary: values.reviewSummary,
          pros: values.reviewPros?.split("\n").filter((p: string) => p.trim()) || [],
          cons: values.reviewCons?.split("\n").filter((c: string) => c.trim()) || [],
        };
        break;
    }

    const sections = (structure.sections || []).map(s =>
      s.id === editingSection.id ? updatedSection : s
    );

    const toc = buildToc(sections);

    onStructureChange({
      ...structure,
      sections,
      toc,
      lastStructureUpdate: new Date().toISOString(),
    });

    setEditModalOpen(false);
    setEditingSection(null);
    form.resetFields();
    message.success("Đã cập nhật section!");
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    if (!structure) return;

    const sections = (structure.sections || []).filter(s => s.id !== sectionId);
    sections.forEach((s, i) => { s.order = i; });

    const toc = buildToc(sections);

    onStructureChange({
      ...structure,
      sections,
      toc,
      lastStructureUpdate: new Date().toISOString(),
    });

    message.success("Đã xóa section!");
  };

  // Build TOC from sections
  const buildToc = (sections: ContentSection[]): TocItem[] => {
    return sections
      .filter(s => s.type === "heading" && s.level && s.level >= 2)
      .map(s => ({
        id: s.id,
        text: s.text || "",
        level: s.level!,
        anchor: generateAnchor(s.text || ""),
      }));
  };

  // Generate anchor from text
  const generateAnchor = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  };

  // Get section label
  const getSectionLabel = (section: ContentSection): string => {
    switch (section.type) {
      case "heading":
        return `H${section.level}: ${section.text?.substring(0, 50)}...`;
      case "paragraph":
        return section.content?.substring(0, 50) + "..." || "Đoạn văn";
      case "image":
        return section.image?.alt || section.image?.url?.split("/").pop() || "Hình ảnh";
      case "list":
        return `${section.list?.type === "ordered" ? "OL" : "UL"}: ${section.list?.items?.length || 0} items`;
      case "table":
        return `Bảng: ${section.table?.headers?.length || 0} cột, ${section.table?.rows?.length || 0} hàng`;
      case "faq":
        return `FAQ: ${section.faqs?.length || 0} câu hỏi`;
      case "review":
        return `Review: ${section.review?.provider} (${section.review?.rating}/5)`;
      case "quote":
        return section.content?.substring(0, 40) + "..." || "Trích dẫn";
      case "code":
        return `Code (${section.language || "text"})`;
      case "html":
        return "HTML Block";
      default:
        return section.type;
    }
  };

  // Get section type config
  const getSectionTypeConfig = (type: SectionType) => {
    return SECTION_TYPES.find(t => t.type === type) || SECTION_TYPES[0];
  };

  // Render section form fields based on type
  const renderSectionFormFields = (type: SectionType) => {
    switch (type) {
      case "heading":
        return (
          <>
            <Form.Item name="level" label="Level" rules={[{ required: true }]}>
              <Select>
                <Select.Option value={1}>H1</Select.Option>
                <Select.Option value={2}>H2</Select.Option>
                <Select.Option value={3}>H3</Select.Option>
                <Select.Option value={4}>H4</Select.Option>
                <Select.Option value={5}>H5</Select.Option>
                <Select.Option value={6}>H6</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="text" label="Nội dung" rules={[{ required: true }]}>
              <Input placeholder="Tiêu đề heading" />
            </Form.Item>
          </>
        );

      case "paragraph":
      case "quote":
        return (
          <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Nhập nội dung..." />
          </Form.Item>
        );

      case "code":
        return (
          <>
            <Form.Item name="language" label="Ngôn ngữ">
              <Select placeholder="Chọn ngôn ngữ">
                <Select.Option value="javascript">JavaScript</Select.Option>
                <Select.Option value="typescript">TypeScript</Select.Option>
                <Select.Option value="python">Python</Select.Option>
                <Select.Option value="html">HTML</Select.Option>
                <Select.Option value="css">CSS</Select.Option>
                <Select.Option value="json">JSON</Select.Option>
                <Select.Option value="bash">Bash</Select.Option>
                <Select.Option value="sql">SQL</Select.Option>
                <Select.Option value="text">Text</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="content" label="Code" rules={[{ required: true }]}>
              <TextArea rows={6} placeholder="Nhập code..." style={{ fontFamily: "monospace" }} />
            </Form.Item>
          </>
        );

      case "html":
        return (
          <Form.Item name="content" label="HTML" rules={[{ required: true }]}>
            <TextArea rows={6} placeholder="Nhập HTML..." style={{ fontFamily: "monospace" }} />
          </Form.Item>
        );

      case "image":
        return (
          <>
            <Form.Item name="imageUrl" label="URL ảnh" rules={[{ required: true }]}>
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item name="imageAlt" label="Alt text">
              <Input placeholder="Mô tả ảnh" />
            </Form.Item>
            <Form.Item name="imageCaption" label="Caption">
              <Input placeholder="Chú thích ảnh" />
            </Form.Item>
          </>
        );

      case "list":
        return (
          <>
            <Form.Item name="listType" label="Kiểu danh sách">
              <Select defaultValue="unordered">
                <Select.Option value="unordered">Không thứ tự (•)</Select.Option>
                <Select.Option value="ordered">Có thứ tự (1, 2, 3)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="listItems" label="Các mục (mỗi dòng 1 mục)" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="Mục 1\nMục 2\nMục 3" />
            </Form.Item>
          </>
        );

      case "table":
        return (
          <>
            <Form.Item name="tableHeaders" label="Headers (cách nhau bởi dấu ,)" rules={[{ required: true }]}>
              <Input placeholder="Cột 1, Cột 2, Cột 3" />
            </Form.Item>
            <Form.Item name="tableRows" label="Dữ liệu (mỗi dòng 1 hàng, các cột cách nhau bởi dấu ,)">
              <TextArea rows={4} placeholder="Giá trị 1, Giá trị 2, Giá trị 3\nGiá trị 4, Giá trị 5, Giá trị 6" />
            </Form.Item>
          </>
        );

      case "faq":
        return (
          <Form.List name="faqs" initialValue={[{ question: "", answer: "" }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 8 }}>
                    <Form.Item {...restField} name={[name, "question"]} label="Câu hỏi">
                      <Input placeholder="Câu hỏi?" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "answer"]} label="Trả lời">
                      <TextArea rows={2} placeholder="Trả lời..." />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(name)} icon={<DeleteOutlined />}>
                      Xóa FAQ
                    </Button>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm FAQ
                </Button>
              </>
            )}
          </Form.List>
        );

      case "review":
        return (
          <>
            <Form.Item name="reviewProvider" label="Tên nhà cung cấp" rules={[{ required: true }]}>
              <Input placeholder="VD: Hostinger, Cloudways..." />
            </Form.Item>
            <Form.Item name="reviewRating" label="Đánh giá">
              <Rate allowHalf />
            </Form.Item>
            <Form.Item name="reviewSummary" label="Tóm tắt">
              <TextArea rows={2} placeholder="Nhận xét tổng quan..." />
            </Form.Item>
            <Form.Item name="reviewPros" label="Ưu điểm (mỗi dòng 1 ưu điểm)">
              <TextArea rows={3} placeholder="Ưu điểm 1\nƯu điểm 2" />
            </Form.Item>
            <Form.Item name="reviewCons" label="Nhược điểm (mỗi dòng 1 nhược điểm)">
              <TextArea rows={3} placeholder="Nhược điểm 1\nNhược điểm 2" />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  const sections = structure?.sections || [];
  const toc = structure?.toc || [];

  return (
    <div>
      {/* Header */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Content Structure</Text>
              <Badge count={sections.length} style={{ backgroundColor: "#1890ff" }} />
              {structure?.wordCount && (
                <Tag>{structure.wordCount} từ</Tag>
              )}
              {structure?.estimatedReadTime && (
                <Tag>~{structure.estimatedReadTime} phút đọc</Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<EyeOutlined />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? "Builder" : "Preview"}
              </Button>
              {onSave && (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => structure && onSave(structure)}
                >
                  Lưu Structure
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* TOC Preview */}
        <Col xs={24} md={6}>
          <Card title="Mục lục" size="small">
            {toc.length > 0 ? (
              <List
                size="small"
                dataSource={toc}
                renderItem={(item) => (
                  <List.Item style={{ paddingLeft: (item.level - 2) * 16 }}>
                    <Text type={item.level === 2 ? undefined : "secondary"}>
                      {item.text}
                    </Text>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Chưa có heading" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* Sections */}
        <Col xs={24} md={18}>
          {previewMode ? (
            // Preview Mode
            <Card title="Preview" size="small">
              <StructurePreview structure={structure} />
            </Card>
          ) : (
            // Builder Mode
            <Card
              title="Sections"
              size="small"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setAfterSectionId(undefined);
                    setAddModalOpen(true);
                  }}
                >
                  Thêm Section
                </Button>
              }
            >
              {sections.length > 0 ? (
                <List
                  dataSource={sections}
                  renderItem={(section) => {
                    const typeConfig = getSectionTypeConfig(section.type);
                    return (
                      <List.Item
                        actions={[
                          <Tooltip title="Thêm sau" key="add">
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => {
                                setAfterSectionId(section.id);
                                setAddModalOpen(true);
                              }}
                            />
                          </Tooltip>,
                          <Tooltip title="Sửa" key="edit">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => {
                                setEditingSection(section);
                                setEditModalOpen(true);
                              }}
                            />
                          </Tooltip>,
                          <Tooltip title="Xóa" key="delete">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteSection(section.id)}
                            />
                          </Tooltip>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Tag color={typeConfig.color} icon={typeConfig.icon}>
                              {typeConfig.label}
                            </Tag>
                          }
                          title={getSectionLabel(section)}
                        />
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty description="Chưa có section nào">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddModalOpen(true)}
                  >
                    Thêm Section đầu tiên
                  </Button>
                </Empty>
              )}
            </Card>
          )}
        </Col>
      </Row>

      {/* Add Section Modal */}
      <Modal
        title="Thêm Section mới"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Chọn loại section:</Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap>
              {SECTION_TYPES.map((t) => (
                <Tag
                  key={t.type}
                  color={selectedType === t.type ? t.color : "default"}
                  icon={t.icon}
                  style={{ cursor: "pointer", padding: "4px 8px" }}
                  onClick={() => {
                    setSelectedType(t.type);
                    form.resetFields();
                  }}
                >
                  {t.label}
                </Tag>
              ))}
            </Space>
          </div>
        </div>

        <Divider />

        <Form form={form} layout="vertical" onFinish={handleAddSection}>
          {renderSectionFormFields(selectedType)}

          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
              <Button onClick={() => setAddModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Section Modal */}
      <Modal
        title="Sửa Section"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingSection(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {editingSection && (
          <Form form={form} layout="vertical" onFinish={handleUpdateSection}>
            <Tag color={getSectionTypeConfig(editingSection.type).color} style={{ marginBottom: 16 }}>
              {getSectionTypeConfig(editingSection.type).label}
            </Tag>

            {renderSectionFormFields(editingSection.type)}

            <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
                <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

// Structure Preview Component
function StructurePreview({ structure }: { structure: LegacyContentStructure | null }) {
  if (!structure || !structure.sections || structure.sections.length === 0) {
    return <Empty description="Chưa có nội dung" />;
  }

  return (
    <div className="structure-preview">
      {structure.sections
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div key={section.id} style={{ marginBottom: 16 }}>
            {renderSectionPreview(section)}
          </div>
        ))}
    </div>
  );
}

function renderSectionPreview(section: ContentSection) {
  switch (section.type) {
    case "heading":
      const level = section.level || 2;
      const HeadingComponent = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : level === 4 ? "h4" : level === 5 ? "h5" : "h6";
      return React.createElement(HeadingComponent, { id: section.anchor }, section.text);

    case "paragraph":
      return <Paragraph>{section.content}</Paragraph>;

    case "quote":
      return (
        <blockquote style={{ borderLeft: "4px solid #1890ff", paddingLeft: 16, margin: "16px 0", color: "#666" }}>
          {section.content}
        </blockquote>
      );

    case "code":
      return (
        <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4, overflow: "auto" }}>
          <code>{section.content}</code>
        </pre>
      );

    case "html":
      return <div dangerouslySetInnerHTML={{ __html: section.content || "" }} />;

    case "image":
      return (
        <figure style={{ textAlign: "center" }}>
          <img
            src={section.image?.url}
            alt={section.image?.alt}
            style={{ maxWidth: "100%", height: "auto" }}
          />
          {section.image?.caption && (
            <figcaption style={{ color: "#666", marginTop: 8 }}>
              {section.image.caption}
            </figcaption>
          )}
        </figure>
      );

    case "list":
      const ListTag = section.list?.type === "ordered" ? "ol" : "ul";
      return (
        <ListTag>
          {section.list?.items?.map((item, i) => <li key={i}>{item}</li>)}
        </ListTag>
      );

    case "table":
      return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {section.table?.headers && section.table.headers.length > 0 && (
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i} style={{ border: "1px solid #ddd", padding: 8, background: "#f5f5f5" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {section.table?.rows?.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ border: "1px solid #ddd", padding: 8 }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "faq":
      return (
        <Collapse>
          {section.faqs?.map((faq, i) => (
            <Collapse.Panel header={faq.question} key={i}>
              <p>{faq.answer}</p>
            </Collapse.Panel>
          ))}
        </Collapse>
      );

    case "review":
      return (
        <Card size="small" title={section.review?.provider}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Rate disabled value={section.review?.rating} allowHalf />
            {section.review?.summary && <Paragraph>{section.review.summary}</Paragraph>}
            {section.review?.pros && section.review.pros.length > 0 && (
              <div>
                <Text strong style={{ color: "green" }}>Ưu điểm:</Text>
                <ul>
                  {section.review.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            {section.review?.cons && section.review.cons.length > 0 && (
              <div>
                <Text strong style={{ color: "red" }}>Nhược điểm:</Text>
                <ul>
                  {section.review.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </Space>
        </Card>
      );

    default:
      return <div>Unknown section type: {section.type}</div>;
  }
}

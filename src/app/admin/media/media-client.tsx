"use client";

import { useState, useRef } from "react";
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Typography,
  Tooltip,
  Row,
  Col,
  Image,
  Pagination,
  Select,
  Spin,
  Empty,
  Descriptions,
  List,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PictureOutlined,
  SearchOutlined,
  UploadOutlined,
  FileOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  EyeOutlined,
  CopyOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Media, MediaListResponse, mediaApi, aiSeoApi } from "@/lib/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface MediaClientProps {
  initialMedia: MediaListResponse;
  initialError: string | null;
}

// Format file size
const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Get icon by mime type
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <PictureOutlined style={{ fontSize: 32, color: "#1890ff" }} />;
  if (mimeType.startsWith("video/")) return <VideoCameraOutlined style={{ fontSize: 32, color: "#52c41a" }} />;
  if (mimeType.startsWith("audio/")) return <SoundOutlined style={{ fontSize: 32, color: "#722ed1" }} />;
  return <FileOutlined style={{ fontSize: 32, color: "#8c8c8c" }} />;
};

export default function MediaClient({ initialMedia, initialError }: MediaClientProps) {
  const [mediaList, setMediaList] = useState<Media[]>(initialMedia.data);
  const [pagination, setPagination] = useState(initialMedia.pagination);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [generatingAlt, setGeneratingAlt] = useState(false);

  // Fetch media
  const fetchMedia = async (page = 1) => {
    setLoading(true);
    try {
      const data = await mediaApi.getAll({
        page,
        limit: 20,
        search: searchText || undefined,
        mimeType: filterType,
      });
      // Debug: log first item to check id field
      if (data.data.length > 0) {
        console.log('Media item:', data.data[0]);
        console.log('Has id:', 'id' in data.data[0], data.data[0].id);
      }
      setMediaList(data.data);
      setPagination(data.pagination);
    } catch (e) {
      message.error("Không thể tải media");
    } finally {
      setLoading(false);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn file để upload");
      return;
    }

    setUploading(true);
    try {
      for (const file of fileList) {
        if (file.originFileObj) {
          await mediaApi.upload(file.originFileObj);
        }
      }
      message.success(`Upload ${fileList.length} file thành công`);
      setUploadModalOpen(false);
      setFileList([]);
      fetchMedia();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  // Open edit modal
  const openEditModal = (media: Media) => {
    setSelectedMedia(media);
    form.setFieldsValue({
      title: media.title,
      altText: media.altText,
      caption: media.caption,
      url: media.url,
    });
    setEditModalOpen(true);
  };

  // Get media ID (handle both id and _id from MongoDB)
  const getMediaId = (media: Media) => media.id || media._id || '';

  // Handle edit
  const handleEdit = async (values: any) => {
    if (!selectedMedia) return;
    try {
      // Only send fields that have values - exclude URL completely to prevent accidents
      const updateData: Record<string, string | null> = {};
      // Always send title, altText, caption (even if null to allow clearing)
      if (values.title !== undefined) updateData.title = values.title || null;
      if (values.altText !== undefined) updateData.altText = values.altText || null;
      if (values.caption !== undefined) updateData.caption = values.caption || null;
      // Only update URL if explicitly changed AND different from original
      if (values.url && values.url.trim() !== '' && values.url !== selectedMedia.url) {
        updateData.url = values.url;
      }

      await mediaApi.update(getMediaId(selectedMedia), updateData);
      message.success("Cập nhật thành công");
      setEditModalOpen(false);
      fetchMedia(pagination.page);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Generate alt text using AI
  const handleGenerateAltText = async () => {
    if (!selectedMedia || !selectedMedia.mimeType.startsWith("image/")) return;
    setGeneratingAlt(true);
    try {
      const result = await aiSeoApi.generateImageAltText(
        selectedMedia.url,
        selectedMedia.originalFilename
      );
      if (result.success && result.data) {
        form.setFieldValue("altText", result.data.altText);
        message.success("Đã tạo alt text bằng AI");
      } else {
        message.error(result.error || "Không thể tạo alt text");
      }
    } catch (e) {
      message.error("Lỗi khi tạo alt text");
    } finally {
      setGeneratingAlt(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await mediaApi.delete(id);
      message.success("Xóa media thành công");
      fetchMedia(pagination.page);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể xóa media");
    }
  };

  // Open detail modal
  const openDetailModal = (media: Media) => {
    setSelectedMedia(media);
    setDetailModalOpen(true);
  };

  // Copy URL
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success("Đã copy URL");
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

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Title level={3} style={{ margin: 0 }}>
          <PictureOutlined /> Media Library
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchMedia()} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
            Upload
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
                placeholder="Tìm kiếm tên file..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => fetchMedia()}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="Loại file"
                value={filterType}
                onChange={(v) => {
                  setFilterType(v);
                  setTimeout(() => fetchMedia(), 100);
                }}
                style={{ width: 150 }}
                allowClear
                options={[
                  { value: "image", label: "Hình ảnh" },
                  { value: "video", label: "Video" },
                  { value: "audio", label: "Audio" },
                  { value: "application", label: "Tài liệu" },
                ]}
              />
              <Button onClick={() => fetchMedia()}>Tìm kiếm</Button>
            </Space>
          </Col>
          <Col>
            <Text type="secondary">Tổng: {pagination.total} files</Text>
          </Col>
        </Row>
      </Card>

      {/* Media Grid */}
      <Card>
        <Spin spinning={loading}>
          {mediaList.length === 0 ? (
            <Empty description="Chưa có media nào" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {mediaList.map((media) => (
                  <Col key={getMediaId(media)} xs={12} sm={8} md={6} lg={4}>
                    <Card
                      hoverable
                      size="small"
                      cover={
                        media.mimeType.startsWith("image/") ? (
                          <div style={{ height: 120, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
                            <Image
                              src={media.url}
                              alt={media.altText || media.filename}
                              style={{ maxHeight: 120, objectFit: "cover" }}
                              preview={false}
                              onClick={() => openDetailModal(media)}
                            />
                          </div>
                        ) : (
                          <div
                            style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", cursor: "pointer" }}
                            onClick={() => openDetailModal(media)}
                          >
                            {getFileIcon(media.mimeType)}
                          </div>
                        )
                      }
                      actions={[
                        <Tooltip key="view" title="Xem chi tiết">
                          <EyeOutlined onClick={() => openDetailModal(media)} />
                        </Tooltip>,
                        <Tooltip key="edit" title="Sửa">
                          <EditOutlined onClick={() => openEditModal(media)} />
                        </Tooltip>,
                        <Popconfirm
                          key="delete"
                          title="Xóa media"
                          description="Bạn có chắc muốn xóa?"
                          onConfirm={() => handleDelete(getMediaId(media))}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <DeleteOutlined style={{ color: "#ff4d4f" }} />
                        </Popconfirm>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <Tooltip title={media.originalFilename}>
                            <Text ellipsis style={{ fontSize: 12 }}>{media.originalFilename}</Text>
                          </Tooltip>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {formatSize(media.size)}
                          </Text>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={(page) => fetchMedia(page)}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </div>
            </>
          )}
        </Spin>
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload Media"
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setFileList([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => setUploadModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={uploading}
            onClick={handleUpload}
            disabled={fileList.length === 0}
          >
            Upload {fileList.length > 0 && `(${fileList.length})`}
          </Button>,
        ]}
        width={600}
      >
        <Upload.Dragger
          multiple
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: "#1890ff" }} />
          </p>
          <p className="ant-upload-text">Kéo thả file vào đây hoặc click để chọn</p>
          <p className="ant-upload-hint">
            Hỗ trợ: Hình ảnh, Video, Audio, PDF, Office documents
          </p>
        </Upload.Dragger>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa Media"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleEdit} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Tiêu đề">
            <Input placeholder="Tiêu đề cho media" />
          </Form.Item>
          <Form.Item
            name="altText"
            label={
              <Space>
                <span>Alt Text</span>
                {selectedMedia?.mimeType.startsWith("image/") && (
                  <Button
                    type="link"
                    size="small"
                    icon={<RobotOutlined />}
                    loading={generatingAlt}
                    onClick={handleGenerateAltText}
                    style={{ padding: 0, height: "auto" }}
                  >
                    Tạo bằng AI
                  </Button>
                )}
              </Space>
            }
          >
            <Input placeholder="Mô tả hình ảnh (cho SEO)" />
          </Form.Item>
          <Form.Item name="caption" label="Caption">
            <TextArea rows={3} placeholder="Chú thích cho media" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            tooltip="Chỉ sửa URL khi cần di chuyển file sang server khác"
          >
            <Input />
          </Form.Item>
          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Media"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={() => selectedMedia && copyUrl(selectedMedia.url)}>
            Copy URL
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
            setDetailModalOpen(false);
            if (selectedMedia) openEditModal(selectedMedia);
          }}>
            Sửa
          </Button>,
        ]}
        width={700}
      >
        {selectedMedia && (
          <Row gutter={24}>
            <Col span={12}>
              {selectedMedia.mimeType.startsWith("image/") ? (
                <Image src={selectedMedia.url} alt={selectedMedia.altText || ""} style={{ width: "100%" }} />
              ) : (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", borderRadius: 8 }}>
                  {getFileIcon(selectedMedia.mimeType)}
                </div>
              )}
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tên file">{selectedMedia.originalFilename}</Descriptions.Item>
                <Descriptions.Item label="Kích thước">{formatSize(selectedMedia.size)}</Descriptions.Item>
                <Descriptions.Item label="Loại">{selectedMedia.mimeType}</Descriptions.Item>
                <Descriptions.Item label="Ngày tải lên">{formatDate(selectedMedia.createdAt)}</Descriptions.Item>
                {selectedMedia.altText && (
                  <Descriptions.Item label="Alt Text">{selectedMedia.altText}</Descriptions.Item>
                )}
                {selectedMedia.caption && (
                  <Descriptions.Item label="Caption">{selectedMedia.caption}</Descriptions.Item>
                )}
              </Descriptions>

              <div style={{ marginTop: 16 }}>
                <Text strong>URL:</Text>
                <Paragraph copyable style={{ marginTop: 4, marginBottom: 0 }}>
                  {selectedMedia.url}
                </Paragraph>
              </div>

              {selectedMedia.usedIn && selectedMedia.usedIn.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Đang được sử dụng tại:</Text>
                  <List
                    size="small"
                    dataSource={selectedMedia.usedIn}
                    renderItem={(item) => (
                      <List.Item>
                        <Text>{item.type}: {item.title}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
}

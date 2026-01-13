"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  Select,
  message,
  Tabs,
  Row,
  Col,
  Space,
  Button,
  Card,
  Typography,
  Avatar,
  Upload,
  Divider,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  GithubOutlined,
  YoutubeOutlined,
  FacebookOutlined,
  LinkOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Author,
  ExperienceItem,
  EducationItem,
  CertificationItem,
  AchievementItem,
  SkillItem,
  PublicationItem,
  ArticleItem,
  authorApi,
  mediaApi,
} from "@/lib/api";
import { useDebouncedCallback } from "use-debounce";

const { TextArea } = Input;
const { Text } = Typography;

interface AuthorFormModalProps {
  open: boolean;
  author: Author | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Generate unique ID for dynamic items
const generateId = () => Math.random().toString(36).substring(2, 10);

export default function AuthorFormModal({
  open,
  author,
  onClose,
  onSuccess,
}: AuthorFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSlugManuallyEdited(!!author);
      if (author) {
        setAvatarUrl(author.avatarUrl);
        form.setFieldsValue({
          ...author,
          expertise: author.expertise || [],
          experience: author.experience || [],
          education: author.education || [],
          certifications: author.certifications || [],
          achievements: author.achievements || [],
          skills: author.skills || [],
          publications: author.publications || [],
          articles: author.articles || [],
          sameAs: author.sameAs || [],
        });
      } else {
        setAvatarUrl(null);
        form.setFieldsValue({
          isActive: true,
          isFeatured: false,
          sortOrder: 0,
          expertise: [],
          experience: [],
          education: [],
          certifications: [],
          achievements: [],
          skills: [],
          publications: [],
          articles: [],
          sameAs: [],
        });
      }
    }
  }, [open, author, form]);

  // Auto-generate slug from name (debounced)
  const generateSlugFromName = useDebouncedCallback(async (name: string) => {
    if (!name || slugManuallyEdited) return;

    setGeneratingSlug(true);
    try {
      const result = await authorApi.generateSlug(name);
      form.setFieldValue("slug", result.slug);
    } catch (e) {
      // Ignore error
    } finally {
      setGeneratingSlug(false);
    }
  }, 300);

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    generateSlugFromName(name);
  };

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSlugManuallyEdited(true);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const result = await mediaApi.upload(file, "authors");
      setAvatarUrl(result.url);
      form.setFieldValue("avatarUrl", result.url);
      message.success("Tải ảnh thành công");
    } catch (e) {
      message.error("Không thể tải ảnh");
    } finally {
      setUploadingAvatar(false);
    }
    return false; // Prevent default upload
  };

  // Submit form
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Add IDs to dynamic arrays if missing
      const processArray = <T extends { id?: string }>(arr: T[]): T[] =>
        (arr || []).map((item) => ({
          ...item,
          id: item.id || generateId(),
        }));

      const data = {
        ...values,
        avatarUrl,
        experience: processArray(values.experience),
        education: processArray(values.education),
        certifications: processArray(values.certifications),
        achievements: processArray(values.achievements),
        skills: processArray(values.skills),
        publications: processArray(values.publications),
        articles: processArray(values.articles),
      };

      if (author) {
        await authorApi.update(author.id, data);
        message.success("Cập nhật tác giả thành công");
      } else {
        await authorApi.create(data);
        message.success("Tạo tác giả thành công");
      }
      onSuccess();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                src={avatarUrl}
                icon={<UserOutlined />}
                size={120}
                style={{ marginBottom: 16 }}
              />
              <br />
              <Upload
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploadingAvatar}>
                  Tải ảnh đại diện
                </Button>
              </Upload>
              <Form.Item name="avatarUrl" hidden>
                <Input />
              </Form.Item>
            </div>
          </Col>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Họ tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nguyễn Văn A" onChange={handleNameChange} />
            </Form.Item>

            <Form.Item
              name="slug"
              label={
                <Space>
                  <span>Slug</span>
                  {generatingSlug && <Text type="secondary">(đang tạo...)</Text>}
                </Space>
              }
            >
              <Input placeholder="nguyen-van-a" onChange={handleSlugChange} addonBefore="/" />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <Input placeholder="email@example.com" type="email" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="jobTitle" label="Chức danh">
                  <Input placeholder="Kỹ sư xây dựng" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="company" label="Công ty/Tổ chức">
                  <Input placeholder="Công ty ABC" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="location" label="Địa điểm">
              <Input placeholder="Hà Nội, Việt Nam" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "bio",
      label: "Giới thiệu",
      children: (
        <>
          <Form.Item name="shortBio" label="Giới thiệu ngắn (cho card preview)">
            <TextArea rows={2} placeholder="Giới thiệu ngắn gọn về tác giả..." maxLength={500} showCount />
          </Form.Item>

          <Form.Item name="bio" label="Giới thiệu chi tiết">
            <TextArea rows={6} placeholder="Mô tả chi tiết về kinh nghiệm, chuyên môn..." />
          </Form.Item>

          <Form.Item name="expertise" label="Chuyên môn (tags)">
            <Select
              mode="tags"
              placeholder="Nhập và Enter để thêm chuyên môn"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="credentials" label="Bằng cấp/Chứng chỉ (tóm tắt)">
            <Input placeholder="Thạc sĩ Xây dựng, Chứng chỉ PMP..." />
          </Form.Item>

          <Form.Item name="yearsExperience" label="Số năm kinh nghiệm">
            <InputNumber min={0} max={100} style={{ width: 150 }} />
          </Form.Item>
        </>
      ),
    },
    {
      key: "experience",
      label: "Kinh nghiệm",
      children: (
        <Form.List name="experience">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        name={[name, "company"]}
                        label="Công ty"
                        rules={[{ required: true, message: "Nhập tên công ty" }]}
                      >
                        <Input placeholder="Tên công ty" />
                      </Form.Item>
                    </Col>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        name={[name, "position"]}
                        label="Chức vụ"
                        rules={[{ required: true, message: "Nhập chức vụ" }]}
                      >
                        <Input placeholder="Chức vụ" />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: "right", paddingTop: 30 }}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "startDate"]}
                        label="Bắt đầu"
                        rules={[{ required: true, message: "Nhập ngày" }]}
                      >
                        <Input placeholder="2020-01 hoặc 2020" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "endDate"]} label="Kết thúc">
                        <Input placeholder="2024-01 (để trống nếu đang làm)" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "isCurrent"]} label="Đang làm" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item {...restField} name={[name, "location"]} label="Địa điểm">
                    <Input placeholder="Hà Nội" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "description"]} label="Mô tả công việc">
                    <TextArea rows={2} placeholder="Mô tả công việc..." />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ id: generateId() })} block icon={<PlusOutlined />}>
                Thêm kinh nghiệm
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "education",
      label: "Học vấn",
      children: (
        <Form.List name="education">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        name={[name, "school"]}
                        label="Trường/Tổ chức"
                        rules={[{ required: true, message: "Nhập tên trường" }]}
                      >
                        <Input placeholder="Đại học Bách khoa" />
                      </Form.Item>
                    </Col>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        name={[name, "degree"]}
                        label="Bằng cấp"
                        rules={[{ required: true, message: "Nhập bằng cấp" }]}
                      >
                        <Input placeholder="Thạc sĩ" />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: "right", paddingTop: 30 }}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "field"]} label="Chuyên ngành">
                        <Input placeholder="Kỹ thuật xây dựng" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "startYear"]} label="Năm bắt đầu">
                        <InputNumber min={1950} max={2100} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "endYear"]} label="Năm tốt nghiệp">
                        <InputNumber min={1950} max={2100} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item {...restField} name={[name, "description"]} label="Mô tả">
                    <TextArea rows={2} placeholder="Thành tích, hoạt động..." />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ id: generateId() })} block icon={<PlusOutlined />}>
                Thêm học vấn
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "certifications",
      label: "Chứng chỉ",
      children: (
        <Form.List name="certifications">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        label="Tên chứng chỉ"
                        rules={[{ required: true, message: "Nhập tên chứng chỉ" }]}
                      >
                        <Input placeholder="PMP, AWS Solutions Architect..." />
                      </Form.Item>
                    </Col>
                    <Col span={11}>
                      <Form.Item
                        {...restField}
                        name={[name, "issuer"]}
                        label="Tổ chức cấp"
                        rules={[{ required: true, message: "Nhập tổ chức cấp" }]}
                      >
                        <Input placeholder="PMI, AWS..." />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: "right", paddingTop: 30 }}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "issueDate"]} label="Ngày cấp">
                        <Input placeholder="2024-01" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "expiryDate"]} label="Hết hạn">
                        <Input placeholder="2027-01 (để trống nếu vĩnh viễn)" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...restField} name={[name, "credentialId"]} label="Mã chứng chỉ">
                        <Input placeholder="ABC123" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item {...restField} name={[name, "credentialUrl"]} label="Link xác thực">
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ id: generateId() })} block icon={<PlusOutlined />}>
                Thêm chứng chỉ
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "skills",
      label: "Kỹ năng",
      children: (
        <Form.List name="skills">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        label="Kỹ năng"
                        rules={[{ required: true, message: "Nhập tên kỹ năng" }]}
                      >
                        <Input placeholder="React, AutoCAD..." />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item {...restField} name={[name, "level"]} label="Mức độ">
                        <Select
                          placeholder="Chọn"
                          allowClear
                          options={[
                            { value: "beginner", label: "Cơ bản" },
                            { value: "intermediate", label: "Trung bình" },
                            { value: "advanced", label: "Nâng cao" },
                            { value: "expert", label: "Chuyên gia" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item {...restField} name={[name, "yearsOfExperience"]} label="Số năm">
                        <InputNumber min={0} max={50} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: "right", paddingTop: 30 }}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                    </Col>
                  </Row>
                  <Form.Item {...restField} name={[name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ id: generateId() })} block icon={<PlusOutlined />}>
                Thêm kỹ năng
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "articles",
      label: "Bài viết",
      children: (
        <Form.List name="articles">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={22}>
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        label="Tiêu đề bài viết"
                        rules={[{ required: true, message: "Nhập tiêu đề bài viết" }]}
                      >
                        <Input placeholder="Tiêu đề bài viết..." />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: "right", paddingTop: 30 }}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                    </Col>
                  </Row>
                  <Form.Item
                    {...restField}
                    name={[name, "url"]}
                    label="Link bài viết"
                    rules={[
                      { required: true, message: "Nhập link bài viết" },
                      { type: "url", message: "Link không hợp lệ" },
                    ]}
                  >
                    <Input placeholder="https://example.com/bai-viet" prefix={<LinkOutlined />} />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, "imageUrl"]} label="Ảnh đại diện (optional)">
                        <Input placeholder="https://example.com/image.jpg" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...restField} name={[name, "publishedDate"]} label="Ngày đăng">
                        <Input placeholder="2024-01-15" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item {...restField} name={[name, "description"]} label="Mô tả ngắn">
                    <TextArea rows={2} placeholder="Mô tả ngắn về bài viết..." />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add({ id: generateId() })} block icon={<PlusOutlined />}>
                Thêm bài viết
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "social",
      label: "Mạng xã hội",
      children: (
        <>
          <Form.Item name="website" label={<><GlobalOutlined /> Website</>}>
            <Input placeholder="https://yourwebsite.com" />
          </Form.Item>
          <Form.Item name="linkedin" label={<><LinkedinOutlined /> LinkedIn</>}>
            <Input placeholder="https://linkedin.com/in/username" />
          </Form.Item>
          <Form.Item name="github" label={<><GithubOutlined /> GitHub</>}>
            <Input placeholder="https://github.com/username" />
          </Form.Item>
          <Form.Item name="twitter" label="X (Twitter)">
            <Input placeholder="https://x.com/username" />
          </Form.Item>
          <Form.Item name="facebook" label={<><FacebookOutlined /> Facebook</>}>
            <Input placeholder="https://facebook.com/username" />
          </Form.Item>
          <Form.Item name="youtube" label={<><YoutubeOutlined /> YouTube</>}>
            <Input placeholder="https://youtube.com/@channel" />
          </Form.Item>
          <Form.Item name="sameAs" label="Các liên kết khác (Schema.org sameAs)">
            <Select
              mode="tags"
              placeholder="Thêm URL khác (Enter để thêm)"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </>
      ),
    },
    {
      key: "seo",
      label: "SEO & Cài đặt",
      children: (
        <>
          <Divider>SEO</Divider>
          <Form.Item name="metaTitle" label="Meta Title">
            <Input placeholder="Tự động từ tên nếu để trống" maxLength={60} showCount />
          </Form.Item>
          <Form.Item name="metaDescription" label="Meta Description">
            <TextArea rows={3} placeholder="Mô tả cho SEO..." maxLength={160} showCount />
          </Form.Item>

          <Divider>Cài đặt</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sortOrder" label="Thứ tự hiển thị">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked">
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={author ? "Sửa tác giả" : "Thêm tác giả mới"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Tabs items={tabItems} />

        <Divider />

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {author ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

"use client";

import { useState, useEffect, useMemo, createElement } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tabs,
  Row,
  Col,
  Space,
  Card,
  Switch,
  InputNumber,
  Divider,
  Typography,
  Tooltip,
  Slider,
  Tag,
  Alert,
} from "antd";
import * as Icons from "@ant-design/icons";
import {
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  EditOutlined,
  BgColorsOutlined,
  EyeOutlined,
  ExpandOutlined,
  CompressOutlined,
  UndoOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  FontSizeOutlined,
  BorderOutlined,
  AppstoreOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  ExperimentOutlined,
  CloudOutlined,
  RocketOutlined,
  GiftOutlined,
  HeartOutlined,
  SmileOutlined,
  CrownOutlined,
  RadarChartOutlined,
  ArrowUpOutlined,
  HighlightOutlined,
  ZoomInOutlined,
  SyncOutlined,
  BorderlessTableOutlined,
  InsertRowAboveOutlined,
  BlockOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import { LandingBlock, BlockSettings, blockDefinitions } from "@/lib/landing-blocks";
import { animations } from "@/lib/animations";
import BlockPreview from "./block-preview";

// Dynamic icon renderer
const renderIcon = (iconName: string, style?: React.CSSProperties) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[iconName];
  if (IconComponent) {
    return createElement(IconComponent, { style });
  }
  return <AppstoreOutlined style={style} />;
};

const { TextArea } = Input;
const { Text, Title } = Typography;

interface BlockEditorProps {
  block: LandingBlock;
  visible: boolean;
  onSave: (block: LandingBlock) => void;
  onCancel: () => void;
}

export default function BlockEditor({ block, visible, onSave, onCancel }: BlockEditorProps) {
  const [form] = Form.useForm();
  const [editedBlock, setEditedBlock] = useState<LandingBlock>(block);
  const [showPreview, setShowPreview] = useState(true);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Live preview block
  const livePreviewBlock = useMemo(() => {
    const values = form.getFieldsValue();
    return {
      ...editedBlock,
      content: {
        ...editedBlock.content,
        ...values,
      },
      settings: values.settings || editedBlock.settings,
    } as LandingBlock;
  }, [editedBlock, form]);

  useEffect(() => {
    setEditedBlock(block);
    form.setFieldsValue({
      ...block.content,
      settings: block.settings,
    });
  }, [block, form]);

  // Update preview on form change
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    setEditedBlock((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        ...values,
      },
      settings: values.settings || prev.settings,
    } as LandingBlock));
  };

  const handleSave = () => {
    const values = form.getFieldsValue();
    const updatedBlock = {
      ...editedBlock,
      content: {
        ...editedBlock.content,
        ...values,
      },
      settings: values.settings || editedBlock.settings,
    };
    onSave(updatedBlock as LandingBlock);
  };

  const handleReset = () => {
    form.setFieldsValue({
      ...block.content,
      settings: block.settings,
    });
    setEditedBlock(block);
  };

  const blockDef = blockDefinitions.find(
    (d) => d.type === block.type && d.variant === block.variant
  );

  // Gradient presets với preview
  const gradientPresets = [
    { value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", label: "Ocean", icon: "CloudOutlined" },
    { value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", label: "Fire", icon: "FireOutlined" },
    { value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", label: "Forest", icon: "ExperimentOutlined" },
    { value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", label: "Sunset", icon: "StarOutlined" },
    { value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", label: "Aqua", icon: "ThunderboltOutlined" },
    { value: "linear-gradient(135deg, #232526 0%, #414345 100%)", label: "Midnight", icon: "RadarChartOutlined" },
    { value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", label: "Cosmic", icon: "RocketOutlined" },
    { value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", label: "Candy", icon: "GiftOutlined" },
    { value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", label: "Peach", icon: "HeartOutlined" },
    { value: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)", label: "Mint", icon: "SmileOutlined" },
    { value: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)", label: "Rainbow", icon: "BgColorsOutlined" },
    { value: "linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)", label: "Aurora", icon: "CrownOutlined" },
  ];

  // Background effect classes
  const bgEffects = [
    { value: "", label: "Không có", icon: null },
    { value: "bg-animated-gradient", label: "Gradient động", icon: "BgColorsOutlined" },
    { value: "bg-animated-gradient-fast", label: "Gradient nhanh", icon: "ThunderboltOutlined" },
    { value: "bg-mesh-gradient", label: "Mesh gradient", icon: "RadarChartOutlined" },
    { value: "bg-aurora", label: "Aurora", icon: "CrownOutlined" },
    { value: "bg-cyber", label: "Cyber lines", icon: "DesktopOutlined" },
    { value: "bg-particles", label: "Particles", icon: "StarOutlined" },
    { value: "bg-waves", label: "Waves", icon: "CloudOutlined" },
  ];

  // Hover effect classes
  const hoverEffects = [
    { value: "", label: "Không có", icon: null },
    { value: "hover-lift", label: "Lift up", icon: "ArrowUpOutlined" },
    { value: "hover-glow", label: "Glow", icon: "HighlightOutlined" },
    { value: "hover-scale", label: "Scale", icon: "ZoomInOutlined" },
    { value: "hover-rotate", label: "Rotate", icon: "SyncOutlined" },
    { value: "hover-border-glow", label: "Border glow", icon: "BorderOutlined" },
  ];

  // Card effect classes
  const cardEffects = [
    { value: "", label: "Không có", icon: null },
    { value: "card-glass", label: "Glass morphism", icon: "InsertRowAboveOutlined" },
    { value: "card-3d", label: "3D tilt", icon: "BlockOutlined" },
    { value: "card-floating", label: "Floating", icon: "CarryOutOutlined" },
  ];

  // Render content fields based on block type
  const renderContentFields = () => {
    switch (editedBlock.type) {
      case "hero":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Nội dung chính</>}>
              <Form.Item name="title" label="Tiêu đề chính" rules={[{ required: true }]}>
                <Input placeholder="Nhập tiêu đề hero" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
              <Form.Item name="subtitle" label="Tiêu đề phụ">
                <Input placeholder="Nhập subtitle" />
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} placeholder="Mô tả chi tiết" showCount maxLength={500} />
              </Form.Item>
            </Card>

            <Card size="small" title="🔘 Buttons">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={["primaryButton", "text"]} label="Button chính">
                    <Input placeholder="VD: Bắt đầu ngay" addonBefore="Text" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={["primaryButton", "url"]} label=" ">
                    <Input placeholder="VD: /signup" addonBefore="URL" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={["secondaryButton", "text"]} label="Button phụ">
                    <Input placeholder="VD: Tìm hiểu thêm" addonBefore="Text" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={["secondaryButton", "url"]} label=" ">
                    <Input placeholder="VD: #features" addonBefore="URL" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card size="small" title={<><PictureOutlined /> Media</>}>
              <Form.Item name="image" label="URL hình ảnh">
                <Input placeholder="https://..." />
              </Form.Item>
              {editedBlock.variant === "video" && (
                <Form.Item name="videoUrl" label="URL Video (YouTube/Vimeo)">
                  <Input placeholder="https://youtube.com/embed/..." />
                </Form.Item>
              )}
              <Form.Item name="badges" label="Badges (phân cách bằng dấu phẩy)">
                <Input placeholder="Miễn phí, Không cần thẻ, 14 ngày dùng thử" />
              </Form.Item>
            </Card>
          </div>
        );

      case "features":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Tiêu đề section</>}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="VD: Tính năng nổi bật" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
              <Form.Item name="subtitle" label="Mô tả">
                <Input placeholder="Mô tả ngắn" />
              </Form.Item>
            </Card>

            <Card size="small" title="⭐ Danh sách tính năng" extra={<Tag color="blue">Drag to reorder</Tag>}>
              <Form.List name="items">
                {(fields, { add, remove, move }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        size="small"
                        style={{ marginBottom: 12, background: "#fafafa", border: "1px dashed #d9d9d9" }}
                        extra={
                          <Space>
                            <Tag color="blue">#{index + 1}</Tag>
                            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                          </Space>
                        }
                      >
                        <Row gutter={12}>
                          <Col span={4}>
                            <Form.Item {...restField} name={[name, "icon"]} label="Icon">
                              <Input placeholder="🚀" style={{ textAlign: "center", fontSize: 20 }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...restField} name={[name, "title"]} label="Tiêu đề">
                              <Input placeholder="Tên tính năng" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, "description"]} label="Mô tả">
                              <Input placeholder="Mô tả tính năng" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item {...restField} name={[name, "image"]} label="URL hình ảnh (optional)">
                          <Input placeholder="https://..." />
                        </Form.Item>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add({ icon: "✨", title: "", description: "" })} block icon={<PlusOutlined />} style={{ height: 48 }}>
                      Thêm tính năng
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </div>
        );

      case "testimonial":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Tiêu đề section</>}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="VD: Khách hàng nói gì?" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
            </Card>

            <Card size="small" title="💬 Các đánh giá">
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        size="small"
                        style={{ marginBottom: 12, background: "#fafafa" }}
                        extra={
                          <Space>
                            <Tag color="gold">⭐ Review #{index + 1}</Tag>
                            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                          </Space>
                        }
                      >
                        <Form.Item {...restField} name={[name, "quote"]} label="Nội dung đánh giá">
                          <TextArea rows={2} placeholder="Nội dung review..." showCount maxLength={300} />
                        </Form.Item>
                        <Row gutter={12}>
                          <Col span={8}>
                            <Form.Item {...restField} name={[name, "author"]} label="Tên">
                              <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...restField} name={[name, "role"]} label="Chức vụ">
                              <Input placeholder="CEO, Startup ABC" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item {...restField} name={[name, "rating"]} label="Rating">
                              <Select options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: "⭐".repeat(n) }))} />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item {...restField} name={[name, "avatar"]} label="Avatar URL">
                              <Input placeholder="https://..." />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add({ quote: "", author: "", rating: 5 })} block icon={<PlusOutlined />} style={{ height: 48 }}>
                      Thêm đánh giá
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </div>
        );

      case "pricing":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Tiêu đề section</>}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="VD: Bảng giá" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
              <Form.Item name="subtitle" label="Mô tả">
                <Input placeholder="Chọn gói phù hợp với bạn" />
              </Form.Item>
              <Form.Item name="billingToggle" label="Hiện toggle Tháng/Năm" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card size="small" title="💰 Các gói giá">
              <Form.List name="plans">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        size="small"
                        style={{ marginBottom: 12, background: "#fafafa" }}
                        extra={
                          <Space>
                            <Tag color="green">Gói #{index + 1}</Tag>
                            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                          </Space>
                        }
                      >
                        <Row gutter={12}>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, "name"]} label="Tên gói">
                              <Input placeholder="Pro" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, "price"]} label="Giá/tháng">
                              <Input placeholder="199k" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, "priceYearly"]} label="Giá/năm">
                              <Input placeholder="1990k" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, "highlighted"]} label="Highlight" valuePropName="checked">
                              <Switch checkedChildren="⭐" unCheckedChildren="—" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, "buttonText"]} label="Button text">
                              <Input placeholder="Chọn gói này" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, "buttonUrl"]} label="Button URL">
                              <Input placeholder="/checkout?plan=pro" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item {...restField} name={[name, "description"]} label="Mô tả gói">
                          <Input placeholder="Phù hợp cho startup và team nhỏ" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "features"]} label="Features (mỗi dòng 1 feature)">
                          <TextArea rows={4} placeholder="✓ Feature 1&#10;✓ Feature 2&#10;✓ Feature 3" />
                        </Form.Item>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add({ name: "", price: "", features: [], buttonText: "Chọn" })} block icon={<PlusOutlined />} style={{ height: 48 }}>
                      Thêm gói
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </div>
        );

      case "cta":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Nội dung CTA</>}>
              <Form.Item name="title" label="Tiêu đề CTA" rules={[{ required: true }]}>
                <Input placeholder="VD: Sẵn sàng bắt đầu?" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <TextArea rows={2} placeholder="Mô tả ngắn gọn, hấp dẫn" showCount maxLength={200} />
              </Form.Item>
            </Card>

            <Card size="small" title="🔘 Action">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="buttonText" label="Button Text" rules={[{ required: true }]}>
                    <Input placeholder="Đăng ký ngay" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="buttonUrl" label="Button URL" rules={[{ required: true }]}>
                    <Input placeholder="/signup" />
                  </Form.Item>
                </Col>
              </Row>
              {editedBlock.variant === "newsletter" && (
                <Form.Item name="inputPlaceholder" label="Placeholder input email">
                  <Input placeholder="Nhập email của bạn" />
                </Form.Item>
              )}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="secondaryButtonText" label="Button phụ (optional)">
                    <Input placeholder="Tìm hiểu thêm" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="secondaryButtonUrl" label="URL button phụ">
                    <Input placeholder="#learn-more" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card size="small" title={<><PictureOutlined /> Media</>}>
              <Form.Item name="image" label="URL hình ảnh">
                <Input placeholder="https://..." />
              </Form.Item>
            </Card>
          </div>
        );

      case "stats":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Tiêu đề section</>}>
              <Form.Item name="title" label="Tiêu đề (optional)">
                <Input placeholder="Số liệu ấn tượng" size="large" />
              </Form.Item>
            </Card>

            <Card size="small" title="📊 Các số liệu">
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card key={key} size="small" style={{ marginBottom: 12, background: "#fafafa" }} extra={<Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />}>
                        <Row gutter={12}>
                          <Col span={4}>
                            <Form.Item {...restField} name={[name, "icon"]} label="Icon">
                              <Input placeholder="📈" style={{ textAlign: "center", fontSize: 20 }} />
                            </Form.Item>
                          </Col>
                          <Col span={3}>
                            <Form.Item {...restField} name={[name, "prefix"]} label="Prefix">
                              <Input placeholder="$" />
                            </Form.Item>
                          </Col>
                          <Col span={7}>
                            <Form.Item {...restField} name={[name, "value"]} label="Giá trị">
                              <Input placeholder="10K" style={{ fontWeight: 600 }} />
                            </Form.Item>
                          </Col>
                          <Col span={3}>
                            <Form.Item {...restField} name={[name, "suffix"]} label="Suffix">
                              <Input placeholder="+" />
                            </Form.Item>
                          </Col>
                          <Col span={7}>
                            <Form.Item {...restField} name={[name, "label"]} label="Label">
                              <Input placeholder="Khách hàng" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add({ icon: "📈", value: "", label: "" })} block icon={<PlusOutlined />} style={{ height: 48 }}>
                      Thêm số liệu
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </div>
        );

      case "faq":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Tiêu đề section</>}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="Câu hỏi thường gặp" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
              <Form.Item name="subtitle" label="Mô tả">
                <Input placeholder="Giải đáp thắc mắc của bạn" />
              </Form.Item>
            </Card>

            <Card size="small" title="❓ Danh sách câu hỏi">
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card key={key} size="small" style={{ marginBottom: 12, background: "#fafafa" }} extra={<Space><Tag>Q{index + 1}</Tag><Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} /></Space>}>
                        <Form.Item {...restField} name={[name, "question"]} label="Câu hỏi">
                          <Input placeholder="Làm sao để bắt đầu?" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "answer"]} label="Trả lời">
                          <TextArea rows={3} placeholder="Bạn chỉ cần đăng ký tài khoản và..." showCount maxLength={500} />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "category"]} label="Category (optional)">
                          <Input placeholder="Thanh toán, Tài khoản, etc." />
                        </Form.Item>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add({ question: "", answer: "" })} block icon={<PlusOutlined />} style={{ height: 48 }}>
                      Thêm câu hỏi
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </div>
        );

      case "contact":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Tiêu đề section</>}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="Liên hệ với chúng tôi" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
              <Form.Item name="subtitle" label="Mô tả">
                <Input placeholder="Chúng tôi luôn sẵn sàng hỗ trợ" />
              </Form.Item>
            </Card>

            <Card size="small" title="📞 Thông tin liên hệ">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" label="Email">
                    <Input placeholder="contact@example.com" addonBefore="📧" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Điện thoại">
                    <Input placeholder="0123 456 789" addonBefore="📱" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="address" label="Địa chỉ">
                <Input placeholder="123 Đường ABC, Quận 1, TP.HCM" addonBefore="📍" />
              </Form.Item>
              <Form.Item name="mapUrl" label="Google Maps Embed URL">
                <Input placeholder="https://www.google.com/maps/embed?..." />
              </Form.Item>
            </Card>

            <Card size="small" title="🔗 Social Links">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={["socialLinks", "facebook"]} label="Facebook">
                    <Input placeholder="https://facebook.com/..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={["socialLinks", "twitter"]} label="Twitter/X">
                    <Input placeholder="https://twitter.com/..." />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={["socialLinks", "instagram"]} label="Instagram">
                    <Input placeholder="https://instagram.com/..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={["socialLinks", "linkedin"]} label="LinkedIn">
                    <Input placeholder="https://linkedin.com/..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>
        );

      case "gallery":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Tiêu đề section</>}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="Thư viện hình ảnh" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
            </Card>

            <Card size="small" title="🖼️ Danh sách hình ảnh">
              <Form.List name="images">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card key={key} size="small" style={{ marginBottom: 12, background: "#fafafa" }} extra={<Space><Tag color="purple">#{index + 1}</Tag><Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} /></Space>}>
                        <Form.Item {...restField} name={[name, "url"]} label="URL hình ảnh" rules={[{ required: true }]}>
                          <Input placeholder="https://..." />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, "alt"]} label="Alt text">
                              <Input placeholder="Mô tả hình ảnh" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, "caption"]} label="Caption">
                              <Input placeholder="Chú thích" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item {...restField} name={[name, "link"]} label="Link (khi click)">
                          <Input placeholder="https://..." />
                        </Form.Item>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add({ url: "", alt: "" })} block icon={<PlusOutlined />} style={{ height: 48 }}>
                      Thêm hình ảnh
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </div>
        );

      case "footer":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title="🏢 Thông tin công ty">
              <Form.Item name="logo" label="Logo text / URL">
                <Input placeholder="Brand Name hoặc https://logo.png" />
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <TextArea rows={2} placeholder="Mô tả ngắn về công ty" showCount maxLength={200} />
              </Form.Item>
              <Form.Item name="copyright" label="Copyright">
                <Input placeholder="© 2024 Company. All rights reserved." />
              </Form.Item>
            </Card>

            <Card size="small" title="🔗 Social Links">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name={["socialLinks", "facebook"]} label="Facebook">
                    <Input placeholder="URL" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={["socialLinks", "twitter"]} label="Twitter">
                    <Input placeholder="URL" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={["socialLinks", "instagram"]} label="Instagram">
                    <Input placeholder="URL" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name={["socialLinks", "linkedin"]} label="LinkedIn">
                    <Input placeholder="URL" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={["socialLinks", "youtube"]} label="YouTube">
                    <Input placeholder="URL" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>
        );

      case "content":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card size="small" title={<><FontSizeOutlined /> Nội dung</>}>
              <Form.Item name="title" label="Tiêu đề">
                <Input placeholder="Nhập tiêu đề" size="large" style={{ fontWeight: 600 }} />
              </Form.Item>
              <Form.Item name="subtitle" label="Tiêu đề phụ">
                <Input placeholder="Nhập tiêu đề phụ" />
              </Form.Item>
              <Form.Item name="body" label="Nội dung (Markdown)">
                <TextArea rows={8} placeholder="Nhập nội dung Markdown..." />
              </Form.Item>
            </Card>

            <Card size="small" title={<><PictureOutlined /> Media</>}>
              <Form.Item name="image" label="URL hình ảnh">
                <Input placeholder="https://..." />
              </Form.Item>
            </Card>
          </div>
        );

      default:
        return (
          <Card size="small" title={<><FontSizeOutlined /> Nội dung</>}>
            <Form.Item name="title" label="Tiêu đề">
              <Input placeholder="Nhập tiêu đề" />
            </Form.Item>
            <Form.Item name="body" label="Nội dung">
              <TextArea rows={4} placeholder="Nhập nội dung..." />
            </Form.Item>
          </Card>
        );
    }
  };

  // Render settings fields
  const renderSettingsFields = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Gradient Presets */}
      <Card size="small" title={<><BgColorsOutlined /> Gradient Presets</>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 16 }}>
          {gradientPresets.map((preset) => (
            <Tooltip key={preset.value} title={preset.label}>
              <div
                onClick={() => {
                  form.setFieldValue(["settings", "backgroundColor"], preset.value);
                  handleFormChange();
                }}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: preset.value,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: form.getFieldValue(["settings", "backgroundColor"]) === preset.value ? "3px solid #1890ff" : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {renderIcon(preset.icon, { fontSize: 20, color: "#fff" })}
              </div>
            </Tooltip>
          ))}
        </div>
        <Form.Item name={["settings", "backgroundColor"]} label="Custom Background">
          <Input placeholder="#ffffff hoặc linear-gradient(...)" />
        </Form.Item>
      </Card>

      {/* Background Image */}
      <Card size="small" title={<><PictureOutlined /> Background Image</>}>
        <Form.Item name={["settings", "backgroundImage"]} label="URL hình nền">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name={["settings", "backgroundOverlay"]} label="Overlay màu">
          <Input placeholder="rgba(0,0,0,0.5)" />
        </Form.Item>
      </Card>

      {/* Text Color */}
      <Card size="small" title={<><FontSizeOutlined /> Màu chữ</>}>
        <Form.Item name={["settings", "textColor"]} label="Màu chữ chính">
          <Input placeholder="#333333 hoặc #ffffff" />
        </Form.Item>
      </Card>

      {/* Effects */}
      <Card size="small" title={<><StarOutlined /> Hiệu ứng</>}>
        <Form.Item name={["settings", "bgEffect"]} label="Background Effect">
          <Select
            allowClear
            placeholder="Chọn hiệu ứng nền"
            options={bgEffects.map((e) => ({
              value: e.value,
              label: (
                <Space>
                  {e.icon && renderIcon(e.icon, { fontSize: 14 })}
                  <span>{e.label}</span>
                </Space>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item name={["settings", "animation"]} label="Entrance Animation">
          <Select
            allowClear
            placeholder="Chọn animation khi xuất hiện"
            options={animations.map((a) => ({ value: a.id, label: a.name }))}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name={["settings", "hoverEffect"]} label="Hover Effect">
              <Select
                allowClear
                placeholder="Hiệu ứng hover"
                options={hoverEffects.map((e) => ({
                  value: e.value,
                  label: (
                    <Space>
                      {e.icon && renderIcon(e.icon, { fontSize: 14 })}
                      <span>{e.label}</span>
                    </Space>
                  ),
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={["settings", "cardEffect"]} label="Card Style">
              <Select
                allowClear
                placeholder="Kiểu card"
                options={cardEffects.map((e) => ({
                  value: e.value,
                  label: (
                    <Space>
                      {e.icon && renderIcon(e.icon, { fontSize: 14 })}
                      <span>{e.label}</span>
                    </Space>
                  ),
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Layout */}
      <Card size="small" title={<><BorderOutlined /> Layout</>}>
        <Form.Item name={["settings", "padding"]} label="Padding">
          <Select
            options={[
              { value: "none", label: "Không có (0px)" },
              { value: "small", label: "Nhỏ (24px)" },
              { value: "medium", label: "Vừa (48px)" },
              { value: "large", label: "Lớn (80px)" },
              { value: "xlarge", label: "Rất lớn (120px)" },
            ]}
          />
        </Form.Item>

        <Form.Item name={["settings", "fullHeight"]} label="Full viewport height" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name={["settings", "customClass"]} label="Custom CSS Class">
          <Input placeholder="my-custom-class" />
        </Form.Item>
      </Card>
    </div>
  );

  return (
    <Modal
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 40 }}>
          <Space>
            <div
              style={{
                width: 36,
                height: 36,
                background: blockDef?.thumbnail || "#667eea",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {renderIcon(blockDef?.icon || "AppstoreOutlined", { fontSize: 18, color: "#fff" })}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{blockDef?.name || block.type}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{block.variant}</div>
            </div>
          </Space>
          <Space>
            <Tooltip title="Reset về ban đầu">
              <Button size="small" icon={<UndoOutlined />} onClick={handleReset} />
            </Tooltip>
            <Tooltip title={showPreview ? "Ẩn preview" : "Hiện preview"}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                type={showPreview ? "primary" : "default"}
                onClick={() => setShowPreview(!showPreview)}
              />
            </Tooltip>
          </Space>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={showPreview ? 1400 : 800}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Lưu thay đổi
        </Button>,
      ]}
    >
      <div style={{ display: "flex", gap: 20, minHeight: 600 }}>
        {/* Form */}
        <div style={{ flex: 1, overflow: "auto", maxHeight: "70vh" }}>
          <Form form={form} layout="vertical" onValuesChange={handleFormChange} initialValues={{ ...block.content, settings: block.settings }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "content",
                  label: <Space><EditOutlined />Nội dung</Space>,
                  children: renderContentFields(),
                },
                {
                  key: "settings",
                  label: <Space><BgColorsOutlined />Giao diện</Space>,
                  children: renderSettingsFields(),
                },
              ]}
            />
          </Form>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div
            style={{
              width: 550,
              background: "#f5f5f5",
              borderRadius: 12,
              padding: 12,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text strong>Live Preview</Text>
              <Tooltip title="Fullscreen">
                <Button
                  size="small"
                  icon={fullscreenPreview ? <CompressOutlined /> : <ExpandOutlined />}
                  onClick={() => setFullscreenPreview(!fullscreenPreview)}
                />
              </Tooltip>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%" }}>
                <BlockPreview blocks={[editedBlock]} />
              </div>
            </div>
            <Alert
              message="Preview hiển thị ở 50% kích thước thực"
              type="info"
              showIcon
              style={{ marginTop: 12 }}
            />
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      <Modal
        title="Fullscreen Preview"
        open={fullscreenPreview}
        onCancel={() => setFullscreenPreview(false)}
        width="95%"
        style={{ top: 20 }}
        footer={null}
        styles={{ body: { padding: 0, maxHeight: "85vh", overflow: "auto" } }}
      >
        <BlockPreview blocks={[editedBlock]} />
      </Modal>
    </Modal>
  );
}

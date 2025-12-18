"use client";

import { useState, useCallback, useMemo, createElement } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Drawer,
  Tabs,
  Row,
  Col,
  Empty,
  Tooltip,
  Popconfirm,
  Modal,
  Input,
  Badge,
  Segmented,
  Dropdown,
  Tag,
  Divider,
  Switch,
  message,
} from "antd";
import * as Icons from "@ant-design/icons";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DragOutlined,
  AppstoreOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
  SearchOutlined,
  UndoOutlined,
  RedoOutlined,
  MoreOutlined,
  SaveOutlined,
  ImportOutlined,
  ExportOutlined,
  ThunderboltOutlined,
  StarOutlined,
  LayoutOutlined,
  BgColorsOutlined,
  SettingOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  RocketOutlined,
  FormatPainterOutlined,
  BulbOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import {
  LandingBlock,
  BlockCategory,
  BlockDefinition,
  blockDefinitions,
  categories,
  createBlock,
  getBlocksByCategory,
} from "@/lib/landing-blocks";
import BlockEditor from "./block-editor";
import BlockPreview from "./block-preview";

// Dynamic icon renderer
const renderIcon = (iconName: string, style?: React.CSSProperties) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[iconName];
  if (IconComponent) {
    return createElement(IconComponent, { style });
  }
  return <AppstoreOutlined style={style} />;
};

const { Text, Title } = Typography;
const { Search } = Input;

// Preview modes
type PreviewMode = "desktop" | "tablet" | "mobile";

// History for undo/redo
interface HistoryState {
  blocks: LandingBlock[];
  timestamp: number;
}

interface SectionBuilderProps {
  value?: LandingBlock[];
  onChange?: (blocks: LandingBlock[]) => void;
}

// Pre-built templates
const landingTemplates = [
  {
    id: "saas",
    name: "SaaS Landing",
    description: "Hero + Features + Pricing + CTA",
    icon: "RocketOutlined",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    blocks: ["hero-gradient", "features-grid-3", "pricing-cards", "cta-simple", "footer-multi-column"],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Hero + Gallery + About + Contact",
    icon: "FormatPainterOutlined",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    blocks: ["hero-minimal", "gallery-masonry", "content-text-image-left", "contact-split"],
  },
  {
    id: "startup",
    name: "Startup",
    description: "Hero + Stats + Features + Testimonials + CTA",
    icon: "BulbOutlined",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    blocks: ["hero-split", "stats-counters", "features-zigzag", "testimonial-carousel", "cta-newsletter"],
  },
  {
    id: "agency",
    name: "Agency",
    description: "Hero + Services + Team + Contact",
    icon: "BuildOutlined",
    color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    blocks: ["hero-video", "features-cards", "testimonial-grid", "contact-split", "footer-multi-column"],
  },
];

export default function SectionBuilder({ value = [], onChange }: SectionBuilderProps) {
  const [blocks, setBlocks] = useState<LandingBlock[]>(value);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [templateDrawerVisible, setTemplateDrawerVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<LandingBlock | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [activeCategory, setActiveCategory] = useState<BlockCategory>("hero");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [showMiniPreview, setShowMiniPreview] = useState(true);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ blocks: value, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Hidden/locked blocks
  const [hiddenBlocks, setHiddenBlocks] = useState<Set<string>>(new Set());
  const [lockedBlocks, setLockedBlocks] = useState<Set<string>>(new Set());

  // Save to history
  const saveToHistory = useCallback((newBlocks: LandingBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks: newBlocks, timestamp: Date.now() });
    // Keep only last 50 states
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const updateBlocks = useCallback(
    (newBlocks: LandingBlock[], addToHistory = true) => {
      setBlocks(newBlocks);
      onChange?.(newBlocks);
      if (addToHistory) {
        saveToHistory(newBlocks);
      }
    },
    [onChange, saveToHistory]
  );

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevState = history[newIndex];
      setBlocks(prevState.blocks);
      onChange?.(prevState.blocks);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setBlocks(nextState.blocks);
      onChange?.(nextState.blocks);
    }
  };

  // Filter blocks by search
  const filteredDefinitions = useMemo(() => {
    if (!searchQuery) return blockDefinitions;
    const query = searchQuery.toLowerCase();
    return blockDefinitions.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.type.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Add new block
  const handleAddBlock = (definition: BlockDefinition) => {
    const newBlock = createBlock(definition.type, definition.variant);
    updateBlocks([...blocks, newBlock]);
    setDrawerVisible(false);
    message.success(`Đã thêm ${definition.name}`);
  };

  // Add template
  const handleAddTemplate = (templateId: string) => {
    const template = landingTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const newBlocks: LandingBlock[] = [];
    template.blocks.forEach((blockKey) => {
      const [type, variant] = blockKey.split("-") as [BlockCategory, string];
      const fullVariant = blockKey.replace(`${type}-`, "");
      try {
        const block = createBlock(type, fullVariant);
        newBlocks.push(block);
      } catch {
        // Skip if block not found
      }
    });

    updateBlocks([...blocks, ...newBlocks]);
    setTemplateDrawerVisible(false);
    message.success(`Đã thêm template ${template.name}`);
  };

  // Delete block
  const handleDeleteBlock = (index: number) => {
    const block = blocks[index];
    if (lockedBlocks.has(block.id)) {
      message.warning("Section này đang bị khóa");
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    updateBlocks(newBlocks);
  };

  // Duplicate block
  const handleDuplicateBlock = (index: number) => {
    const block = blocks[index];
    const newBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    updateBlocks(newBlocks);
    message.success("Đã nhân bản section");
  };

  // Move block up/down
  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const block = blocks[index];
    if (lockedBlocks.has(block.id)) {
      message.warning("Section này đang bị khóa");
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    updateBlocks(newBlocks);
  };

  // Edit block
  const handleEditBlock = (block: LandingBlock, index: number) => {
    if (lockedBlocks.has(block.id)) {
      message.warning("Section này đang bị khóa. Mở khóa để chỉnh sửa.");
      return;
    }
    setEditingBlock(block);
    setEditingIndex(index);
  };

  // Save edited block
  const handleSaveBlock = (updatedBlock: LandingBlock) => {
    const newBlocks = [...blocks];
    newBlocks[editingIndex] = updatedBlock;
    updateBlocks(newBlocks);
    setEditingBlock(null);
    setEditingIndex(-1);
    message.success("Đã lưu thay đổi");
  };

  // Toggle hidden
  const toggleHidden = (blockId: string) => {
    const newHidden = new Set(hiddenBlocks);
    if (newHidden.has(blockId)) {
      newHidden.delete(blockId);
    } else {
      newHidden.add(blockId);
    }
    setHiddenBlocks(newHidden);
  };

  // Toggle locked
  const toggleLocked = (blockId: string) => {
    const newLocked = new Set(lockedBlocks);
    if (newLocked.has(blockId)) {
      newLocked.delete(blockId);
    } else {
      newLocked.add(blockId);
    }
    setLockedBlocks(newLocked);
  };

  // Export blocks
  const handleExport = () => {
    const data = JSON.stringify(blocks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landing-blocks.json";
    a.click();
    URL.revokeObjectURL(url);
    message.success("Đã export dữ liệu");
  };

  // Import blocks
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            if (Array.isArray(imported)) {
              updateBlocks([...blocks, ...imported]);
              message.success("Đã import dữ liệu");
            }
          } catch {
            message.error("File không hợp lệ");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    const block = blocks[index];
    if (lockedBlocks.has(block.id)) return;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const targetBlock = blocks[index];
    if (lockedBlocks.has(targetBlock.id)) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    setBlocks(newBlocks);
    onChange?.(newBlocks);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null) {
      saveToHistory(blocks);
    }
    setDragIndex(null);
  };

  // Get block info
  const getBlockInfo = (block: LandingBlock) => {
    const def = blockDefinitions.find(
      (d) => d.type === block.type && d.variant === block.variant
    );
    return def || { name: block.type, icon: "AppstoreOutlined", thumbnail: "#ccc", description: "" };
  };

  // Get preview width
  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile": return 375;
      case "tablet": return 768;
      default: return "100%";
    }
  };

  // Block action menu items
  const getBlockMenuItems = (block: LandingBlock, index: number) => [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: () => handleEditBlock(block, index),
    },
    {
      key: "duplicate",
      label: "Nhân bản",
      icon: <CopyOutlined />,
      onClick: () => handleDuplicateBlock(index),
    },
    { type: "divider" as const },
    {
      key: "hide",
      label: hiddenBlocks.has(block.id) ? "Hiện section" : "Ẩn section",
      icon: hiddenBlocks.has(block.id) ? <EyeOutlined /> : <EyeInvisibleOutlined />,
      onClick: () => toggleHidden(block.id),
    },
    {
      key: "lock",
      label: lockedBlocks.has(block.id) ? "Mở khóa" : "Khóa section",
      icon: lockedBlocks.has(block.id) ? <UnlockOutlined /> : <LockOutlined />,
      onClick: () => toggleLocked(block.id),
    },
    { type: "divider" as const },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteBlock(index),
    },
  ];

  return (
    <div style={{ minHeight: 400 }}>
      {/* Header Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          padding: "12px 16px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 12,
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
        }}
      >
        <Space>
          <LayoutOutlined style={{ fontSize: 20, color: "#fff" }} />
          <Title level={5} style={{ margin: 0, color: "#fff" }}>
            Landing Builder
          </Title>
          <Badge count={blocks.length} style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
        </Space>

        <Space size="middle">
          {/* Undo/Redo */}
          <Space size={4}>
            <Tooltip title="Hoàn tác (Ctrl+Z)">
              <Button
                type="text"
                icon={<UndoOutlined />}
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                style={{ color: "#fff" }}
              />
            </Tooltip>
            <Tooltip title="Làm lại (Ctrl+Y)">
              <Button
                type="text"
                icon={<RedoOutlined />}
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                style={{ color: "#fff" }}
              />
            </Tooltip>
          </Space>

          <Divider type="vertical" style={{ background: "rgba(255,255,255,0.3)", height: 24 }} />

          {/* Import/Export */}
          <Space size={4}>
            <Tooltip title="Import">
              <Button type="text" icon={<ImportOutlined />} onClick={handleImport} style={{ color: "#fff" }} />
            </Tooltip>
            <Tooltip title="Export">
              <Button type="text" icon={<ExportOutlined />} onClick={handleExport} style={{ color: "#fff" }} />
            </Tooltip>
          </Space>

          <Divider type="vertical" style={{ background: "rgba(255,255,255,0.3)", height: 24 }} />

          {/* Preview toggle */}
          <Space>
            <Text style={{ color: "#fff", fontSize: 12 }}>Mini Preview</Text>
            <Switch
              size="small"
              checked={showMiniPreview}
              onChange={setShowMiniPreview}
              style={{ background: showMiniPreview ? "#52c41a" : "rgba(255,255,255,0.3)" }}
            />
          </Space>

          <Divider type="vertical" style={{ background: "rgba(255,255,255,0.3)", height: 24 }} />

          {/* Actions */}
          <Button
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }}
          >
            Preview
          </Button>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => setTemplateDrawerVisible(true)}
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }}
          >
            Templates
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ background: "#fff", color: "#667eea", fontWeight: 600 }}
          >
            Thêm Section
          </Button>
        </Space>
      </div>

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <Card
          style={{
            textAlign: "center",
            padding: "60px 40px",
            background: "linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)",
            border: "2px dashed #d9d9d9",
            borderRadius: 16,
          }}
        >
          <Empty
            image={
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <LayoutOutlined style={{ fontSize: 40, color: "#fff" }} />
              </div>
            }
            description={
              <div>
                <Title level={4} style={{ marginBottom: 8 }}>Bắt đầu xây dựng Landing Page</Title>
                <Text type="secondary">Chọn một template có sẵn hoặc thêm từng section</Text>
              </div>
            }
          >
            <Space size="large" style={{ marginTop: 24 }}>
              <Button
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={() => setTemplateDrawerVisible(true)}
              >
                Dùng Template
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setDrawerVisible(true)}
              >
                Thêm Section
              </Button>
            </Space>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: "flex", gap: 16 }}>
          {/* Blocks List */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {blocks.map((block, index) => {
              const info = getBlockInfo(block);
              const isHidden = hiddenBlocks.has(block.id);
              const isLocked = lockedBlocks.has(block.id);

              return (
                <Card
                  key={block.id}
                  size="small"
                  draggable={!isLocked}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    cursor: isLocked ? "not-allowed" : "grab",
                    border: dragIndex === index
                      ? "2px dashed #1890ff"
                      : isLocked
                        ? "1px solid #faad14"
                        : "1px solid #e8e8e8",
                    opacity: dragIndex === index ? 0.5 : isHidden ? 0.5 : 1,
                    background: isHidden ? "#fafafa" : "#fff",
                    borderRadius: 12,
                    transition: "all 0.2s ease",
                  }}
                  styles={{
                    body: { padding: "12px 16px" }
                  }}
                  hoverable={!isLocked}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Drag handle + Index */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 50 }}>
                      <DragOutlined style={{ color: isLocked ? "#faad14" : "#999", cursor: isLocked ? "not-allowed" : "grab" }} />
                      <Tag color="blue" style={{ margin: 0 }}>{index + 1}</Tag>
                    </div>

                    {/* Block thumbnail */}
                    <div
                      style={{
                        width: 64,
                        height: 44,
                        borderRadius: 8,
                        background: info.thumbnail,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {renderIcon(info.icon, { fontSize: 22, color: "#fff" })}
                    </div>

                    {/* Block info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Space size={4}>
                        <Text strong style={{ fontSize: 14 }}>{info.name}</Text>
                        {isLocked && <LockOutlined style={{ color: "#faad14", fontSize: 12 }} />}
                        {isHidden && <EyeInvisibleOutlined style={{ color: "#999", fontSize: 12 }} />}
                      </Space>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {(block.content as { title?: string })?.title || info.description}
                      </Text>
                    </div>

                    {/* Quick actions */}
                    <Space size={4}>
                      <Tooltip title="Di chuyển lên">
                        <Button
                          size="small"
                          type="text"
                          icon={<ArrowUpOutlined />}
                          disabled={index === 0 || isLocked}
                          onClick={() => handleMoveBlock(index, "up")}
                        />
                      </Tooltip>
                      <Tooltip title="Di chuyển xuống">
                        <Button
                          size="small"
                          type="text"
                          icon={<ArrowDownOutlined />}
                          disabled={index === blocks.length - 1 || isLocked}
                          onClick={() => handleMoveBlock(index, "down")}
                        />
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <Button
                          size="small"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditBlock(block, index)}
                          style={{ color: "#1890ff" }}
                        />
                      </Tooltip>
                      <Dropdown
                        menu={{ items: getBlockMenuItems(block, index) }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button size="small" type="text" icon={<MoreOutlined />} />
                      </Dropdown>
                    </Space>
                  </div>
                </Card>
              );
            })}

            {/* Add more button */}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{
                height: 48,
                borderRadius: 12,
                marginTop: 8,
              }}
              block
            >
              Thêm Section mới
            </Button>
          </div>

          {/* Mini Preview */}
          {showMiniPreview && blocks.length > 0 && (
            <Card
              title={
                <Space>
                  <EyeOutlined />
                  <Text>Preview</Text>
                </Space>
              }
              extra={
                <Segmented
                  size="small"
                  value={previewMode}
                  onChange={(v) => setPreviewMode(v as PreviewMode)}
                  options={[
                    { value: "desktop", icon: <DesktopOutlined /> },
                    { value: "tablet", icon: <TabletOutlined /> },
                    { value: "mobile", icon: <MobileOutlined /> },
                  ]}
                />
              }
              style={{ width: 380, flexShrink: 0 }}
              styles={{
                body: {
                  padding: 8,
                  maxHeight: 500,
                  overflow: "auto",
                  background: "#f5f5f5",
                }
              }}
            >
              <div
                style={{
                  width: previewMode === "desktop" ? "100%" : previewMode === "tablet" ? "100%" : 180,
                  margin: "0 auto",
                  transform: "scale(0.3)",
                  transformOrigin: "top center",
                  background: "#fff",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <BlockPreview blocks={blocks.filter((b) => !hiddenBlocks.has(b.id))} />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add Block Drawer */}
      <Drawer
        title={
          <Space>
            <AppstoreOutlined />
            <span>Chọn Section</span>
          </Space>
        }
        placement="right"
        width={700}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Search
            placeholder="Tìm kiếm section..."
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 200 }}
          />
        }
      >
        {searchQuery ? (
          // Search results
          <div>
            <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
              Tìm thấy {filteredDefinitions.length} kết quả
            </Text>
            <Row gutter={[12, 12]}>
              {filteredDefinitions.map((def) => (
                <Col span={8} key={`${def.type}-${def.variant}`}>
                  <Card
                    hoverable
                    size="small"
                    onClick={() => handleAddBlock(def)}
                    style={{ cursor: "pointer", borderRadius: 12 }}
                    styles={{ body: { padding: 0 } }}
                  >
                    <div
                      style={{
                        height: 80,
                        background: def.thumbnail,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px 12px 0 0",
                      }}
                    >
                      {renderIcon(def.icon, { fontSize: 32, color: "#fff" })}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <Text strong style={{ fontSize: 13 }}>{def.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>{def.description}</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          // Category tabs
          <Tabs
            activeKey={activeCategory}
            onChange={(key) => setActiveCategory(key as BlockCategory)}
            tabPosition="left"
            style={{ minHeight: 500 }}
            items={categories.map((cat) => ({
              key: cat.id,
              label: (
                <Space>
                  {renderIcon(cat.icon, { fontSize: 16 })}
                  <span>{cat.name}</span>
                  <Badge count={getBlocksByCategory(cat.id).length} style={{ marginLeft: 4 }} />
                </Space>
              ),
              children: (
                <Row gutter={[12, 12]}>
                  {getBlocksByCategory(cat.id).map((def) => (
                    <Col span={12} key={`${def.type}-${def.variant}`}>
                      <Card
                        hoverable
                        size="small"
                        onClick={() => handleAddBlock(def)}
                        style={{ cursor: "pointer", borderRadius: 12, overflow: "hidden" }}
                        styles={{ body: { padding: 0 } }}
                      >
                        <div
                          style={{
                            height: 90,
                            background: def.thumbnail,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          {renderIcon(def.icon, { fontSize: 36, color: "#fff" })}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              background: "rgba(0,0,0,0.5)",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 10,
                            }}
                          >
                            {def.variant}
                          </div>
                        </div>
                        <div style={{ padding: "10px 14px" }}>
                          <Text strong style={{ fontSize: 14 }}>{def.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
                            {def.description}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ),
            }))}
          />
        )}
      </Drawer>

      {/* Templates Drawer */}
      <Drawer
        title={
          <Space>
            <ThunderboltOutlined />
            <span>Templates có sẵn</span>
          </Space>
        }
        placement="right"
        width={500}
        open={templateDrawerVisible}
        onClose={() => setTemplateDrawerVisible(false)}
      >
        <Row gutter={[16, 16]}>
          {landingTemplates.map((template) => (
            <Col span={12} key={template.id}>
              <Card
                hoverable
                onClick={() => handleAddTemplate(template.id)}
                style={{ cursor: "pointer", borderRadius: 12, overflow: "hidden" }}
                styles={{ body: { padding: 0 } }}
              >
                <div
                  style={{
                    height: 100,
                    background: template.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {renderIcon(template.icon, { fontSize: 48, color: "#fff" })}
                </div>
                <div style={{ padding: 16, textAlign: "center" }}>
                  <Title level={5} style={{ marginBottom: 4 }}>{template.name}</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>{template.description}</Text>
                  <div style={{ marginTop: 12 }}>
                    <Tag color="blue">{template.blocks.length} sections</Tag>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <Divider />
        <Text type="secondary">
          Tip: Templates sẽ thêm các section vào cuối danh sách hiện tại. Bạn có thể tùy chỉnh sau khi thêm.
        </Text>
      </Drawer>

      {/* Edit Block Modal */}
      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          visible={true}
          onSave={handleSaveBlock}
          onCancel={() => {
            setEditingBlock(null);
            setEditingIndex(-1);
          }}
        />
      )}

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Preview Landing Page</span>
            <Segmented
              size="small"
              value={previewMode}
              onChange={(v) => setPreviewMode(v as PreviewMode)}
              options={[
                { value: "desktop", label: "Desktop", icon: <DesktopOutlined /> },
                { value: "tablet", label: "Tablet", icon: <TabletOutlined /> },
                { value: "mobile", label: "Mobile", icon: <MobileOutlined /> },
              ]}
              style={{ marginLeft: 16 }}
            />
          </Space>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width="95%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
        ]}
        styles={{
          body: {
            padding: 0,
            maxHeight: "85vh",
            overflow: "auto",
            background: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
          },
        }}
      >
        <div
          style={{
            width: getPreviewWidth(),
            background: "#fff",
            margin: previewMode !== "desktop" ? "20px 0" : 0,
            boxShadow: previewMode !== "desktop" ? "0 0 20px rgba(0,0,0,0.1)" : "none",
            borderRadius: previewMode !== "desktop" ? 8 : 0,
            overflow: "hidden",
          }}
        >
          <BlockPreview blocks={blocks.filter((b) => !hiddenBlocks.has(b.id))} />
        </div>
      </Modal>
    </div>
  );
}

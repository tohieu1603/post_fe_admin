"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Avatar,
  Row,
  Col,
  Timeline,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  SearchOutlined,
  HistoryOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { User, UserRole, ActivityLog, userApi } from "@/lib/api";

const { Title, Text } = Typography;

interface UsersClientProps {
  initialUsers: User[];
  initialError: string | null;
}

const roleColors: Record<UserRole, string> = {
  admin: "red",
  editor: "blue",
  author: "green",
  viewer: "default",
};

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  author: "Author",
  viewer: "Viewer",
};

export default function UsersClient({ initialUsers, initialError }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Filtered data
  const filteredUsers = useMemo(() => {
    let data = users;

    if (searchText) {
      const search = searchText.toLowerCase();
      data = data.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    if (filterRole) {
      data = data.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== undefined) {
      data = data.filter((user) => user.isActive === (filterStatus === "active"));
    }

    return data;
  }, [users, searchText, filterRole, filterStatus]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (e) {
      message.error("Không thể tải users");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for create/edit
  const openModal = (user?: User) => {
    setEditingUser(user || null);
    form.resetFields();
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      form.setFieldsValue({
        role: "viewer",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userApi.update(editingUser.id, updateData);
        message.success("Cập nhật user thành công");
      } else {
        await userApi.create(values);
        message.success("Tạo user thành công");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id);
      message.success("Xóa user thành công");
      fetchUsers();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Không thể xóa user");
    }
  };

  // Toggle active
  const handleToggleActive = async (id: string) => {
    try {
      await userApi.toggleActive(id);
      message.success("Cập nhật trạng thái thành công");
      fetchUsers();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  };

  // View activity logs
  const viewActivityLogs = async (user: User) => {
    setSelectedUser(user);
    setActivityModalOpen(true);
    setActivityLoading(true);
    try {
      const logs = await userApi.getActivityLogs(user.id, 50);
      setActivityLogs(logs);
    } catch (e) {
      message.error("Không thể tải activity logs");
    } finally {
      setActivityLoading(false);
    }
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

  // Table columns
  const columns: ColumnsType<User> = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div><Text strong>{record.name}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 100,
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Editor", value: "editor" },
        { text: "Author", value: "author" },
        { text: "Viewer", value: "viewer" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role: UserRole) => (
        <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Đăng nhập cuối",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 160,
      render: (date) => date ? formatDate(date) : <Text type="secondary">Chưa đăng nhập</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => formatDate(date).split(",")[0],
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Activity Log">
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => viewActivityLogs(record)}
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
            title="Xóa user"
            description="Bạn có chắc muốn xóa user này?"
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
          <UserOutlined /> Quản lý Users
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm user
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
                placeholder="Tìm kiếm tên, email..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="Role"
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 130 }}
                allowClear
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "editor", label: "Editor" },
                  { value: "author", label: "Author" },
                  { value: "viewer", label: "Viewer" },
                ]}
              />
              <Select
                placeholder="Trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 130 }}
                allowClear
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </Space>
          </Col>
          <Col>
            <Text type="secondary">Tổng: {filteredUsers.length} users</Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} users`,
          }}
          size="middle"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingUser ? "Sửa user" : "Thêm user"}
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
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? "Mật khẩu mới" : "Mật khẩu"}
            rules={editingUser ? [] : [{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={editingUser ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Vui lòng chọn role" }]}
              >
                <Select
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "editor", label: "Editor" },
                    { value: "author", label: "Author" },
                    { value: "viewer", label: "Viewer" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Activity Log Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>Activity Log - {selectedUser?.name}</span>
          </Space>
        }
        open={activityModalOpen}
        onCancel={() => setActivityModalOpen(false)}
        footer={null}
        width={600}
      >
        {activityLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
        ) : activityLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Text type="secondary">Chưa có activity nào</Text>
          </div>
        ) : (
          <Timeline
            items={activityLogs.map((log) => ({
              children: (
                <div>
                  <Text strong>{log.action}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {log.entityType} {log.entityId && `#${log.entityId.substring(0, 8)}`}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatDate(log.createdAt)}
                  </Text>
                </div>
              ),
            }))}
          />
        )}
      </Modal>
    </div>
  );
}

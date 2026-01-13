"use client";

import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Button, Space, Typography } from "antd";
import {
  HomeOutlined,
  FolderOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TagsOutlined,
  PictureOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
  DownOutlined,
  LayoutOutlined,
  FireOutlined,
  BookOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  // Don't render anything if not authenticated (AuthGuard will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const userMenuItems = [
    {
      key: "profile",
      label: (
        <div style={{ minWidth: 150 }}>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: "#1890ff", marginTop: 4 }}>
            Role: {user?.role}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" as const },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  const menuItems = [
    {
      key: "/admin",
      icon: <HomeOutlined />,
      label: <Link href="/admin">Trang chủ</Link>,
    },
    {
      key: "/admin/categories",
      icon: <FolderOutlined />,
      label: <Link href="/admin/categories">Danh mục</Link>,
    },
    {
      key: "/admin/posts",
      icon: <FileTextOutlined />,
      label: <Link href="/admin/posts">Bài viết</Link>,
    },
    {
      key: "/admin/pages",
      icon: <LayoutOutlined />,
      label: <Link href="/admin/pages">Pages</Link>,
    },
    {
      key: "/admin/tags",
      icon: <TagsOutlined />,
      label: <Link href="/admin/tags">Tags</Link>,
    },
    {
      key: "/admin/media",
      icon: <PictureOutlined />,
      label: <Link href="/admin/media">Media</Link>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Users</Link>,
    },
    {
      key: "/admin/authors",
      icon: <TeamOutlined />,
      label: <Link href="/admin/authors">Tác giả</Link>,
    },
    {
      key: "/admin/dictionary",
      icon: <BookOutlined />,
      label: <Link href="/admin/dictionary">Từ điển</Link>,
    },
    {
      key: "/admin/banners",
      icon: <FireOutlined />,
      label: <Link href="/admin/banners">Banners</Link>,
    },
    {
      key: "/admin/seo",
      icon: <GlobalOutlined />,
      label: <Link href="/admin/seo">SEO</Link>,
    },
    {
      key: "/admin/auto-seo",
      icon: <ThunderboltOutlined />,
      label: <Link href="/admin/auto-seo">Auto SEO</Link>,
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: <Link href="/admin/settings">Settings</Link>,
    },
  ];

  const getSelectedKey = () => {
    if (pathname.startsWith("/admin/categories")) return "/admin/categories";
    if (pathname.startsWith("/admin/posts")) return "/admin/posts";
    if (pathname.startsWith("/admin/pages")) return "/admin/pages";
    if (pathname.startsWith("/admin/tags")) return "/admin/tags";
    if (pathname.startsWith("/admin/media")) return "/admin/media";
    if (pathname.startsWith("/admin/users")) return "/admin/users";
    if (pathname.startsWith("/admin/authors")) return "/admin/authors";
    if (pathname.startsWith("/admin/dictionary")) return "/admin/dictionary";
    if (pathname.startsWith("/admin/banners")) return "/admin/banners";
    if (pathname.startsWith("/admin/auto-seo")) return "/admin/auto-seo";
    if (pathname.startsWith("/admin/seo")) return "/admin/seo";
    if (pathname.startsWith("/admin/settings")) return "/admin/settings";
    return "/admin";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{
          borderRight: "1px solid #f0f0f0",
        }}
        trigger={
          <div style={{ padding: "12px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        }
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <h1 style={{
            fontSize: collapsed ? 16 : 18,
            fontWeight: 600,
            margin: 0,
            whiteSpace: "nowrap"
          }}>
            {collapsed ? "MP" : "ManagePost"}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            height: 64,
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
            <Button type="text" style={{ height: "auto", padding: "8px 12px" }}>
              <Space>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <Text strong style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name}
                </Text>
                <DownOutlined style={{ fontSize: 10 }} />
              </Space>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: "#f5f5f5", minHeight: "calc(100vh - 64px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

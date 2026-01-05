"use client";

import { ReactNode } from "react";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

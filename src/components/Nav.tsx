import React, { useState } from "react";
import {
  LogoutOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Tabs, Flex, ConfigProvider, Button } from "antd";
import type { TabsProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

function Nav() {
  const [name, setName] = useState("UwU");
  const navigate = useNavigate();
  const location = useLocation();

  const onChange = (key: string) => {
    navigate(key);
  };

  const getCurrentActiveKey = () => {
    return location.pathname;
  };

  const items: TabsProps['items'] = [
    {
      key: '/Dashboard',
      label: (
        <span>
          <DashboardOutlined style={{ marginRight: 8 }} />
          Dashboard
        </span>
      ),
    },
    {
      key: '/Order',
      label: (
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Orders
        </span>
      ),
    },
    {
      key: '/Billing',
      label: (
        <span>
          <CreditCardOutlined style={{ marginRight: 8 }} />
          Billing
        </span>
      ),
    },
    {
      key: '/Setting',
      label: (
        <span>
          <SettingOutlined style={{ marginRight: 8 }} />
          Settings
        </span>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        },
        components: {
          Tabs: {
            itemColor: '#6b7280',
            itemHoverColor: '#111827',
            itemSelectedColor: '#000000',
            itemActiveColor: '#000000',
            inkBarColor: '#000000',
            titleFontSize: 16,
          },
          Button: {
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          },
        },
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{
          width: "100%",
          height: "64px",
          padding: "0 10rem",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxSizing: "border-box",
        }}
      >
        {/* Left - Restaurant Title */}
        <div style={{ flex: "0 0 auto" }}>
          <h1 style={{
            margin: 0,
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#111827",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            Restaurant
          </h1>
        </div>

        {/* Center - Navigation Tabs */}
        <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
          <Tabs
            activeKey={getCurrentActiveKey()}
            items={items}
            onChange={onChange}
            type="line"
            size="middle"
            style={{
              border: "none",
              height: "64px",
              lineHeight: "64px"
            }}
            tabBarStyle={{
              border: "none",
              marginBottom: 0,
              height: "64px"
            }}
          />
        </div>

        {/* Right - Welcome & Logout */}
        <div style={{ flex: "0 0 auto" }}>
          <Flex align="center" gap={16}>
            <span style={{
              fontSize: "1rem",
              color: "#6b7280",
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              Welcome, {name}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              style={{
                display: "flex",
                alignItems: "center",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 16px",
                height: "auto",
                backgroundColor: "#ffffff",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#000000";
                e.currentTarget.style.borderColor = "#000000";
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6b7280";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              Logout
            </Button>
          </Flex>
        </div>
      </Flex>
    </ConfigProvider>
  );
}

export default Nav;

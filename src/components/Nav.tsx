import { useState } from "react";
import {
  LogoutOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  SettingOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tabs, Flex, ConfigProvider, Button, Drawer, Grid, Dropdown, Avatar } from "antd";
import type { TabsProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function Nav() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const onChange = (key: string) => {
    navigate(key);
    setDrawerVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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

  const profileMenuItems = [
    {
      key: 'logout',
      label: (
        <span style={{ color: '#ef4444' }}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          Logout
        </span>
      ),
      onClick: handleLogout,
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
          padding: screens.lg ? "0 10rem" : screens.md ? "0 1.5rem" : "0 1rem",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxSizing: "border-box",
        }}
      >
        {/* Left - Restaurant Title */}
        <div style={{ flex: "0 0 auto" }}>
          <h1 style={{
            margin: 0,
            fontSize: screens.lg ? "1.8rem" : screens.md ? "1.5rem" : "1.3rem",
            fontWeight: "bold",
            color: "#111827",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            whiteSpace: "nowrap"
          }}>
            Restaurant
          </h1>
        </div>

        {/* Center - Navigation Tabs (Desktop/Tablet only) */}
        {screens.md && (
          <div style={{
            flex: "1",
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
            minWidth: 0
          }}>
            <Tabs
              activeKey={getCurrentActiveKey()}
              items={items}
              onChange={onChange}
              type="line"
              size={screens.lg ? "middle" : "small"}
              style={{
                border: "none",
                height: "64px",
                lineHeight: "64px",
                maxWidth: "100%"
              }}
              tabBarStyle={{
                border: "none",
                marginBottom: 0,
                height: "64px",
                whiteSpace: "nowrap",
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            />
          </div>
        )}

        {/* Right - Welcome & Logout (Desktop/Tablet) / Menu Button (Mobile) */}
        <div style={{ flex: "0 0 auto" }}>
          <Flex align="center" gap={screens.lg ? 16 : 12}>
            {screens.lg && user && (
              <span style={{
                fontSize: "1rem",
                color: "#6b7280",
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                whiteSpace: "nowrap"
              }}>
                Welcome, {user.name}
              </span>
            )}

            {!screens.md ? (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: "18px" }} />}
                onClick={() => setDrawerVisible(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  width: "42px",
                  height: "42px",
                  padding: 0,
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
              />
            ) : (
              <Button
                type="text"
                icon={<LogoutOutlined style={{ fontSize: "16px" }} />}
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "0 16px",
                  height: "40px",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease",
                  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
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
            )}
          </Flex>
        </div>
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={(
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            <span style={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "#111827",
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              Restaurant
            </span>
            {user && (
              <span style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
              }}>
                Welcome, {user.name}
              </span>
            )}
          </div>
        )}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
        styles={{
          body: { padding: 0 },
          header: { borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }
        }}
      >
        <div style={{ padding: "0.5rem 0 1rem 0" }}>
          {items.map((item, index) => (
            <div
              key={item.key}
              onClick={() => onChange(item.key!)}
              style={{
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                backgroundColor: getCurrentActiveKey() === item.key ? "#f8fafc" : "transparent",
                borderLeft: getCurrentActiveKey() === item.key ? "4px solid #000" : "4px solid transparent",
                transition: "all 0.2s ease",
                fontSize: "1.1rem",
                fontWeight: getCurrentActiveKey() === item.key ? "600" : "400",
                color: getCurrentActiveKey() === item.key ? "#111827" : "#4b5563",
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                borderBottom: index < items.length - 1 ? "1px solid #f1f5f9" : "none"
              }}
              onMouseEnter={(e) => {
                if (getCurrentActiveKey() !== item.key) {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.color = "#111827";
                }
              }}
              onMouseLeave={(e) => {
                if (getCurrentActiveKey() !== item.key) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#4b5563";
                }
              }}
            >
              {item.label}
            </div>
          ))}

          <div style={{
            padding: "20px 24px",
            borderTop: "2px solid #f0f0f0",
            marginTop: "1rem",
            backgroundColor: "#fafbfc"
          }}>
            <Button
              type="text"
              icon={<LogoutOutlined style={{ fontSize: "16px" }} />}
              onClick={handleLogout}
              block
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "14px 20px",
                height: "auto",
                fontSize: "1rem",
                fontWeight: "500",
                backgroundColor: "#ffffff",
                transition: "all 0.2s ease",
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
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
          </div>
        </div>
      </Drawer>
    </ConfigProvider>
  );
}

export default Nav;

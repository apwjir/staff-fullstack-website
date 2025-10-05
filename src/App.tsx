import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AuthProvider, { useAuth } from './components/AuthProvider';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Order from './pages/Order';
import Billing from './pages/Billing';
import Setting from './pages/Setting';
import { Layout, Menu, Button, Typography, Spin } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AppLayout: React.FC = () => {
  const { logout } = useAuth();
  const [selectedKey, setSelectedKey] = React.useState('1');

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      component: <Dashboard />,
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: 'Orders',
      component: <Order />,
    },
    {
      key: '3',
      icon: <DollarOutlined />,
      label: 'Billing',
      component: <Billing />,
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: 'Settings',
      component: <Setting />,
    },
  ];

  const selectedItem = menuItems.find(item => item.key === selectedKey);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ background: '#fff' }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          textAlign: 'center'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1c1919ff' }}>
            Staff Admin
          </Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          onClick={({ key }) => setSelectedKey(key)}
        />

        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16
        }}>
          <Button
            type="default"
            icon={<LogoutOutlined />}
            onClick={logout}
            block
          >
            Logout
          </Button>
        </div>
      </Sider>

      <Layout>
        <Content style={{ background: '#f0f2f5' }}>
          {selectedItem?.component}
        </Content>
      </Layout>
    </Layout>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <LoginForm />;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1c1919ff',
          borderRadius: 8,
        },
      }}
    >
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
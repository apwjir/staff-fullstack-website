import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AuthProvider, { useAuth } from './components/AuthProvider';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import LoginPage from './components/LoginPage';
import Dashboard from './pages/Dashboard';
import Order from './pages/Order';
import Billing from './pages/Billing';
import Setting from './pages/Setting';
import { Layout, Menu, Button, Typography, Spin, Badge } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  WifiOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AppLayout: React.FC = () => {
  const { logout } = useAuth();
  const { connected, connectedTables } = useSocket();
  const [selectedKey, setSelectedKey] = React.useState('1');


  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: 'Orders',
    },
    {
      key: '3',
      icon: <DollarOutlined />,
      label: 'Billing',
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderSelectedComponent = () => {
    switch (selectedKey) {
      case '1':
        return <Dashboard />;
      case '2':
        return <Order />;
      case '3':
        return <Billing />;
      case '4':
        return <Setting />;
      default:
        return <Dashboard />;
    }
  };

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
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Badge
              status={connected ? 'success' : 'error'}
              text={connected ? 'Connected' : 'Disconnected'}
            />
            {connectedTables.length > 0 && (
              <Badge
                count={connectedTables.length}
                showZero={false}
                title={`${connectedTables.length} active table(s)`}
                style={{ backgroundColor: '#52c41a' }}
              />
            )}
          </div>
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
          {renderSelectedComponent()}
        </Content>
      </Layout>
    </Layout>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log('App: Auth state - isAuthenticated:', isAuthenticated, 'loading:', loading);

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

  return isAuthenticated ? <AppLayout /> : <LoginPage />;
};

// Error Boundary Component
class SocketErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    if (error.message.includes('useSocket must be used within a SocketProvider')) {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SocketProvider Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <div>Connecting to real-time services...</div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
          <SocketProvider>
            <SocketErrorBoundary>
              <AppContent />
            </SocketErrorBoundary>
          </SocketProvider>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
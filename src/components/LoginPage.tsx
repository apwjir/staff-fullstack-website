import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider, ConfigProvider, App } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from './AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notification } = App.useApp();

  // Check for OAuth error from callback and display it
  React.useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const errorMessage = decodeURIComponent(error);

      // Use App's notification hook which works with themes
      notification.error({
        message: 'Access Denied',
        description: errorMessage,
        duration: 8,
        placement: 'topRight',
      });

      // Clear the error from URL without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, notification]);

  // Apply full-screen styles only for login page
  React.useEffect(() => {
    // Save original styles
    const originalRootStyle = document.getElementById('root')?.style.cssText || '';
    const originalBodyStyle = document.body.style.cssText || '';

    // Apply login-specific styles
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.maxWidth = 'none';
      rootElement.style.margin = '0';
      rootElement.style.padding = '0';
      rootElement.style.textAlign = 'left';
      rootElement.style.width = '100vw';
      rootElement.style.height = '100vh';
    }

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    document.body.style.display = 'block';

    // Cleanup function to restore original styles
    return () => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.cssText = originalRootStyle;
      }
      document.body.style.cssText = originalBodyStyle;
    };
  }, []);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success('Login successful!');
        navigate('/', { replace: true });
      } else {
        message.error('Invalid email or password');
      }
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Redirect to Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_PROXY_PATH || '/api'}/auth/google`;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1c1919ff',
          borderRadius: 6,
        },
      }}
    >
      <div style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {/* Left side - Image (70%) */}
        <div style={{
          width: '70%',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1567521464027-f127ff144326?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            zIndex: 1
          }}>
            <Title level={1} style={{ color: 'white', fontSize: '3.5rem', marginBottom: '1rem' }}>
              Restaurant Admin
            </Title>
            <Text style={{
              color: 'white',
              fontSize: '1.2rem',
              display: 'block',
              maxWidth: '500px',
              lineHeight: '1.6'
            }}>
              Manage your restaurant operations efficiently with our comprehensive admin system
            </Text>
          </div>
        </div>

        {/* Right side - Login Form (30%) */}
        <div style={{
          width: '30%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          backgroundColor: 'white'
        }}>
          <div style={{ width: '100%', maxWidth: '320px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <Title level={3} style={{
                color: '#1c1919ff',
                marginBottom: '0.5rem',
                fontWeight: 600
              }}>
                Welcome Back
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Sign in to your account
              </Text>
            </div>

            {/* Staff Login */}
            <div style={{ marginBottom: '2rem' }}>
              <Text style={{
                display: 'block',
                marginBottom: '1rem',
                color: '#374151',
                fontSize: '15px',
                fontWeight: 500
              }}>
                Staff Login
              </Text>

              <Form
                name="staffLogin"
                onFinish={onFinish}
                layout="vertical"
                size="middle"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                  style={{ marginBottom: '16px' }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Email"
                    style={{ height: '40px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                    placeholder="Password"
                    style={{ height: '40px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: '0px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{ height: '40px', fontWeight: 500 }}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            </div>

            {/* Divider */}
            <Divider style={{ margin: '1.5rem 0', fontSize: '12px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>OR</Text>
            </Divider>

            {/* Google Login */}
            <div style={{ marginBottom: '2rem' }}>
              <Text style={{
                display: 'block',
                marginBottom: '1rem',
                color: '#374151',
                fontSize: '15px',
                fontWeight: 500
              }}>
                Internship Login
              </Text>

              <Button
                icon={<GoogleOutlined />}
                loading={googleLoading}
                onClick={handleGoogleLogin}
                block
                style={{
                  height: '40px',
                  border: '1px solid #E5E7EB',
                  color: '#374151',
                  fontWeight: 500
                }}
              >
                Continue with Google
              </Button>

              <Text type="secondary" style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '0.5rem',
                fontSize: '12px'
              }}>
                For internship members only
              </Text>
            </div>

            {/* Demo Credentials */}
            {/* <div style={{
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '6px',
              border: '1px solid #E5E7EB'
            }}>
              <Text style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '13px',
                fontWeight: 500
              }}>
                Demo Credentials:
              </Text>
              <Text style={{ fontSize: '12px', color: '#6B7280', display: 'block' }}>
                Admin: admin@restaurant.com / admin123
              </Text>
              <Text style={{ fontSize: '12px', color: '#6B7280', display: 'block' }}>
                Staff: staff@restaurant.com / staff123
              </Text>
            </div> */}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
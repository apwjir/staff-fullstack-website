import React, { useEffect, useState } from 'react';
import { Spin, Layout } from 'antd';
import { useAuth } from './AuthProvider';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: Auth state changed - loading:', loading, 'isAuthenticated:', isAuthenticated);

    const verifyAuth = async () => {
      if (!loading) {
        console.log('ProtectedRoute: Initial auth check complete, doing additional verification...');
        // Double-check authentication
        try {
          const isValid = await checkAuth();
          console.log('ProtectedRoute: Additional verification result:', isValid);
        } catch (error) {
          console.error('ProtectedRoute: Additional verification error:', error);
        } finally {
          setVerifying(false);
          console.log('ProtectedRoute: Verification complete, verifying=false');
        }
      }
    };

    verifyAuth();
  }, [loading, checkAuth]);

  // Show loading while initial auth check or verification is happening
  if (loading || verifying) {
    console.log('ProtectedRoute: Showing loading spinner - loading:', loading, 'verifying:', verifying);
    return (
      <Layout style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Spin size="large" />
      </Layout>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, showing login page');
    return <LoginPage />;
  }

  // If authenticated, render the protected content
  console.log('ProtectedRoute: User authenticated, showing dashboard');
  return <>{children}</>;
};

export default ProtectedRoute;
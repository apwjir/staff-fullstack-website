import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { notification } from 'antd';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinStaff: () => void;
  leaveStaff: () => void;
  sendMessageToTable: (tableId: number, message: string, type: string) => void;
  connectedTables: number[];
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectedTables, setConnectedTables] = useState<number[]>([]);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server:', newSocket.id);
      setConnected(true);

      notification.success({
        message: 'Connected',
        description: 'Real-time connection established',
        placement: 'topRight',
        duration: 2,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      setConnected(false);

      notification.warning({
        message: 'Disconnected',
        description: 'Real-time connection lost. Attempting to reconnect...',
        placement: 'topRight',
        duration: 3,
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      notification.error({
        message: 'Connection Error',
        description: 'Failed to establish real-time connection',
        placement: 'topRight',
        duration: 4,
      });
    });

    // Staff-specific event handlers
    newSocket.on('joined_staff', (data) => {
      console.log('👥 Joined staff room:', data);
      notification.info({
        message: 'Staff Mode',
        description: 'You are now receiving real-time updates',
        placement: 'topRight',
        duration: 2,
      });
    });

    newSocket.on('connected_tables', (data) => {
      console.log('🍽️ Connected tables:', data.tables);
      setConnectedTables(data.tables);
    });

    // Real-time business event handlers
    newSocket.on('order_created', (order) => {
      console.log('📋 New order received:', order);
      notification.info({
        message: 'New Order!',
        description: `Table ${order.tableId} placed a new order (#${order.id})`,
        placement: 'topRight',
        duration: 4,
      });

      // Trigger a custom event for components to listen to
      window.dispatchEvent(new CustomEvent('orderCreated', { detail: order }));
    });

    newSocket.on('order_status_updated', (order) => {
      console.log('📋 Order status updated:', order);
      notification.info({
        message: 'Order Updated',
        description: `Order #${order.id} status: ${order.status}`,
        placement: 'topRight',
        duration: 3,
      });

      window.dispatchEvent(new CustomEvent('orderStatusUpdated', { detail: order }));
    });

    newSocket.on('bill_created', (bill) => {
      console.log('💰 Bill created:', bill);
      notification.success({
        message: 'Bill Created',
        description: `Bill #${bill.id} for Table ${bill.tableId} - $${bill.totalAmount}`,
        placement: 'topRight',
        duration: 4,
      });

      window.dispatchEvent(new CustomEvent('billCreated', { detail: bill }));
    });

    newSocket.on('bill_updated', (bill) => {
      console.log('💰 Bill updated:', bill);
      notification.info({
        message: 'Bill Updated',
        description: `Bill #${bill.id} updated - $${bill.totalAmount}`,
        placement: 'topRight',
        duration: 3,
      });

      window.dispatchEvent(new CustomEvent('billUpdated', { detail: bill }));
    });

    newSocket.on('bill_paid', (bill) => {
      console.log('💰 Bill paid:', bill);
      notification.success({
        message: 'Payment Received',
        description: `Bill #${bill.id} has been paid - $${bill.totalAmount}`,
        placement: 'topRight',
        duration: 4,
      });

      window.dispatchEvent(new CustomEvent('billPaid', { detail: bill }));
    });

    // Customer interaction handlers
    newSocket.on('customer_joined_table', (data) => {
      console.log('👋 Customer joined table:', data);
      setConnectedTables(prev => [...new Set([...prev, data.tableId])]);

      notification.info({
        message: 'Customer Activity',
        description: `Customer joined Table ${data.tableId}`,
        placement: 'topRight',
        duration: 3,
      });
    });

    newSocket.on('customer_left_table', (data) => {
      console.log('👋 Customer left table:', data);

      notification.info({
        message: 'Customer Activity',
        description: `Customer left Table ${data.tableId}`,
        placement: 'topRight',
        duration: 2,
      });
    });

    newSocket.on('customer_message', (data) => {
      console.log('💬 Customer message:', data);

      notification.info({
        message: `Message from Table ${data.tableId}`,
        description: data.message,
        placement: 'topRight',
        duration: 5,
      });

      window.dispatchEvent(new CustomEvent('customerMessage', { detail: data }));
    });

    // System message handler
    newSocket.on('system_message', (data) => {
      console.log('📢 System message:', data);

      const notificationType = data.type === 'error' ? 'error' :
                              data.type === 'warning' ? 'warning' : 'info';

      notification[notificationType]({
        message: 'System Notification',
        description: data.message,
        placement: 'topRight',
        duration: 4,
      });
    });

    // Error handler
    newSocket.on('error', (data) => {
      console.error('🔴 Socket error:', data);
      notification.error({
        message: 'Error',
        description: data.message || 'An error occurred',
        placement: 'topRight',
        duration: 4,
      });
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      newSocket.close();
    };
  }, []);

  // Helper functions
  const joinStaff = () => {
    if (socket && connected) {
      socket.emit('join_staff');
    }
  };

  const leaveStaff = () => {
    if (socket && connected) {
      socket.emit('leave_staff');
    }
  };

  const sendMessageToTable = (tableId: number, message: string, type: string = 'info') => {
    if (socket && connected) {
      socket.emit('staff_message_to_table', { tableId, message, type });

      notification.success({
        message: 'Message Sent',
        description: `Message sent to Table ${tableId}`,
        placement: 'topRight',
        duration: 2,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinStaff,
        leaveStaff,
        sendMessageToTable,
        connectedTables,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
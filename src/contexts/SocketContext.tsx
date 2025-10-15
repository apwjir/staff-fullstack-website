import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { notification } from 'antd';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  joinStaff: () => void;
  leaveStaff: () => void;
  sendMessageToTable: (tableId: number, message: string, type: string) => void;
  connectedTables: number[];
  reconnect: () => void;
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
  const [connecting, setConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectedTables, setConnectedTables] = useState<number[]>([]);
  const [hasJoinedStaff, setHasJoinedStaff] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 10;
  const reconnectDelay = 2000;

  const connectSocket = useCallback(() => {
    if (connecting || (socket && socket.connected)) return;

    setConnecting(true);

    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: false, // Handle manually for better control
      timeout: 5000,
      forceNew: true,
    });

    const setupSocketEventHandlers = (socket: Socket) => {

      // Connection event handlers
      socket.on('connect', () => {
        setConnected(true);
        setConnecting(false);
        setConnectionAttempts(0);

        notification.success({
          message: 'Connected',
          description: 'Real-time connection established',
          placement: 'topRight',
          duration: 2,
        });

        // Start ping interval to maintain connection health
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (socket.connected) {
            socket.emit('ping');
          }
        }, 30000); // Ping every 30 seconds
      });

      socket.on('disconnect', (reason) => {
        setConnected(false);
        setConnecting(false);
        setHasJoinedStaff(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        notification.warning({
          message: 'Disconnected',
          description: 'Real-time connection lost. Attempting to reconnect...',
          placement: 'topRight',
          duration: 3,
        });

        // Only attempt reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && connectionAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        setConnecting(false);

        if (connectionAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        } else {
          notification.error({
            message: 'Connection Error',
            description: 'Failed to establish real-time connection after multiple attempts',
            placement: 'topRight',
            duration: 4,
          });
        }
      });

      socket.on('pong', () => {
        // Connection is healthy
      });

      // Staff-specific event handlers
      socket.on('joined_staff', (data) => {
        setHasJoinedStaff(true);
        notification.info({
          message: 'Staff Mode',
          description: 'You are now receiving real-time updates',
          placement: 'topRight',
          duration: 2,
        });
      });

      socket.on('connected_tables', (data) => {
        setConnectedTables(data.tables);
      });

      // Real-time business event handlers
      socket.on('order_created', (order) => {
        notification.info({
          message: 'New Order!',
          description: `Table ${order.tableId} placed a new order (#${order.id})`,
          placement: 'topRight',
          duration: 4,
        });

        // Trigger a custom event for components to listen to
        window.dispatchEvent(new CustomEvent('orderCreated', { detail: order }));
      });

      socket.on('order_status_updated', (order) => {
        notification.info({
          message: 'Order Updated',
          description: `Order #${order.id} status: ${order.status}`,
          placement: 'topRight',
          duration: 3,
        });

        window.dispatchEvent(new CustomEvent('orderStatusUpdated', { detail: order }));
      });

      socket.on('bill_created', (bill) => {
        notification.success({
          message: 'Bill Created',
          description: `Bill #${bill.id} for Table ${bill.tableId} - $${bill.totalAmount}`,
          placement: 'topRight',
          duration: 4,
        });

        window.dispatchEvent(new CustomEvent('billCreated', { detail: bill }));
      });

      socket.on('bill_updated', (bill) => {
        notification.info({
          message: 'Bill Updated',
          description: `Bill #${bill.id} updated - $${bill.totalAmount}`,
          placement: 'topRight',
          duration: 3,
        });

        window.dispatchEvent(new CustomEvent('billUpdated', { detail: bill }));
      });

      socket.on('bill_paid', (bill) => {
        notification.success({
          message: 'Payment Received',
          description: `Bill #${bill.id} has been paid - $${bill.totalAmount}`,
          placement: 'topRight',
          duration: 4,
        });

        window.dispatchEvent(new CustomEvent('billPaid', { detail: bill }));
      });

      // Customer interaction handlers
      socket.on('customer_joined_table', (data) => {
        setConnectedTables(prev => [...new Set([...prev, data.tableId])]);

        notification.info({
          message: 'Customer Activity',
          description: `Customer joined Table ${data.tableId}`,
          placement: 'topRight',
          duration: 3,
        });

        window.dispatchEvent(new CustomEvent('tableStatusUpdated', {
          detail: { tableId: data.tableId, status: 'OCCUPIED' }
        }));
      });

      socket.on('customer_left_table', (data) => {
        notification.info({
          message: 'Customer Activity',
          description: `Customer left Table ${data.tableId}`,
          placement: 'topRight',
          duration: 2,
        });
      });

      socket.on('customer_message', (data) => {
        notification.info({
          message: `Message from Table ${data.tableId}`,
          description: data.message,
          placement: 'topRight',
          duration: 5,
        });

        window.dispatchEvent(new CustomEvent('customerMessage', { detail: data }));
      });

      // System message handler
      socket.on('system_message', (data) => {
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
      socket.on('error', (data) => {
        console.error('Socket error:', data.message || 'Unknown error');
        notification.error({
          message: 'Error',
          description: data.message || 'An error occurred',
          placement: 'topRight',
          duration: 4,
        });
      });
    };

    setupSocketEventHandlers(newSocket);
    setSocket(newSocket);
  }, [connecting, socket, connectionAttempts]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionAttempts(prev => prev + 1);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectSocket();
    }, reconnectDelay * Math.min(connectionAttempts + 1, 5)); // Exponential backoff
  }, [connectSocket, connectionAttempts]);

  useEffect(() => {
    connectSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (socket) {
        socket.removeAllListeners();
        socket.close();
      }
    };
  }, []);

  // Auto-join staff room when connected
  useEffect(() => {
    if (socket && connected && !hasJoinedStaff) {
      socket.emit('join_staff');
    }
  }, [socket, connected, hasJoinedStaff]);

  // Helper functions
  const joinStaff = useCallback(() => {
    if (socket && connected && !hasJoinedStaff) {
      socket.emit('join_staff');
    }
  }, [socket, connected, hasJoinedStaff]);

  const leaveStaff = useCallback(() => {
    if (socket && connected) {
      socket.emit('leave_staff');
    }
  }, [socket, connected]);

  const sendMessageToTable = useCallback((tableId: number, message: string, type: string = 'info') => {
    if (socket && connected) {
      socket.emit('staff_message_to_table', { tableId, message, type });

      notification.success({
        message: 'Message Sent',
        description: `Message sent to Table ${tableId}`,
        placement: 'topRight',
        duration: 2,
      });
    }
  }, [socket, connected]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.removeAllListeners();
      socket.close();
    }
    setConnectionAttempts(0);
    connectSocket();
  }, [socket, connectSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        connecting,
        connectionAttempts,
        maxReconnectAttempts,
        joinStaff,
        leaveStaff,
        sendMessageToTable,
        connectedTables,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
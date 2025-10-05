// API Configuration for Admin Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const CUSTOMER_FRONTEND_URL = import.meta.env.VITE_CUSTOMER_FRONTEND_URL || 'http://localhost:5173';

// Types matching backend schema
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  foodtype: 'RICE' | 'NOODLE' | 'DESSERT' | 'DRINK';
  isAvailable: boolean;
}

export interface Table {
  id: number;
  tableNumber: number;
  status: 'AVAILABLE' | 'OCCUPIED';
  capacity: number;
  qrCodeToken: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  note: string | null;
  menuItem: MenuItem;
}

export interface Order {
  id: number;
  tableId: number;
  sessionId: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  queuePos: number | null;
  orderItems: OrderItem[];
  billId?: number | null;
}

export interface Bill {
  id: number;
  tableId: number;
  totalAmount: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
  orders: Order[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// API Service Class
class AdminApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    this.authToken = localStorage.getItem('adminToken');
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('adminToken', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('adminToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const result = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setAuthToken(result.access_token);
    return result;
  }

  async logout() {
    this.clearAuthToken();
  }

  // Tables API
  async getTables(): Promise<Table[]> {
    return this.request<Table[]>('/tables');
  }

  async getTable(id: number): Promise<Table> {
    return this.request<Table>(`/tables/${id}`);
  }

  async updateTableStatus(id: number, status: 'AVAILABLE' | 'OCCUPIED'): Promise<Table> {
    return this.request<Table>(`/tables/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async generateTableQR(tableId: number): Promise<{ qrCode: string; token: string }> {
    return this.request<{ qrCode: string; token: string }>(`/tables/${tableId}/qr`);
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async getOrderQueue(): Promise<Order[]> {
    return this.request<Order[]>('/orders/queue');
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async updateOrderStatus(id: number, status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Menu API
  async getMenuItems(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menu');
  }

  async getMenuItem(id: number): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu/${id}`);
  }

  async createMenuItem(menuItem: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    return this.request<MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(menuItem),
    });
  }

  async updateMenuItem(id: number, menuItem: Partial<MenuItem>): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(menuItem),
    });
  }

  async deleteMenuItem(id: number): Promise<void> {
    return this.request<void>(`/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Bills API
  async getBills(): Promise<Bill[]> {
    return this.request<Bill[]>('/bills');
  }

  async getBill(id: number): Promise<Bill> {
    return this.request<Bill>(`/bills/${id}`);
  }

  async createBill(tableId: number, orderIds: number[]): Promise<Bill> {
    return this.request<Bill>('/bills', {
      method: 'POST',
      body: JSON.stringify({ tableId, orderIds }),
    });
  }

  async markBillAsPaid(id: number): Promise<Bill> {
    return this.request<Bill>(`/bills/${id}/pay`, {
      method: 'PATCH',
    });
  }

  // Dashboard/Stats API
  async getDashboardStats(): Promise<{
    totalTables: number;
    availableTables: number;
    occupiedTables: number;
    totalOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    totalRevenue: number;
    todayRevenue: number;
  }> {
    const [tables, orders, bills] = await Promise.all([
      this.getTables(),
      this.getOrders(),
      this.getBills(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBills = bills.filter(bill =>
      new Date(bill.createdAt) >= today && bill.isPaid
    );

    return {
      totalTables: tables.length,
      availableTables: tables.filter(t => t.status === 'AVAILABLE').length,
      occupiedTables: tables.filter(t => t.status === 'OCCUPIED').length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      inProgressOrders: orders.filter(o => o.status === 'IN_PROGRESS').length,
      completedOrders: orders.filter(o => o.status === 'DONE').length,
      totalRevenue: bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0),
      todayRevenue: todayBills.reduce((sum, b) => sum + b.totalAmount, 0),
    };
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService();

// Helper functions for data transformation
export const mapTableStatus = (backendStatus: 'AVAILABLE' | 'OCCUPIED'): 'available' | 'occupied' => {
  return backendStatus.toLowerCase() as 'available' | 'occupied';
};

export const mapOrderStatus = (backendStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'): 'waiting' | 'cooking' | 'done' => {
  switch (backendStatus) {
    case 'PENDING':
      return 'waiting';
    case 'IN_PROGRESS':
      return 'cooking';
    case 'DONE':
      return 'done';
    default:
      return 'waiting';
  }
};

export const mapFrontendOrderStatus = (frontendStatus: 'waiting' | 'cooking' | 'done'): 'PENDING' | 'IN_PROGRESS' | 'DONE' => {
  switch (frontendStatus) {
    case 'waiting':
      return 'PENDING';
    case 'cooking':
      return 'IN_PROGRESS';
    case 'done':
      return 'DONE';
    default:
      return 'PENDING';
  }
};
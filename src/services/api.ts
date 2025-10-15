// API Configuration for Admin Frontend
const API_BASE_URL = import.meta.env.VITE_API_PROXY_PATH || '/api';
// const CUSTOMER_FRONTEND_URL = import.meta.env.VITE_CUSTOMER_FRONTEND_URL || 'http://localhost:5173';

// Types matching backend schema
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  foodtype: 'RICE' | 'NOODLE' | 'DESSERT' | 'DRINK';
  isAvailable: boolean;
  photoUrl?: string | null;
  photoId?: string | null;
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
  userType: 'STAFF' | 'INTERNSHIP';
  picture?: string | null;
  createdAt: string;
}

// API Service Class
class AdminApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies in requests
      ...options,
    };


    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status} for ${endpoint}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: User }> {
    const result = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Token is now in cookie, no need to store it
    return result;
  }

  async logout() {
    // Call backend to clear cookie
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Tables API
  async getTables(): Promise<Table[]> {
    return this.request<Table[]>('/tables');
  }

  async getTable(id: number): Promise<Table> {
    return this.request<Table>(`/tables/${id}`);
  }

  async createTable(tableData: { tableNumber: number; capacity: number }): Promise<Table> {
    return this.request<Table>('/tables', {
      method: 'POST',
      body: JSON.stringify(tableData),
    });
  }

  async updateTableStatus(id: number, status: 'AVAILABLE' | 'OCCUPIED'): Promise<Table> {
    return this.request<Table>(`/tables/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async toggleTableStatusManually(id: number, status: 'AVAILABLE' | 'OCCUPIED'): Promise<Table> {
    return this.request<Table>(`/tables/${id}/status/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getTableWithStatus(id: number): Promise<Table & {
    hasActiveSessions: boolean;
    activeSessionsCount: number;
    latestSessionId: string | null;
  }> {
    return this.request(`/tables/${id}/status`);
  }

  async updateTable(id: number, tableData: { tableNumber?: number; capacity?: number }): Promise<Table> {
    return this.request<Table>(`/tables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(tableData),
    });
  }

  async deleteTable(id: number): Promise<void> {
    return this.request<void>(`/tables/${id}`, {
      method: 'DELETE',
    });
  }

  async generateTableQR(tableId: number): Promise<{
    tableId: number;
    tableNumber: number;
    qrCodeToken: string;
    url: string;
    capacity: number;
  }> {
    return this.request<{
      tableId: number;
      tableNumber: number;
      qrCodeToken: string;
      url: string;
      capacity: number;
    }>(`/tables/${tableId}/qr`);
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    // Since backend only has /orders/queue for PENDING orders,
    // we need to create a workaround to get all orders
    try {
      // Try to get all orders - this might not exist yet
      return this.request<Order[]>('/orders');
    } catch (error) {
      // Fallback: get pending orders from queue
      console.warn('Full orders endpoint not available, using queue only');
      return this.request<Order[]>('/orders/queue');
    }
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

  // Users API
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async createUser(userData: { name: string; email: string; password: string }): Promise<User> {
    return this.request<User>('/users/staff', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createInternshipUser(email: string): Promise<User> {
    return this.request<User>('/users/internship', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updateUser(id: number, userData: { name?: string }): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
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

  async createMenuItemWithImage(menuItem: Omit<MenuItem, 'id' | 'photoUrl' | 'photoId'>, imageFile?: File): Promise<MenuItem> {
    if (!imageFile) {
      // If no image, use regular create method
      return this.createMenuItem(menuItem);
    }

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('name', menuItem.name);
    formData.append('price', menuItem.price.toString());
    formData.append('foodtype', menuItem.foodtype);
    if (menuItem.description) {
      formData.append('description', menuItem.description);
    }
    formData.append('isAvailable', menuItem.isAvailable.toString());
    formData.append('image', imageFile);

    const url = `${this.baseUrl}/menu/with-image`;
    const config: RequestInit = {
      method: 'POST',
      credentials: 'include',
      body: formData,
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async updateMenuItem(id: number, menuItem: Partial<MenuItem>): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(menuItem),
    });
  }

  async updateMenuItemWithImage(id: number, menuItem: Partial<Omit<MenuItem, 'id' | 'photoUrl' | 'photoId'>>, imageFile?: File): Promise<MenuItem> {
    if (!imageFile) {
      // If no image, use regular update method
      return this.updateMenuItem(id, menuItem);
    }

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    if (menuItem.name !== undefined) formData.append('name', menuItem.name);
    if (menuItem.price !== undefined) formData.append('price', menuItem.price.toString());
    if (menuItem.foodtype !== undefined) formData.append('foodtype', menuItem.foodtype);
    if (menuItem.description !== undefined) formData.append('description', menuItem.description || '');
    if (menuItem.isAvailable !== undefined) formData.append('isAvailable', menuItem.isAvailable.toString());
    formData.append('image', imageFile);

    const url = `${this.baseUrl}/menu/${id}/with-image`;
    const config: RequestInit = {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
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
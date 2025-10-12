import { useState, useEffect } from "react";
import { Layout, Card, Row, Col, Button, Tag, Typography, Select, message, Spin, DatePicker } from "antd";
import {
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from 'dayjs';
import { adminApiService, mapOrderStatus, mapFrontendOrderStatus, type Order as BackendOrder, type OrderItem as BackendOrderItem, type MenuItem } from "../services/api";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  note?: string;
  menuItem?: MenuItem;
}

interface Order {
  id: number;
  tableId: number;
  sessionId: string | null;
  status: "waiting" | "cooking" | "done";
  createdAt: string;
  updatedAt: string;
  queuePos: number | null;
  billId?: number | null;
  items: OrderItem[];
}

export default function Order() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Default to today

  // Helper function to check if order is from selected date
  const isOrderFromSelectedDate = (orderDate: string, targetDate: Dayjs) => {
    const orderDay = dayjs(orderDate);
    return orderDay.format('YYYY-MM-DD') === targetDate.format('YYYY-MM-DD');
  };

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const backendOrders = await adminApiService.getOrders();

        // Convert backend orders to frontend format
        const frontendOrders: Order[] = backendOrders.map((order: BackendOrder) => ({
          id: order.id,
          tableId: order.tableId,
          sessionId: order.sessionId,
          status: mapOrderStatus(order.status),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          queuePos: order.queuePos,
          billId: order.billId,
          items: order.orderItems.map((item: BackendOrderItem) => ({
            id: item.id,
            orderId: item.orderId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            note: item.note,
            menuItem: item.menuItem,
          })),
        }));

        setOrders(frontendOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
        message.error('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const updateOrderStatus = async (
    id: number,
    status: "waiting" | "cooking" | "done"
  ) => {
    try {
      // Convert frontend status to backend status
      const backendStatus = mapFrontendOrderStatus(status);

      // Update status via API
      await adminApiService.updateOrderStatus(id, backendStatus);

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                status,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );

      message.success(`Order #${id} status updated to ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Failed to update order status. Please try again.");
    }
  };

  // Filter orders by selected date first, then by status
  const dateFilteredOrders = orders.filter(order => isOrderFromSelectedDate(order.createdAt, selectedDate));

  const totalOrders = dateFilteredOrders.length;
  const waitingCount = dateFilteredOrders.filter((o) => o.status === "waiting").length;
  const cookingCount = dateFilteredOrders.filter((o) => o.status === "cooking").length;
  const doneCount = dateFilteredOrders.filter((o) => o.status === "done").length;

  const getTag = (status: string) => {
    switch (status) {
      case "waiting":
        return (
          <Tag color="gold" icon={<ClockCircleOutlined />}>
            Waiting
          </Tag>
        );
      case "cooking":
        return (
          <Tag color="orange" icon={<FireOutlined />}>
            Cooking
          </Tag>
        );
      case "done":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Done
          </Tag>
        );
      default:
        return null;
    }
  };

  const filteredOrders =
    filter === "all" ? dateFilteredOrders : dateFilteredOrders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Content style={{ margin: "0 10rem", paddingTop: "2rem" }} className="mobile-responsive-content">
        {/* Title */}
        <Title level={2} style={{ fontSize: 32, marginBottom: 4 }} className="mobile-responsive-title">
          Orders Management
        </Title>
        <Text type="secondary">Track and manage all restaurant orders</Text>

        {/* Stats */}
        <Row gutter={[24, 24]} style={{ marginTop: "2rem" }} className="mobile-responsive-stats">
          {[
            { label: "Total Orders", value: totalOrders, color: "#111827" },
            { label: "Waiting", value: waitingCount, color: "orange" },
            { label: "Cooking", value: cookingCount, color: "red" },
            { label: "Done", value: doneCount, color: "green" },
          ].map((stat) => (
            <Col xs={24} sm={12} md={6} key={stat.label}>
              <Card style={{ borderRadius: 12 }}>
                <Text>{stat.label}</Text>
                <Title level={2} style={{ marginTop: 4, color: stat.color }}>
                  {stat.value}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text strong>Filter by date:</Text>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              format="YYYY-MM-DD"
              style={{ width: 150 }}
              placeholder="Select date"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text strong>Filter by status:</Text>
            <Select
              value={filter}
              style={{ width: 150 }}
              onChange={(value) => setFilter(value)}
            >
              <Option value="all">All Orders</Option>
              <Option value="waiting">Waiting</Option>
              <Option value="cooking">Cooking</Option>
              <Option value="done">Done</Option>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        <Row gutter={[16, 16]} style={{ marginTop: "1.5rem" }}>
          {filteredOrders.map((order) => (
            <Col xs={24} key={order.id}>
              <Card style={{ borderRadius: 12 }}>
                {/* Header */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                  <Col>
                    <Title level={5} style={{ margin: 0 }}>
                      Order #{order.id} - Table {order.tableId}
                    </Title>
                  </Col>
                  <Col style={{ display: "flex", justifyContent: "flex-end" }}>
                    {getTag(order.status)}
                    {dayjs(order.createdAt).format('HH:mm A')}
                  </Col>
                </Row>

                {/* Items */}
                {order.items.map((item) => (
                  <Row justify="space-between" key={item.id}>
                    <Text>
                      {item.quantity} x {item.menuItem?.name}
                    </Text>
                    <Text strong>{item.menuItem?.price} ฿</Text>
                  </Row>
                ))}

                {/* Action buttons */}
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text type="secondary">Update status:</Text>
                  {["waiting", "cooking", "done"].map((statusKey) => (
                    <Button
                      key={statusKey}
                      type={order.status === statusKey ? "primary" : "default"}
                      onClick={() =>
                        updateOrderStatus(order.id, statusKey as "waiting" | "cooking" | "done")
                      }
                      style={{
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        border: "none", 
                        borderRadius: 8,
                        // height: 40,
                        fontWeight: 500,
                      }}
                    >
                      {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                    </Button>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
}

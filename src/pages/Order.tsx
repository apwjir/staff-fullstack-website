import React, { useState } from "react";
import { Layout, Card, Row, Col, Button, Tag, Typography, Select } from "antd";
import {
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  foodtype: string;
  description: string;
  isAvailable: boolean;
}

interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  note?: string;
  menuItem?: MenuItem; // optional: join menu info
}

interface Order {
  id: number;
  tableId: number;
  sessionId: string;
  status: "waiting" | "cooking" | "done";
  createdAt: string;
  updatedAt: string;
  queuePos: number;
  billId?: number;
  items: OrderItem[];
}

const initialOrders: Order[] = [
  {
    id: 1,
    tableId: 2,
    sessionId: "sess-001",
    status: "waiting",
    createdAt: "2025-10-04T02:30:00Z",
    updatedAt: "2025-10-04T02:30:00Z",
    queuePos: 1,
    items: [
      {
        id: 1,
        orderId: 1,
        menuItemId: 101,
        quantity: 1,
        menuItem: {
          id: 101,
          name: "Margherita Pizza",
          price: 250,
          foodtype: "main",
          description: "Classic pizza with tomato & mozzarella",
          isAvailable: true,
        },
      },
      {
        id: 2,
        orderId: 1,
        menuItemId: 102,
        quantity: 2,
        menuItem: {
          id: 102,
          name: "Caesar Salad",
          price: 120,
          foodtype: "appetizer",
          description: "Fresh romaine with Caesar dressing",
          isAvailable: true,
        },
      },
    ],
  },
  {
    id: 2,
    tableId: 5,
    sessionId: "sess-002",
    status: "cooking",
    createdAt: "2025-10-04T02:15:00Z",
    updatedAt: "2025-10-04T02:20:00Z",
    queuePos: 2,
    items: [
      {
        id: 3,
        orderId: 2,
        menuItemId: 201,
        quantity: 1,
        note: "medium rare",
        menuItem: {
          id: 201,
          name: "Grilled Salmon",
          price: 450,
          foodtype: "main",
          description: "Salmon fillet grilled to perfection",
          isAvailable: true,
        },
      },
      {
        id: 4,
        orderId: 2,
        menuItemId: 202,
        quantity: 2,
        menuItem: {
          id: 202,
          name: "House Wine",
          price: 180,
          foodtype: "beverage",
          description: "Red wine glass",
          isAvailable: true,
        },
      },
    ],
  },
];

export default function Order() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<string>("all");

  const updateOrderStatus = (
    id: number,
    status: "waiting" | "cooking" | "done"
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order
      )
    );
  };

  const totalOrders = orders.length;
  const waitingCount = orders.filter((o) => o.status === "waiting").length;
  const cookingCount = orders.filter((o) => o.status === "cooking").length;
  const doneCount = orders.filter((o) => o.status === "done").length;

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
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Content style={{ margin: "0 10rem", paddingTop: "2rem" }}>
        {/* Title */}
        <Title level={2} style={{ fontSize: 32, marginBottom: 4 }}>
          Orders Management
        </Title>
        <Text type="secondary">Track and manage all restaurant orders</Text>

        {/* Stats */}
        <Row gutter={[24, 24]} style={{ marginTop: "2rem" }}>
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

        {/* Filter Dropdown */}
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text strong>Filter by status:</Text>
          <Select
            value={filter}
            style={{ width: 200 }}
            onChange={(value) => setFilter(value)}
          >
            <Option value="all">All Orders</Option>
            <Option value="waiting">Waiting</Option>
            <Option value="cooking">Cooking</Option>
            <Option value="done">Done</Option>
          </Select>
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
                        updateOrderStatus(order.id, statusKey as any)
                      }
                      style={{
                        backgroundColor: "#000000", // พื้นหลังดำ
                        color: "#ffffff", // ตัวอักษรขาว
                        border: "none", // เอา border ออก (ไม่จำเป็นก็ได้)
                        borderRadius: 8, // มุมโค้งเล็กน้อย
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

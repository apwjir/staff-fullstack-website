import React, { useState } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Button,
  Modal,
  QRCode,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  QrcodeOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

export type TableStatus = "available" | "occupied";

export interface Table {
  id: number;
  seats: number;
  status: TableStatus;
  reservedTime?: string;
  qrCodeToken?: string; // ✅ optional เพราะตอนเริ่มยังไม่มี
}

const initialTables: Table[] = [
  { id: 1, seats: 2, status: "available" },
  { id: 2, seats: 4, status: "occupied" },
  { id: 3, seats: 6, status: "available" },
  { id: 4, seats: 4, status: "available" },
  { id: 5, seats: 8, status: "occupied" },
  { id: 6, seats: 2, status: "available" },
  { id: 7, seats: 4, status: "available" },
  { id: 8, seats: 6, status: "available" },
];

export default function Dashboard() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [filter, setFilter] = useState<"all" | TableStatus>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const filteredTables =
    filter === "all" ? tables : tables.filter((t) => t.status === filter);

  const total = tables.length;
  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;

  const getStatusTag = (status: TableStatus, tableId: number) => {
    const nextStatus = status === "available" ? "occupied" : "available";

    switch (status) {
      case "available":
        return (
          <Tag
            color="green"
            icon={<CheckCircleOutlined />}
            style={{ cursor: "pointer" }}
            onClick={() => handleChangeStatus(tableId, nextStatus)}
          >
            Available
          </Tag>
        );
      case "occupied":
        return (
          <Tag
            color="red"
            icon={<CloseCircleOutlined />}
            style={{ cursor: "pointer" }}
            onClick={() => handleChangeStatus(tableId, nextStatus)}
          >
            Occupied
          </Tag>
        );
    }
  };

  const getBorderColor = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "1px solid #95de64";
      case "occupied":
        return "1px solid #ff7875";
    }
  };

  /** ✅ เปลี่ยนสถานะของโต๊ะ */
  const handleChangeStatus = (tableId: number, newStatus: TableStatus) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: newStatus } : t
      )
    );
  };

  /** ✅ สร้าง QR Code + Token */
  const handleGenerateQRCode = (table: Table) => {
    // สร้าง token แบบ random
    const token = crypto.randomUUID(); // ใช้ Math.random().toString(36).slice(2) ได้เหมือนกัน

    // อัปเดต table ใน state
    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id ? { ...t, qrCodeToken: token, status: "occupied" } : t
      )
    );

    // เปิด modal พร้อม table ที่มี token ใหม่
    setSelectedTable({ ...table, qrCodeToken: token });
    setModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Content style={{ margin: "0 10rem", paddingTop: "2rem" }}>
        <Title level={2} style={{ fontSize: 32, marginBottom: 4 }}>
          Table Management
        </Title>
        <Text type="secondary">Monitor and manage restaurant tables</Text>

        {/* Summary */}
        <Row gutter={[24, 24]} style={{ marginTop: "2rem" }}>
          {[
            { label: "Total Tables", value: total, color: "#111827" },
            { label: "Available", value: availableCount, color: "green" },
            { label: "Occupied", value: occupiedCount, color: "red" },
          ].map((stat) => (
            <Col xs={24} sm={12} md={6} key={stat.label}>
              <Card style={{ borderRadius: 12, height: 120 }}>
                <Text>{stat.label}</Text>
                <Title level={2} style={{ marginTop: 4, color: stat.color }}>
                  {stat.value}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filter Buttons */}
        <div style={{ marginTop: "2rem", display: "flex", gap: 12 }}>
          {[
            { label: "All Tables", value: "all" },
            { label: "Available", value: "available" },
            { label: "Occupied", value: "occupied" },
          ].map((opt) => (
            <Button
              key={opt.value}
              type={filter === opt.value ? "primary" : "default"}
              onClick={() => setFilter(opt.value as any)}
              style={{
                borderRadius: 20,
                background: filter === opt.value ? "#111827" : "#fff",
                color: filter === opt.value ? "#fff" : "#6B7280",
                border: "1px solid #d1d5db",
                fontSize: 16,
                height: 40,
                padding: "0 20px",
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Tables Grid */}
        <Row gutter={[16, 16]} style={{ marginTop: "1.5rem" }}>
          {filteredTables.map((table) => (
            <Col xs={24} sm={12} md={8} lg={6} key={table.id}>
              <Card
                style={{
                  border: getBorderColor(table.status),
                  borderRadius: 12,
                  height: 220,
                  textAlign: "left",
                }}
                styles={{
                  body: {
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  },
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Title level={5} style={{ margin: 0, fontWeight: "bold" }}>
                      Table {table.id}
                    </Title>
                    {getStatusTag(table.status, table.id)}
                  </div>

                  <Text style={{ display: "block", marginTop: 8 }}>
                    <TeamOutlined /> {table.seats} seats
                  </Text>
                  <Text style={{ display: "block", marginTop: 4 }}>
                    <QrcodeOutlined /> QR Code
                  </Text>
                </div>

                <Button
                  block
                  style={{
                    marginTop: "auto",
                    backgroundColor: "#1c1919ff",
                    color: "#fff",
                    borderRadius: 8,
                    border: "none",
                  }}
                  onClick={() => handleGenerateQRCode(table)}
                >
                  Generate QR Code
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* QR Modal */}
        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          centered
          styles={{
            body: {
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            },
            mask: { backdropFilter: "blur(8px)" },
          }}
          width={400}
        >
          {selectedTable && (
            <>
              <Title level={3} style={{ marginBottom: 24 }}>
                Table {selectedTable.id} QR Code
              </Title>
              <QRCode
                value={`https://example.com/table/${selectedTable.id}?token=${selectedTable.qrCodeToken}`}
                size={250}
              />
              <Text
                type="secondary"
                style={{ marginTop: 12, wordBreak: "break-all" }}
              >
                Token: {selectedTable.qrCodeToken}
              </Text>
            </>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}

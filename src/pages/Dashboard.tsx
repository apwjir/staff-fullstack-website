import { useState, useEffect } from "react";
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
  message,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QrcodeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { adminApiService, mapTableStatus, type Table as BackendTable } from "../services/api";
// import { useSocket } from "../contexts/SocketContext";
// import { Badge } from "antd";

const { Content } = Layout;
const { Title, Text } = Typography;

export type TableStatus = "available" | "occupied";

export interface Table {
  id: number;
  tableNumber: number;
  seats: number;
  status: TableStatus;
  reservedTime?: string;
  qrCodeToken?: string;
}

export default function Dashboard() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | TableStatus>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  // const { connected } = useSocket();

  // Load tables from API
  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const backendTables = await adminApiService.getTables();

        // Convert backend table format to frontend format
        const frontendTables: Table[] = backendTables.map((table: BackendTable) => ({
          id: table.id,
          tableNumber: table.tableNumber,
          seats: table.capacity,
          status: mapTableStatus(table.status),
          qrCodeToken: table.qrCodeToken,
        }));

        setTables(frontendTables);
      } catch (error) {
        console.error('Failed to load tables:', error);
        message.error('Failed to load tables. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, []);



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
  const handleChangeStatus = async (tableId: number, newStatus: TableStatus) => {
    try {
      // Convert frontend status to backend status
      const backendStatus = newStatus === "available" ? "AVAILABLE" : "OCCUPIED";

      // Update status via API
      await adminApiService.updateTableStatus(tableId, backendStatus);

      // Update local state
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, status: newStatus } : t
        )
      );

      message.success(`Table ${tables.find(t => t.id === tableId)?.tableNumber} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error changing table status:", error);
      message.error("Failed to update table status. Please try again.");
    }
  };

  /** ✅ สร้าง QR Code + Token */
  const handleGenerateQRCode = async (table: Table) => {
    try {
      setQrLoading(true);

      // Generate QR code via API
      const qrData = await adminApiService.generateTableQR(table.id);

      // Update table in state with new token
      const updatedTable = { ...table, qrCodeToken: qrData.token };
      setTables((prev) =>
        prev.map((t) =>
          t.id === table.id ? updatedTable : t
        )
      );

      // Open modal with updated table
      setSelectedTable(updatedTable);
      setModalVisible(true);

      message.success(`QR Code generated for Table ${table.tableNumber}`);
    } catch (error) {
      console.error("Error generating QR code:", error);
      message.error("Failed to generate QR code. Please try again.");
    } finally {
      setQrLoading(false);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <Title level={2} style={{ fontSize: 32, margin: 0 }} className="mobile-responsive-title">
            Table Management
          </Title>
        </div>
        <Text type="secondary">Monitor and manage restaurant tables</Text>

        {/* Summary */}
        <Row gutter={[24, 24]} style={{ marginTop: "2rem" }} className="mobile-responsive-stats">
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
        <div style={{ marginTop: "2rem", display: "flex", gap: 12 }} className="mobile-responsive-filter">
          {[
            { label: "All Tables", value: "all" },
            { label: "Available", value: "available" },
            { label: "Occupied", value: "occupied" },
          ].map((opt) => (
            <Button
              key={opt.value}
              type={filter === opt.value ? "primary" : "default"}
              onClick={() => setFilter(opt.value as "all" | TableStatus)}
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
                      Table {table.tableNumber}
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
                  loading={qrLoading}
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
                Table {selectedTable.tableNumber} QR Code
              </Title>
              <QRCode
                value={`${import.meta.env.VITE_CUSTOMER_FRONTEND_URL || 'http://localhost:5173'}/table/${selectedTable.tableNumber}?token=${selectedTable.qrCodeToken}`}
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

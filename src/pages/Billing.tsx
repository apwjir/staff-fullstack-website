import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Empty,
  Space,
  Select,
  QRCode,
  message,
  Layout,
} from "antd";

const { Title, Text } = Typography;

interface Bill {
  id: number;
  tableId: number;
  isPaid: boolean;
  createdAt: string;
  paidAt?: string;
  totalAmount: number;
}

const initialBills: Bill[] = [
  {
    id: 2,
    tableId: 2,
    isPaid: false,
    createdAt: "1/16/2024, 2:30:00 AM",
    totalAmount: 56.12,
  },
  {
    id: 5,
    tableId: 5,
    isPaid: true,
    createdAt: "1/16/2024, 2:15:00 AM",
    paidAt: "1/16/2024, 3:30:00 AM",
    totalAmount: 46.41,
  },
  {
    id: 7,
    tableId: 7,
    isPaid: false,
    createdAt: "1/16/2024, 2:00:00 AM",
    totalAmount: 24.82,
  },
];


const Billing: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [filter, setFilter] = useState<"All" | "Paid" | "Unpaid">("All");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  // Removed unused tables state

  const filteredBills = bills.filter(
    (bill) =>
      filter === "All" ||
      (filter === "Paid" && bill.isPaid) ||
      (filter === "Unpaid" && !bill.isPaid)
  );

  const totalBills = bills.length;
  const unpaidBills = bills.filter((b) => !b.isPaid).length;
  const paidBills = bills.filter((b) => b.isPaid).length;
  const revenueToday = bills
    .filter((b) => b.isPaid)
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const handleCloseBill = (billId: number) => {
    try {
      const now = new Date().toLocaleString();
      setBills((prev) =>
        prev.map((b) =>
          b.id === billId ? { ...b, isPaid: true, paidAt: now } : b
        )
      );
      if (selectedBill?.id === billId) {
        setSelectedBill({ ...selectedBill, isPaid: true, paidAt: now });
      }
      message.success("Bill closed successfully ✅");
    } catch (error) {
      message.error("Failed to close bill. Please try again.");
      console.error("Error closing bill:", error);
    }
  };


  return (
    <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Layout.Content style={{ margin: "0 10rem", paddingTop: "2rem" }} className="mobile-responsive-content">
        {/* Title */}
        <Title level={2} style={{ fontSize: 32, marginBottom: 4 }} className="mobile-responsive-title">
          Billing & Payments
        </Title>
        <Text type="secondary">Manage bills and payment processing</Text>

        {/* Summary Cards */}
        <Row gutter={[24, 24]} style={{ marginTop: "2rem" }} align="stretch" className="mobile-responsive-stats">
          {[
            { label: "Total Bills", value: totalBills, color: "#111827" },
            { label: "Unpaid", value: unpaidBills, color: "red" },
            { label: "Paid", value: paidBills, color: "green" },
            {
              label: "Revenue Today",
              value: `$${revenueToday.toFixed(2)}`,
              color: "#1890ff",
            },
          ].map((stat) => (
            <Col xs={24} sm={12} md={6} key={stat.label}>
              <Card style={{ borderRadius: 12 }}>
                <Text strong>{stat.label}</Text>
                <Title level={2} style={{ marginTop: 4, color: stat.color }}>
                  {stat.value}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Combined Bill List + Detail */}
        <Card style={{ borderRadius: 12, marginTop: "2rem", padding: 16 }}>
          <Row gutter={16}>
            {/* Left: Bill List */}
            <Col xs={24} md={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  Bills
                </Text>
                <Select
                  value={filter}
                  onChange={(val) =>
                    setFilter(val as "All" | "Paid" | "Unpaid")
                  }
                  options={[
                    { label: "All", value: "All" },
                    { label: "Paid", value: "Paid" },
                    { label: "Unpaid", value: "Unpaid" },
                  ]}
                  style={{ width: 100 }}
                />
              </div>
              <Space direction="vertical" style={{ width: "100%" }}>
                {filteredBills.map((bill) => (
                  <Card
                    key={bill.id}
                    hoverable
                    onClick={() => setSelectedBill(bill)}
                    style={{
                      border:
                        selectedBill?.id === bill.id
                          ? "1px solid #1890ff"
                          : "1px solid #f0f0f0",
                      background:
                        selectedBill?.id === bill.id ? "#f0f5ff" : "#fff",
                      borderRadius: 8,
                    }}
                    bodyStyle={{ padding: "12px 16px" }}
                  >
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                      align="start"
                    >
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Text strong>Table {bill.tableId}</Text>
                          <Tag
                            bordered={false}
                            color={bill.isPaid ? "green" : "red"}
                          >
                            {bill.isPaid ? "Paid" : "Unpaid"}
                          </Tag>
                        </Space>
                        {bill.isPaid && bill.paidAt && (
                          <Text type="success" style={{ fontSize: 13 }}>
                            ✅ Paid at {bill.paidAt}
                          </Text>
                        )}
                      </Space>
                      <Text strong style={{ fontSize: 15 }}>
                        ${bill.totalAmount.toFixed(2)}
                      </Text>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Col>

            {/* Divider */}
            <Col xs={0} md={1}>
              <div
                style={{
                  borderLeft: "1px solid #f0f0f0",
                  height: "100%",
                  margin: "0 auto",
                }}
              />
            </Col>

            {/* Right: Bill Detail */}
            <Col xs={24} md={15}>
              {selectedBill ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <Title level={4}>
                        Table {selectedBill.tableId} -{" "}
                        {selectedBill.isPaid ? "Paid" : "Unpaid"}
                      </Title>
                      <Text>Total: ${selectedBill.totalAmount.toFixed(2)}</Text>
                      <br />
                      <Text>Created: {selectedBill.createdAt}</Text>
                      {selectedBill.paidAt && (
                        <div>
                          <Text type="success">
                            Paid at: {selectedBill.paidAt}
                          </Text>
                        </div>
                      )}
                    </div>
                    <QRCode
                      value={`https://payment.example.com/bill/${selectedBill.id}`}
                      size={180}
                    />
                  </div>

                  {!selectedBill.isPaid && (
                    <div style={{ marginTop: "16px", textAlign: "left" }}>
                      <Button
                        type="primary"
                        onClick={() => {
                          handleCloseBill(selectedBill.id);
                        }}
                        style={{
                          backgroundColor: "#000000",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 8,
                          height: 40,
                          fontWeight: 500,
                        }}
                      >
                        Close Bill
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Empty description="Select a bill to view details" />
              )}
            </Col>
          </Row>
        </Card>
      </Layout.Content>
    </Layout>
  );
};

export default Billing;

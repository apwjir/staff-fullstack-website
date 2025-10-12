import { useState, useEffect } from "react";
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
  Spin,
  DatePicker,
} from "antd";
import dayjs, { Dayjs } from 'dayjs';
import { adminApiService, type Bill as BackendBill } from "../services/api";

const { Title, Text } = Typography;

interface Bill {
  id: number;
  tableId: number;
  isPaid: boolean;
  createdAt: string;
  paidAt?: string | null;
  totalAmount: number;
  orders?: Array<{
    id: number;
    orderItems: Array<{
      id: number;
      quantity: number;
      note?: string;
      menuItem: {
        id: number;
        name: string;
        price: number;
      };
    }>;
  }>;
}

const Billing: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Paid" | "Unpaid">("All");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Default to today

  // Helper function to check if bill is from selected date
  const isBillFromSelectedDate = (billDate: string, targetDate: Dayjs) => {
    const billDay = dayjs(billDate);
    return billDay.format('YYYY-MM-DD') === targetDate.format('YYYY-MM-DD');
  };

  // Load bills from API
  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true);
        const backendBills = await adminApiService.getBills();

        // Convert backend bills to frontend format
        const frontendBills: Bill[] = backendBills.map((bill: BackendBill) => ({
          id: bill.id,
          tableId: bill.tableId,
          isPaid: bill.isPaid,
          createdAt: bill.createdAt, // Keep original ISO string for filtering
          paidAt: bill.paidAt,
          totalAmount: bill.totalAmount,
          orders: bill.orders,
        }));

        setBills(frontendBills);
      } catch (error) {
        console.error('Failed to load bills:', error);
        message.error('Failed to load bills. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, []);

  // Filter bills by selected date first
  const dateFilteredBills = bills.filter(bill => isBillFromSelectedDate(bill.createdAt, selectedDate));

  const filteredBills = dateFilteredBills.filter(
    (bill) =>
      filter === "All" ||
      (filter === "Paid" && bill.isPaid) ||
      (filter === "Unpaid" && !bill.isPaid)
  );

  const totalBills = dateFilteredBills.length;
  const unpaidBills = dateFilteredBills.filter((b) => !b.isPaid).length;
  const paidBills = dateFilteredBills.filter((b) => b.isPaid).length;
  const revenueToday = dateFilteredBills
    .filter((b) => b.isPaid)
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const handleCloseBill = async (billId: number) => {
    try {
      // Mark bill as paid via API
      await adminApiService.markBillAsPaid(billId);

      const now = new Date().toLocaleString();
      setBills((prev) =>
        prev.map((b) =>
          b.id === billId ? { ...b, isPaid: true, paidAt: now } : b
        )
      );
      if (selectedBill?.id === billId) {
        setSelectedBill({ ...selectedBill, isPaid: true, paidAt: now });
      }
      message.success("Bill closed successfully");
    } catch (error) {
      message.error("Failed to close bill. Please try again.");
      console.error("Error closing bill:", error);
    }
  };



  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Layout.Content style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <Spin size="large" />
        </Layout.Content>
      </Layout>
    );
  }

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
              label: `Revenue (${selectedDate.format('MMM DD')})`,
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
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                  Bills
                </Text>

                {/* Date and Status Filters */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <DatePicker
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                    format="YYYY-MM-DD"
                    style={{ flex: 1, minWidth: 120 }}
                    size="small"
                    placeholder="Select date"
                  />
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
                    style={{ flex: 1, minWidth: 80 }}
                    size="small"
                  />
                </div>
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
                            Paid at {dayjs(bill.paidAt).format('MMM DD, YYYY HH:mm')}
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

            {/* Divider - removed responsive column to prevent infinite loop */}

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
                  <div>
                    <div
                      style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}
                    >
                      <div>
                        <Title level={4}>
                          Table {selectedBill.tableId} -{" "}
                          {selectedBill.isPaid ? "Paid" : "Unpaid"}
                        </Title>
                        <div>
                          <Text>Created: {dayjs(selectedBill.createdAt).format('MMM DD, YYYY HH:mm')}</Text>
                        </div>
                        {selectedBill.paidAt && (
                          <div>
                            <Text type="success">
                              Paid at: {dayjs(selectedBill.paidAt).format('MMM DD, YYYY HH:mm')}
                            </Text>
                          </div>
                        )}
                      </div>
                      <QRCode
                        value={`https://payment.example.com/bill/${selectedBill.id}`}
                        size={180}
                      />
                    </div>

                    {/* Receipt Details */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <Title level={5} style={{ marginBottom: "16px", textAlign: "center" }}>
                        RECEIPT
                      </Title>
                      <div style={{ borderBottom: "1px dashed #d9d9d9", paddingBottom: "8px", marginBottom: "12px" }}>
                        <>
                          <Text strong>Table: {selectedBill.tableId}</Text>
                          <br />
                          <Text>Date: {dayjs(selectedBill.createdAt).format('MMM DD, YYYY HH:mm')}</Text>
                        </>
                      </div>

                      {selectedBill.orders && selectedBill.orders.length > 0 ? (
                        <div>
                          {selectedBill.orders.map((order) => (
                            <div key={order.id} style={{ marginBottom: "16px" }}>
                              <Text strong style={{ fontSize: "14px", color: "#666" }}>
                                Order #{order.id}
                              </Text>
                              {order.orderItems.map((item) => (
                                <div
                                  key={item.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    paddingLeft: "12px",
                                    marginTop: "4px",
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <Text>{item.menuItem.name}</Text>
                                    {item.note && (
                                      <div>
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                          Note: {item.note}
                                        </Text>
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <Text>{item.quantity}x</Text>
                                    <Text>${item.menuItem.price.toFixed(2)}</Text>
                                    <Text strong style={{ minWidth: "60px", textAlign: "right" }}>
                                      ${(item.quantity * item.menuItem.price).toFixed(2)}
                                    </Text>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                          <div style={{ borderTop: "1px dashed #d9d9d9", paddingTop: "12px", marginTop: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text strong style={{ fontSize: "16px" }}>TOTAL:</Text>
                              <Text strong style={{ fontSize: "16px" }}>
                                ${selectedBill.totalAmount.toFixed(2)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Text type="secondary">No items found</Text>
                      )}
                    </div>
                  </div>

                  {!selectedBill.isPaid && (
                    <div style={{ textAlign: "left" }}>
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

import React, { useState } from "react";
import {
  Card,
  Col,
  Row,
  Input,
  Button,
  Typography,
  Space,
  Tabs,
  message,
  Upload,
  Layout,
  Modal,
  Switch,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TableOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Setting.css";
import { type MenuItem } from "./Order";
import { type Table } from "./Dashboard";
import type { TableStatus } from "./Dashboard";

const { Title, Text } = Typography;

// interface Table {
//   id: number;
//   seats: number;
//   status: TableStatus;
//   reservedTime?: string;
//   qrCodeToken?: string; // ✅ optional เพราะตอนเริ่มยังไม่มี
// }

interface Staff {
  id: number;
  name: string;
  email: string;
  password: string;
}

// interface MenuItem {
//   id: number;
//   name: string;
//   price: number;
//   foodtype: string;
//   description: string;
//   isAvailable: boolean;
// }

const Setting: React.FC = () => {
  const [role] = useState("admin"); // mock role, สมมติว่าตอนนี้คือ admin
  // const [role] = useState("staff"); // mock role, สมมติว่าตอนนี้คือ staff
  const [fileList, setFileList] = useState<any[]>([]);
  const [tables, setTables] = useState<Table[]>([
    { id: 1, seats: 2, status: "available" },
    { id: 2, seats: 4, status: "occupied" },
    { id: 3, seats: 6, status: "reserved", reservedTime: "7:30 PM" },
    { id: 4, seats: 4, status: "available" },
    { id: 5, seats: 8, status: "occupied" },
    { id: 6, seats: 2, status: "available" },
    { id: 7, seats: 4, status: "reserved", reservedTime: "7:30 PM" },
    { id: 8, seats: 6, status: "available" },
  ]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: "Margherita Pizza",
      price: 16.99,
      foodtype: "mains",
      description: "Fresh mozzarella, basil, tomato sauce",
      isAvailable: true,
    },
    {
      id: 2,
      name: "Caesar Salad",
      price: 12.99,
      foodtype: "appetizers",
      description: "Crisp romaine, parmesan, croutons",
      isAvailable: true,
    },
    {
      id: 3,
      name: "Grilled Salmon",
      price: 26.99,
      foodtype: "mains",
      description: "Atlantic salmon with seasonal vegetables",
      isAvailable: true,
    },
  ]);
  const [staffs, setStaffs] = useState<Staff[]>([
    { id: 1, name: "admin", email: "admin@mail.com", password: "1234" },
  ]);

  // ---- FORM STATES ----
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newFoodtype, setNewFoodtype] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsAvailable, setNewIsAvailable] = useState(true);

  const [newUser, setNewUser] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ---- EDIT MODAL STATES ----
  const [isEditTableModalVisible, setIsEditTableModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const [isEditMenuModalVisible, setIsEditMenuModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  const [isEditStaffModalVisible, setIsEditStaffModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // ---- FUNCTIONS ----
  const handleAddTable = () => {
    if (!newNumber || !newCapacity) {
      message.error("กรุณากรอก Table Number และ Capacity");
      return;
    }
    const number = parseInt(newNumber);
    const capacity = parseInt(newCapacity);
    if (isNaN(number) || isNaN(capacity)) {
      message.error("กรุณากรอกเป็นตัวเลขเท่านั้น");
      return;
    }
    setTables([
      ...tables,
      {
        id: Number(newNumber),
        seats: Number(newCapacity),
        status: "available",
      },
    ]);
    setNewNumber("");
    setNewCapacity("");
    message.success("เพิ่มโต๊ะสำเร็จ");
  };

  const handleDeleteTable = (id: number) => {
    setTables(tables.filter((t) => t.id !== id));
    message.success("ลบโต๊ะสำเร็จ");
  };

  const handleToggleAvailability = (id: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // ---- EDIT FUNCTIONS ----
  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsEditTableModalVisible(true);
  };

  const handleSaveEditTable = () => {
    if (editingTable) {
      setTables((prev) =>
        prev.map((t) => (t.id === editingTable.id ? editingTable : t))
      );
      message.success("แก้ไขโต๊ะสำเร็จ");
    }
    setIsEditTableModalVisible(false);
    setEditingTable(null);
  };

  const handleEditMenu = (item: MenuItem) => {
    setEditingMenu(item);
    setIsEditMenuModalVisible(true);
  };

  const handleSaveEditMenu = () => {
    if (editingMenu) {
      setMenuItems((prev) =>
        prev.map((item) => (item.id === editingMenu.id ? editingMenu : item))
      );
      message.success("แก้ไขเมนูสำเร็จ");
    }
    setIsEditMenuModalVisible(false);
    setEditingMenu(null);
  };

  // ---- MENU FUNCTIONS ----
  const handleAddMenuItem = () => {
    if (!newName || !newPrice || !newFoodtype) {
      message.error("กรุณากรอก Name, Price และ Category");
      return;
    }
    const newItem: MenuItem = {
      id: Date.now(),
      name: newName,
      price: parseInt(newPrice),
      foodtype: newFoodtype, // ✅ ต้องใช้ชื่อ foodtype
      description: newDescription,
      isAvailable: newIsAvailable, // ✅ ต้องใช้ชื่อ isAvailable
    };

    setMenuItems([...menuItems, newItem]);
    setNewName("");
    setNewPrice("");
    setNewFoodtype("");
    setNewDescription("");
    setNewIsAvailable(true);
    message.success("เพิ่มเมนูสำเร็จ");
  };

  const handleDeleteMenuItem = (id: number) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
    message.success("ลบเมนูสำเร็จ");
  };

  // ---- STAFF FUNCTIONS ----
  const handleAddStaff = () => {
    if (!newUser || !newEmail || !newPassword) {
      message.error("กรุณากรอก User, Email และ Password");
      return;
    }
    const newStaff: Staff = {
      id: Date.now(),
      name: newUser,
      email: newEmail,
      password: newPassword,
    };
    setStaffs([...staffs, newStaff]);
    setNewUser("");
    setNewEmail("");
    setNewPassword("");
    message.success("เพิ่ม Staff สำเร็จ");
  };

  const handleDeleteStaff = (id: number) => {
    setStaffs(staffs.filter((s) => s.id !== id));
    message.success("ลบ Staff สำเร็จ");
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setIsEditStaffModalVisible(true);
  };

  const handleSaveEditStaff = () => {
    if (editingStaff) {
      setStaffs((prev) =>
        prev.map((s) => (s.id === editingStaff.id ? editingStaff : s))
      );
      message.success("แก้ไข Staff สำเร็จ");
    }
    setIsEditStaffModalVisible(false);
    setEditingStaff(null);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            itemColor: '#6b7280',
            itemHoverColor: '#111827',
            itemSelectedColor: '#000000',
            itemActiveColor: '#000000',
            inkBarColor: '#000000',
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Layout.Content style={{ margin: "0 10rem", paddingTop: "2rem" }}>
          <Title level={2} style={{ fontSize: 32, marginBottom: 4 }}>
            Settings
          </Title>
          <Text type="secondary">
            Manage tables, menu items, and restaurant configuration
          </Text>

          <Tabs
            defaultActiveKey="tables"
            className="custom-tabs"
          items={[
            {
              key: "tables",
              label: "Tables",
              children: (
                <Card style={{ borderRadius: 12, marginTop: 24, padding: 16 }}>
                  <Row gutter={16}>
                    {/* Add New Table */}
                    <Col xs={24} md={10}>
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="large"
                      >
                        <Title level={5}>
                          <PlusOutlined /> Add New Table
                        </Title>
                        <Row gutter={12}>
                          <Col span={12}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Table Number</label>
                            <Input
                              placeholder="Enter table number"
                              value={newNumber}
                              onChange={(e) => setNewNumber(e.target.value)}
                            />
                          </Col>
                          <Col span={12}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Capacity</label>
                            <Input
                              placeholder="Enter number of seats"
                              value={newCapacity}
                              onChange={(e) => setNewCapacity(e.target.value)}
                            />
                          </Col>
                        </Row>
                        <Button
                          type="primary"
                          block
                          onClick={handleAddTable}
                          style={{
                            backgroundColor: "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            height: 40,
                            fontWeight: 500,
                          }}
                        >
                          Add Table
                        </Button>
                      </Space>
                    </Col>

                    <Col xs={0} md={1}>
                      <div
                        style={{
                          borderLeft: "1px solid #f0f0f0",
                          height: "100%",
                          margin: "0 auto",
                        }}
                      />
                    </Col>

                    {/* Existing Tables */}
                    <Col xs={24} md={13}>
                      <Title level={5}>
                        <TableOutlined /> Existing Tables
                      </Title>
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="middle"
                      >
                        {tables.map((table) => (
                          <Card
                            key={table.id}
                            size="small"
                            style={{ borderRadius: 8 }}
                          >
                            <Row justify="space-between" align="middle">
                              <Col>
                                <Text strong>{`Table ${table.id}`}</Text>
                                <br />
                                <Text type="secondary">
                                  {table.seats} seats • {table.status}
                                </Text>
                              </Col>
                              <Col>
                                <Space size="middle">
                                  <EditOutlined
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleEditTable(table)}
                                  />
                                  <DeleteOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => handleDeleteTable(table.id)}
                                  />
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ),
            },
            {
              key: "menu",
              label: "Menu Items",
              children: (
                <Card style={{ borderRadius: 12, marginTop: 24, padding: 16 }}>
                  <Row gutter={16}>
                    {/* Add New Menu Item */}
                    <Col xs={24} md={10}>
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="large"
                      >
                        <Title level={5}>
                          <PlusOutlined /> Add New Menu Item
                        </Title>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Menu Item Name</label>
                          <Input
                            placeholder="e.g. Spaghetti Carbonara"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        </div>
                        <Row gutter={12}>
                          <Col span={12}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Price</label>
                            <Input
                              placeholder="Enter price"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                            />
                          </Col>
                          <Col span={12}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Category</label>
                            <Input
                              placeholder="e.g. appetizers, mains"
                              value={newFoodtype}
                              onChange={(e) => setNewFoodtype(e.target.value)}
                            />
                          </Col>
                        </Row>
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
                          <Input.TextArea
                            placeholder="Brief description of the dish"
                            rows={3}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                          />
                        </div>
                        <Upload
                          fileList={fileList}
                          beforeUpload={() => false}
                          onChange={({ fileList }) => setFileList(fileList)}
                          accept="image/*"
                          listType="picture"
                        >
                          <Button icon={<UploadOutlined />}>
                            Upload Image
                          </Button>
                        </Upload>
                        <Button
                          type="primary"
                          block
                          onClick={handleAddMenuItem}
                          style={{
                            backgroundColor: "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            height: 40,
                            fontWeight: 500,
                          }}
                        >
                          Add Menu Item
                        </Button>
                      </Space>
                    </Col>

                    <Col xs={0} md={1}>
                      <div
                        style={{
                          borderLeft: "1px solid #f0f0f0",
                          height: "100%",
                          margin: "0 auto",
                        }}
                      />
                    </Col>

                    {/* Existing Menu Items */}
                    <Col xs={24} md={13}>
                      <Title level={5}>
                        <TableOutlined /> Existing Menu Items
                      </Title>
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="middle"
                      >
                        {menuItems.map((item) => (
                          <Card
                            key={item.id}
                            size="small"
                            style={{ borderRadius: 8 }}
                          >
                            <Row justify="space-between" align="middle">
                              <Col>
                                <Text strong>{item.name}</Text>
                                <br />
                                <Text type="secondary">
                                  {item.price} ฿• {item.name}
                                </Text>
                                <br />
                                <Text>{item.description}</Text>
                              </Col>
                              <Col>
                                <Space size="middle">
                                  <Button
                                    size="small"
                                    style={{
                                      background: item.isAvailable
                                        ? "#f6ffed"
                                        : "#fff1f0",
                                      color: item.isAvailable
                                        ? "#389e0d"
                                        : "#cf1322",
                                      border: item.isAvailable
                                        ? "1px solid #b7eb8f"
                                        : "1px solid #ffa39e",
                                      borderRadius: 4,
                                    }}
                                    onClick={() =>
                                      handleToggleAvailability(item.id)
                                    }
                                  >
                                    {item.isAvailable
                                      ? "Available"
                                      : "Unavailable"}
                                  </Button>
                                  <EditOutlined
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleEditMenu(item)}
                                  />
                                  <DeleteOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleDeleteMenuItem(item.id)
                                    }
                                  />
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ),
            },
            ...(role === "admin"
              ? [
                  {
                    key: "staff",
                    label: "Staff",
                    children: (
                      <Card
                        style={{ borderRadius: 12, marginTop: 24, padding: 16 }}
                      >
                        <Row gutter={16}>
                          {/* Add New Staff */}
                          <Col xs={24} md={10}>
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                              size="large"
                            >
                              <Title level={5}>
                                <PlusOutlined /> Add New Staff
                              </Title>
                              <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Username</label>
                                <Input
                                  placeholder="Enter username"
                                  value={newUser}
                                  onChange={(e) => setNewUser(e.target.value)}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
                                <Input
                                  placeholder="Enter email address"
                                  value={newEmail}
                                  onChange={(e) => setNewEmail(e.target.value)}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Password</label>
                                <Input.Password
                                  placeholder="Enter password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                />
                              </div>
                              <Button
                                type="primary"
                                block
                                onClick={handleAddStaff}
                                style={{
                                  backgroundColor: "#000",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 8,
                                  height: 40,
                                  fontWeight: 500,
                                }}
                              >
                                Add Staff
                              </Button>
                            </Space>
                          </Col>

                          <Col xs={0} md={1}>
                            <div
                              style={{
                                borderLeft: "1px solid #f0f0f0",
                                height: "100%",
                                margin: "0 auto",
                              }}
                            />
                          </Col>

                          {/* Existing Staff */}
                          <Col xs={24} md={13}>
                            <Title level={5}>
                              <UserOutlined /> Existing Staff
                            </Title>
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                              size="middle"
                            >
                              {staffs.map((staff) => (
                                <Card
                                  key={staff.id}
                                  size="small"
                                  style={{ borderRadius: 8 }}
                                >
                                  <Row justify="space-between" align="middle">
                                    <Col>
                                      <Text strong>{staff.name}</Text>
                                      <br />
                                      <Text type="secondary">
                                        {staff.email}
                                      </Text>
                                    </Col>
                                    <Col>
                                      <Space size="middle">
                                        <EditOutlined
                                          style={{ cursor: "pointer" }}
                                          onClick={() => handleEditStaff(staff)}
                                        />
                                        <DeleteOutlined
                                          style={{
                                            color: "#ff4d4f",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            handleDeleteStaff(staff.id)
                                          }
                                        />
                                      </Space>
                                    </Col>
                                  </Row>
                                </Card>
                              ))}
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    ),
                  },
                ]
              : []),
          ]}
        />

        {/* --- Edit Table Modal --- */}
        <Modal
          title="Edit Table"
          open={isEditTableModalVisible}
          onOk={handleSaveEditTable}
          onCancel={() => setIsEditTableModalVisible(false)}
          okText="Save"
          cancelText="Cancel"
          centered
          maskStyle={{ backdropFilter: "blur(4px)" }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Table Number</label>
            <Input
              placeholder="Enter table number"
              type="number"
              value={editingTable?.id}
              onChange={(e) =>
                setEditingTable((prev) =>
                  prev ? { ...prev, number: parseInt(e.target.value) || 0 } : prev
                )
              }
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Seats</label>
            <Input
              placeholder="Enter number of seats"
              type="number"
              value={editingTable?.seats}
              onChange={(e) =>
                setEditingTable((prev) =>
                  prev ? { ...prev, seats: parseInt(e.target.value) || 0 } : prev
                )
              }
            />
          </div>
        </Modal>

        {/* --- Edit Menu Modal --- */}
        <Modal
          title="Edit Menu Item"
          open={isEditMenuModalVisible}
          onOk={handleSaveEditMenu}
          onCancel={() => setIsEditMenuModalVisible(false)}
          okText="Save"
          cancelText="Cancel"
          centered
          maskStyle={{ backdropFilter: "blur(4px)" }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Menu Item Name</label>
            <Input
              placeholder="Enter item name"
              value={editingMenu?.name}
              onChange={(e) =>
                setEditingMenu((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev
                )
              }
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Price</label>
            <Input
              placeholder="Enter price"
              value={editingMenu?.price}
              onChange={(e) =>
                setEditingMenu((prev) =>
                  prev ? { ...prev, price: parseInt(e.target.value) || 0 } : prev
                )
              }
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Category</label>
            <Input
              placeholder="Enter category"
              value={editingMenu?.foodtype}
              onChange={(e) =>
                setEditingMenu((prev) =>
                  prev ? { ...prev, category: e.target.value } : prev
                )
              }
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
            <Input.TextArea
              placeholder="Enter description"
              rows={3}
              value={editingMenu?.description}
              onChange={(e) =>
                setEditingMenu((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
            />
          </div>
          <div>
            <span>Available: </span>
            <Switch
              checked={editingMenu?.isAvailable}
              onChange={(checked) =>
                setEditingMenu((prev) =>
                  prev ? { ...prev, available: checked } : prev
                )
              }
            />
          </div>
        </Modal>

        {/* --- Edit Staff Modal --- */}
        <Modal
          title="Edit Staff"
          open={isEditStaffModalVisible}
          onOk={handleSaveEditStaff}
          onCancel={() => setIsEditStaffModalVisible(false)}
          okText="Save"
          cancelText="Cancel"
          centered
          maskStyle={{ backdropFilter: "blur(4px)" }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Name</label>
            <Input
              placeholder="Enter staff name"
              value={editingStaff?.name}
              onChange={(e) =>
                setEditingStaff((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev
                )
              }
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <Input
              placeholder="Enter email address"
              value={editingStaff?.email}
              onChange={(e) =>
                setEditingStaff((prev) =>
                  prev ? { ...prev, email: e.target.value } : prev
                )
              }
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Password</label>
            <Input.Password
              placeholder="Enter password"
              value={editingStaff?.password}
              onChange={(e) =>
                setEditingStaff((prev) =>
                  prev ? { ...prev, password: e.target.value } : prev
                )
              }
            />
          </div>
        </Modal>
      </Layout.Content>
    </Layout>
    </ConfigProvider>
  );
};

export default Setting;

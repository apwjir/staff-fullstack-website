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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TableOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "./Setting.css";

const { Title, Text } = Typography;

interface TableData {
  id: number;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
}

interface MenuItem {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  available: boolean;
}

const Billing: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [tables, setTables] = useState<TableData[]>([
    { id: 1, number: 1, capacity: 2, status: "available" },
    { id: 2, number: 2, capacity: 4, status: "occupied" },
    { id: 3, number: 3, capacity: 6, status: "reserved" },
    { id: 4, number: 4, capacity: 4, status: "available" },
  ]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: "Margherita Pizza",
      price: "$16.99",
      category: "mains",
      description: "Fresh mozzarella, basil, tomato sauce",
      available: true,
    },
    {
      id: 2,
      name: "Caesar Salad",
      price: "$12.99",
      category: "appetizers",
      description: "Crisp romaine, parmesan, croutons",
      available: true,
    },
    {
      id: 3,
      name: "Grilled Salmon",
      price: "$26.99",
      category: "mains",
      description: "Atlantic salmon with seasonal vegetables",
      available: true,
    },
  ]);

  // ---- FORM STATES ----
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAvailable, setNewAvailable] = useState(true);

  // ---- EDIT MODAL STATES ----
  const [isEditTableModalVisible, setIsEditTableModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);

  const [isEditMenuModalVisible, setIsEditMenuModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

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
      { id: Date.now(), number, capacity, status: "available" },
    ]);
    setNewNumber("");
    setNewCapacity("");
    message.success("เพิ่มโต๊ะสำเร็จ");
  };

  const handleDeleteTable = (id: number) => {
    setTables(tables.filter((t) => t.id !== id));
    message.success("ลบโต๊ะสำเร็จ");
  };

  const handleAddMenuItem = () => {
    if (!newName || !newPrice || !newCategory) {
      message.error("กรุณากรอก Name, Price และ Category");
      return;
    }
    const newItem: MenuItem = {
      id: Date.now(),
      name: newName,
      price: newPrice,
      category: newCategory,
      description: newDescription,
      available: newAvailable,
    };
    setMenuItems([...menuItems, newItem]);
    setNewName("");
    setNewPrice("");
    setNewCategory("");
    setNewDescription("");
    setNewAvailable(true);
    message.success("เพิ่มเมนูสำเร็จ");
  };

  const handleDeleteMenuItem = (id: number) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
    message.success("ลบเมนูสำเร็จ");
  };

  const handleToggleAvailability = (id: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  // ---- EDIT FUNCTIONS ----
  const handleEditTable = (table: TableData) => {
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

  return (
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
                            <Input
                              placeholder="Table Number"
                              value={newNumber}
                              onChange={(e) => setNewNumber(e.target.value)}
                            />
                          </Col>
                          <Col span={12}>
                            <Input
                              placeholder="Capacity"
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
                                <Text strong>{`Table ${table.number}`}</Text>
                                <br />
                                <Text type="secondary">
                                  {table.capacity} seats • {table.status}
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
                        <Input
                          placeholder="e.g. Spaghetti Carbonara"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                        <Row gutter={12}>
                          <Col span={12}>
                            <Input
                              placeholder="Price"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                            />
                          </Col>
                          <Col span={12}>
                            <Input
                              placeholder="Category"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                            />
                          </Col>
                        </Row>
                        <Input.TextArea
                          placeholder="Brief description"
                          rows={3}
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
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
                                  {item.price} • {item.category}
                                </Text>
                                <br />
                                <Text>{item.description}</Text>
                              </Col>
                              <Col>
                                <Space size="middle">
                                  <Button
                                    size="small"
                                    style={{
                                      background: item.available
                                        ? "#f6ffed"
                                        : "#fff1f0",
                                      color: item.available
                                        ? "#389e0d"
                                        : "#cf1322",
                                      border: item.available
                                        ? "1px solid #b7eb8f"
                                        : "1px solid #ffa39e",
                                      borderRadius: 4,
                                    }}
                                    onClick={() =>
                                      handleToggleAvailability(item.id)
                                    }
                                  >
                                    {item.available
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
          <Input
            placeholder="Table Number"
            value={editingTable?.number}
            onChange={(e) =>
              setEditingTable((prev) =>
                prev ? { ...prev, number: parseInt(e.target.value) || 0 } : prev
              )
            }
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Capacity"
            value={editingTable?.capacity}
            onChange={(e) =>
              setEditingTable((prev) =>
                prev
                  ? { ...prev, capacity: parseInt(e.target.value) || 0 }
                  : prev
              )
            }
            style={{ marginBottom: 12 }}
          />
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
          <Input
            placeholder="Name"
            value={editingMenu?.name}
            onChange={(e) =>
              setEditingMenu((prev) =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Price"
            value={editingMenu?.price}
            onChange={(e) =>
              setEditingMenu((prev) =>
                prev ? { ...prev, price: e.target.value } : prev
              )
            }
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Category"
            value={editingMenu?.category}
            onChange={(e) =>
              setEditingMenu((prev) =>
                prev ? { ...prev, category: e.target.value } : prev
              )
            }
            style={{ marginBottom: 12 }}
          />
          <Input.TextArea
            placeholder="Description"
            rows={3}
            value={editingMenu?.description}
            onChange={(e) =>
              setEditingMenu((prev) =>
                prev ? { ...prev, description: e.target.value } : prev
              )
            }
            style={{ marginBottom: 12 }}
          />
          <div>
            <span>Available: </span>
            <Switch
              checked={editingMenu?.available}
              onChange={(checked) =>
                setEditingMenu((prev) =>
                  prev ? { ...prev, available: checked } : prev
                )
              }
            />
          </div>
        </Modal>
      </Layout.Content>
    </Layout>
  );
};

export default Billing;

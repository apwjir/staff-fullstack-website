import { useState, useEffect } from "react";
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
  Spin,
} from "antd";
import type { UploadFile } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TableOutlined,
  UploadOutlined,
  UserOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import "./Setting.css";
import { adminApiService, type MenuItem as BackendMenuItem, type Table as BackendTable, type User as BackendUser, mapTableStatus } from "../services/api";

const { Title, Text } = Typography;

export type TableStatus = "available" | "occupied";

export interface Table {
  id: number;
  tableNumber: number;
  seats: number;
  status: TableStatus;
  qrCodeToken?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  foodtype: string;
  description: string | null;
  isAvailable: boolean;
  photoUrl?: string | null;
  photoId?: string | null;
}

interface Staff {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const Setting: React.FC = () => {
  const [role] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading Settings data...');

        // Load data individually to catch specific errors
        let backendTables: BackendTable[] = [];
        let backendMenuItems: BackendMenuItem[] = [];
        let backendUsers: BackendUser[] = [];

        try {
          backendTables = await adminApiService.getTables();
          console.log('Tables loaded:', backendTables.length);
        } catch (error) {
          console.error('Failed to load tables:', error);
          message.error('Failed to load tables');
        }

        try {
          backendMenuItems = await adminApiService.getMenuItems();
          console.log('Menu items loaded:', backendMenuItems.length);
        } catch (error) {
          console.error('Failed to load menu items:', error);
          message.error('Failed to load menu items');
        }

        try {
          console.log('Attempting to load users...');
          console.log('Auth token available:', !!localStorage.getItem('adminToken'));
          backendUsers = await adminApiService.getUsers();
          console.log('Users loaded successfully:', backendUsers.length, backendUsers);
        } catch (error) {
          console.error('Failed to load users - detailed error:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
          }
          message.error('Failed to load users - check console for details');
        }

        // Convert tables to frontend format
        const frontendTables: Table[] = backendTables.map((table: BackendTable) => ({
          id: table.id,
          tableNumber: table.tableNumber,
          seats: table.capacity,
          status: mapTableStatus(table.status),
          qrCodeToken: table.qrCodeToken,
        }));

        // Convert menu items to frontend format
        const frontendMenuItems: MenuItem[] = backendMenuItems.map((item: BackendMenuItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          foodtype: item.foodtype,
          description: item.description,
          isAvailable: item.isAvailable,
          photoUrl: item.photoUrl,
          photoId: item.photoId,
        }));

        // Convert users to frontend format
        const frontendStaffs: Staff[] = backendUsers.map((user: BackendUser) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        }));

        console.log('Setting data:', {
          tables: frontendTables.length,
          menuItems: frontendMenuItems.length,
          staffs: frontendStaffs.length
        });

        setTables(frontendTables);
        setMenuItems(frontendMenuItems);
        setStaffs(frontendStaffs);

      } catch (error) {
        console.error('Failed to load data:', error);
        message.error('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]);

  const [isEditStaffModalVisible, setIsEditStaffModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // ---- FUNCTIONS ----
  const handleAddTable = async () => {
    if (!newNumber || !newCapacity) {
      message.error("Please fill in Table Number and Capacity");
      return;
    }
    const number = parseInt(newNumber);
    const capacity = parseInt(newCapacity);
    if (isNaN(number) || isNaN(capacity)) {
      message.error("Please enter numbers only");
      return;
    }

    try {
      const newTable = await adminApiService.createTable({
        tableNumber: number,
        capacity: capacity
      });

      const frontendTable: Table = {
        id: newTable.id,
        tableNumber: newTable.tableNumber,
        seats: newTable.capacity,
        status: mapTableStatus(newTable.status),
        qrCodeToken: newTable.qrCodeToken,
      };

      setTables([...tables, frontendTable]);
      setNewNumber("");
      setNewCapacity("");
      message.success("Table added successfully");
    } catch (error) {
      console.error('Failed to add table:', error);
      message.error("Failed to add table. Please try again.");
    }
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
    // Initialize with existing image if available
    if (item.photoUrl) {
      setEditFileList([{
        uid: '-1',
        name: 'current-image',
        status: 'done',
        url: item.photoUrl,
        thumbUrl: item.photoUrl,
      }]);
    } else {
      setEditFileList([]);
    }
    setIsEditMenuModalVisible(true);
  };

  const handleSaveEditMenu = async () => {
    if (!editingMenu) return;

    try {
      // Check if there's a new image file to upload
      const newImageFile = editFileList.find(file => file.originFileObj);
      const imageFile = newImageFile ? newImageFile.originFileObj as File : undefined;

      let updatedItem: BackendMenuItem;
      const updateData = {
        name: editingMenu.name,
        price: editingMenu.price,
        foodtype: editingMenu.foodtype as 'RICE' | 'NOODLE' | 'DESSERT' | 'DRINK',
        description: editingMenu.description,
        isAvailable: editingMenu.isAvailable,
      };

      if (imageFile) {
        updatedItem = await adminApiService.updateMenuItemWithImage(editingMenu.id, updateData, imageFile);
      } else {
        updatedItem = await adminApiService.updateMenuItem(editingMenu.id, updateData);
      }

      const frontendItem: MenuItem = {
        id: updatedItem.id,
        name: updatedItem.name,
        price: updatedItem.price,
        foodtype: updatedItem.foodtype,
        description: updatedItem.description,
        isAvailable: updatedItem.isAvailable,
        photoUrl: updatedItem.photoUrl,
        photoId: updatedItem.photoId,
      };

      setMenuItems((prev) =>
        prev.map((item) => (item.id === editingMenu.id ? frontendItem : item))
      );
      message.success("Menu item updated successfully");
    } catch (error) {
      console.error('Failed to update menu item:', error);
      message.error("Failed to update menu item. Please try again.");
    }

    setIsEditMenuModalVisible(false);
    setEditingMenu(null);
    setEditFileList([]);
  };

  // ---- MENU FUNCTIONS ----
  const handleAddMenuItem = async () => {
    if (!newName || !newPrice || !newFoodtype) {
      message.error("Please fill in Name, Price and Category");
      return;
    }

    try {
      const newItem = {
        name: newName,
        price: parseFloat(newPrice),
        foodtype: newFoodtype as 'RICE' | 'NOODLE' | 'DESSERT' | 'DRINK',
        description: newDescription || null,
        isAvailable: newIsAvailable,
      };

      // Get the image file if uploaded
      const imageFile = fileList.length > 0 ? fileList[0].originFileObj : undefined;

      let createdItem: BackendMenuItem;
      if (imageFile) {
        createdItem = await adminApiService.createMenuItemWithImage(newItem, imageFile as File);
      } else {
        createdItem = await adminApiService.createMenuItem(newItem);
      }

      const frontendItem: MenuItem = {
        id: createdItem.id,
        name: createdItem.name,
        price: createdItem.price,
        foodtype: createdItem.foodtype,
        description: createdItem.description,
        isAvailable: createdItem.isAvailable,
        photoUrl: createdItem.photoUrl,
        photoId: createdItem.photoId,
      };

      setMenuItems([...menuItems, frontendItem]);
      setNewName("");
      setNewPrice("");
      setNewFoodtype("");
      setNewDescription("");
      setNewIsAvailable(true);
      setFileList([]); // Clear uploaded files
      message.success("Menu item added successfully");
    } catch (error) {
      console.error('Failed to add menu item:', error);
      message.error("Failed to add menu item. Please try again.");
    }
  };

  const handleDeleteMenuItem = (id: number) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
    message.success("ลบเมนูสำเร็จ");
  };

  // ---- STAFF FUNCTIONS ----
  const handleAddStaff = async () => {
    if (!newUser || !newEmail || !newPassword) {
      message.error("Please fill in Name, Email and Password");
      return;
    }

    try {
      const userData = {
        name: newUser,
        email: newEmail,
        password: newPassword,
      };

      const createdUser = await adminApiService.createUser(userData);

      const newStaff: Staff = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
      };

      setStaffs([...staffs, newStaff]);
      setNewUser("");
      setNewEmail("");
      setNewPassword("");
      message.success("Staff added successfully");
    } catch (error) {
      console.error('Failed to add staff:', error);
      message.error("Failed to add staff. Please try again.");
    }
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
        <Layout.Content style={{ margin: "0 10rem", paddingTop: "2rem" }} className="mobile-responsive-content">
          <Title level={2} style={{ fontSize: 32, marginBottom: 4 }} className="mobile-responsive-title">
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
                        {tables.length === 0 ? (
                          <Card size="small" style={{ borderRadius: 8, textAlign: 'center', padding: '20px' }}>
                            <Text type="secondary">No tables found. Add a new table below.</Text>
                          </Card>
                        ) : (
                          tables.map((table) => (
                            <Card
                              key={table.id}
                              size="small"
                              style={{ borderRadius: 8 }}
                            >
                              <Row justify="space-between" align="middle">
                                <Col>
                                  <Text strong>{`Table ${table.tableNumber}`}</Text>
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
                        )))}
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

                    <Col md={1} className="hidden-xs">
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
                        {menuItems.length === 0 ? (
                          <Card size="small" style={{ borderRadius: 8, textAlign: 'center', padding: '20px' }}>
                            <Text type="secondary">No menu items found. Add a new item below.</Text>
                          </Card>
                        ) : (
                          menuItems.map((item) => (
                            <Card
                              key={item.id}
                              size="small"
                              style={{ borderRadius: 8 }}
                            >
                              <Row justify="space-between" align="middle">
                                <Col flex="1">
                                  <Row gutter={12} align="middle">
                                    <Col>
                                      {item.photoUrl ? (
                                        <img
                                          src={item.photoUrl}
                                          alt={item.name}
                                          style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 8,
                                            objectFit: 'cover',
                                            border: '1px solid #f0f0f0'
                                          }}
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 8,
                                            backgroundColor: '#f5f5f5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #f0f0f0'
                                          }}
                                        >
                                          <PictureOutlined style={{ color: '#d9d9d9', fontSize: 20 }} />
                                        </div>
                                      )}
                                    </Col>
                                    <Col flex="1">
                                      <Text strong>{item.name}</Text>
                                      <br />
                                      <Text type="secondary">
                                        {item.price} ฿ • {item.foodtype}
                                      </Text>
                                      {item.description && (
                                        <>
                                          <br />
                                          <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {item.description}
                                          </Text>
                                        </>
                                      )}
                                    </Col>
                                  </Row>
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
                        )))}
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
                              {staffs.length === 0 ? (
                                <Card size="small" style={{ borderRadius: 8, textAlign: 'center', padding: '20px' }}>
                                  <Text type="secondary">No staff found. Add a new staff member below.</Text>
                                </Card>
                              ) : (
                                staffs.map((staff) => (
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
                              )))}
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Image</label>
            <Upload
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('You can only upload image files!');
                  return false;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Image must be smaller than 5MB!');
                  return false;
                }
                return false;
              }}
              fileList={editFileList}
              onChange={({ fileList: newFileList }) => {
                setEditFileList(newFileList);
              }}
              listType="picture-card"
              maxCount={1}
            >
              {editFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
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

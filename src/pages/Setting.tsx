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
  Select,
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
import {
  adminApiService,
  type MenuItem as BackendMenuItem,
  type Table as BackendTable,
  type User as BackendUser,
  mapTableStatus,
} from "../services/api";

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
  userType: "STAFF" | "INTERNSHIP";
  createdAt: string;
}

const Setting: React.FC = () => {
  const [role] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);

  // Listen for real-time table status updates
  useEffect(() => {
    const handleTableStatusChanged = (event: CustomEvent) => {
      const { tableId, status } = event.detail;
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId
            ? {
                ...table,
                status: status === "AVAILABLE" ? "available" : "occupied",
              }
            : table
        )
      );
    };

    const handleSessionStarted = (event: CustomEvent) => {
      const { tableId } = event.detail;
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, status: "occupied" } : table
        )
      );
    };

    const handleSessionEnded = (event: CustomEvent) => {
      const { tableId } = event.detail;
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, status: "available" } : table
        )
      );
    };

    window.addEventListener(
      "tableStatusChanged",
      handleTableStatusChanged as EventListener
    );
    window.addEventListener(
      "sessionStarted",
      handleSessionStarted as EventListener
    );
    window.addEventListener(
      "sessionEnded",
      handleSessionEnded as EventListener
    );

    return () => {
      window.removeEventListener(
        "tableStatusChanged",
        handleTableStatusChanged as EventListener
      );
      window.removeEventListener(
        "sessionStarted",
        handleSessionStarted as EventListener
      );
      window.removeEventListener(
        "sessionEnded",
        handleSessionEnded as EventListener
      );
    };
  }, []);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load data individually to catch specific errors
        let backendTables: BackendTable[] = [];
        let backendMenuItems: BackendMenuItem[] = [];
        let backendUsers: BackendUser[] = [];

        try {
          backendTables = await adminApiService.getTables();
        } catch (error) {
          console.error("Failed to load tables:", error);
          message.error("Failed to load tables");
        }

        try {
          backendMenuItems = await adminApiService.getMenuItems();
        } catch (error) {
          console.error("Failed to load menu items:", error);
          message.error("Failed to load menu items");
        }

        try {
          backendUsers = await adminApiService.getUsers();
        } catch (error) {
          console.error("Failed to load users - detailed error:", error);
          if (error instanceof Error) {
            console.error("Error message:", error.message);
          }
          message.error("Failed to load users - check console for details");
        }

        // Convert tables to frontend format
        const frontendTables: Table[] = backendTables.map(
          (table: BackendTable) => ({
            id: table.id,
            tableNumber: table.tableNumber,
            seats: table.capacity,
            status: mapTableStatus(table.status),
            qrCodeToken: table.qrCodeToken,
          })
        );

        // Convert menu items to frontend format
        const frontendMenuItems: MenuItem[] = backendMenuItems.map(
          (item: BackendMenuItem) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            foodtype: item.foodtype,
            description: item.description,
            isAvailable: item.isAvailable,
            photoUrl: item.photoUrl,
            photoId: item.photoId,
          })
        );

        // Convert users to frontend format
        const frontendStaffs: Staff[] = backendUsers.map(
          (user: BackendUser) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            createdAt: user.createdAt,
          })
        );

        // Data loaded successfully

        setTables(frontendTables);
        setMenuItems(frontendMenuItems);
        setStaffs(frontendStaffs);
      } catch (error) {
        console.error("Failed to load data:", error);
        message.error("Failed to load data. Please try again.");
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
  const [newInternshipEmail, setNewInternshipEmail] = useState("");

  // ---- EDIT MODAL STATES ----
  const [isEditTableModalVisible, setIsEditTableModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const [isEditMenuModalVisible, setIsEditMenuModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

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
        capacity: capacity,
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
      console.error("Failed to add table:", error);
      message.error("Failed to add table. Please try again.");
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      await adminApiService.deleteTable(id);
      setTables(tables.filter((t) => t.id !== id));
      message.success("Table deleted successfully");
    } catch (error) {
      console.error("Failed to delete table:", error);
      message.error("Failed to delete table. Please try again.");
    }
  };

  const handleToggleAvailability = async (id: number) => {
    const item = menuItems.find((item) => item.id === id);
    if (!item) return;

    try {
      const updatedItem = await adminApiService.updateMenuItem(id, {
        name: item.name,
        price: item.price,
        foodtype: item.foodtype as "RICE" | "NOODLE" | "DESSERT" | "DRINK",
        description: item.description,
        isAvailable: !item.isAvailable,
      });

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
        prev.map((menuItem) => (menuItem.id === id ? frontendItem : menuItem))
      );

      message.success(
        `Menu item ${updatedItem.isAvailable ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      message.error(
        "Failed to update menu item availability. Please try again."
      );
    }
  };

  // ---- EDIT FUNCTIONS ----
  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsEditTableModalVisible(true);
  };

  const handleSaveEditTable = async () => {
    if (!editingTable) return;

    try {
      const updatedTable = await adminApiService.updateTable(editingTable.id, {
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.seats,
      });

      const frontendTable: Table = {
        id: updatedTable.id,
        tableNumber: updatedTable.tableNumber,
        seats: updatedTable.capacity,
        status: mapTableStatus(updatedTable.status),
        qrCodeToken: updatedTable.qrCodeToken,
      };

      setTables((prev) =>
        prev.map((t) => (t.id === editingTable.id ? frontendTable : t))
      );
      message.success("Table updated successfully");
    } catch (error) {
      console.error("Failed to update table:", error);
      message.error("Failed to update table. Please try again.");
    }

    setIsEditTableModalVisible(false);
    setEditingTable(null);
  };

  const handleEditMenu = (item: MenuItem) => {
    setEditingMenu(item);
    setIsEditMenuModalVisible(true);
  };

  const handleSaveEditMenu = async () => {
    if (!editingMenu) return;

    try {
      const updateData = {
        name: editingMenu.name,
        price: editingMenu.price,
        foodtype: editingMenu.foodtype as
          | "RICE"
          | "NOODLE"
          | "DESSERT"
          | "DRINK",
        description: editingMenu.description,
        isAvailable: editingMenu.isAvailable,
      };

      const updatedItem = await adminApiService.updateMenuItem(
        editingMenu.id,
        updateData
      );

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
      console.error("Failed to update menu item:", error);
      message.error("Failed to update menu item. Please try again.");
    }

    setIsEditMenuModalVisible(false);
    setEditingMenu(null);
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
        foodtype: newFoodtype as "RICE" | "NOODLE" | "DESSERT" | "DRINK",
        description: newDescription || null,
        isAvailable: newIsAvailable,
      };

      // Get the image file if uploaded
      const imageFile =
        fileList.length > 0 ? fileList[0].originFileObj : undefined;

      let createdItem: BackendMenuItem;
      if (imageFile) {
        createdItem = await adminApiService.createMenuItemWithImage(
          newItem,
          imageFile as File
        );
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
      console.error("Failed to add menu item:", error);
      message.error("Failed to add menu item. Please try again.");
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    try {
      await adminApiService.deleteMenuItem(id);
      setMenuItems(menuItems.filter((item) => item.id !== id));
      message.success("Menu item deleted successfully");
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      message.error("Failed to delete menu item. Please try again.");
    }
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
        userType: createdUser.userType,
        createdAt: createdUser.createdAt,
      };

      setStaffs([...staffs, newStaff]);
      setNewUser("");
      setNewEmail("");
      setNewPassword("");
      message.success("Staff added successfully");
    } catch (error) {
      console.error("Failed to add staff:", error);
      message.error("Failed to add staff. Please try again.");
    }
  };

  const handleAddInternshipStaff = async () => {
    if (!newInternshipEmail) {
      message.error("Please enter an email address");
      return;
    }

    try {
      const createdUser = await adminApiService.createInternshipUser(
        newInternshipEmail
      );

      const newStaff: Staff = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        userType: createdUser.userType,
        createdAt: createdUser.createdAt,
      };

      setStaffs([...staffs, newStaff]);
      setNewInternshipEmail("");
      message.success(
        "Internship staff added successfully. They can now login with Google OAuth using this email."
      );
    } catch (error) {
      console.error("Failed to add internship staff:", error);
      message.error("Failed to add internship staff. Please try again.");
    }
  };

  const handleDeleteStaff = async (id: number) => {
    try {
      await adminApiService.deleteUser(id);
      setStaffs(staffs.filter((s) => s.id !== id));
      message.success("Staff deleted successfully");
    } catch (error) {
      console.error("Failed to delete staff:", error);
      message.error("Failed to delete staff. Please try again.");
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setIsEditStaffModalVisible(true);
  };

  const handleSaveEditStaff = async () => {
    if (!editingStaff) return;

    try {
      const updatedUser = await adminApiService.updateUser(editingStaff.id, {
        name: editingStaff.name,
      });

      const updatedStaff: Staff = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
        createdAt: updatedUser.createdAt,
      };

      setStaffs((prev) =>
        prev.map((s) => (s.id === editingStaff.id ? updatedStaff : s))
      );

      message.success("Staff username updated successfully");
    } catch (error) {
      console.error("Failed to update staff:", error);
      message.error("Failed to update staff. Please try again.");
    }

    setIsEditStaffModalVisible(false);
    setEditingStaff(null);
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Layout.Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
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
            itemColor: "#6b7280",
            itemHoverColor: "#111827",
            itemSelectedColor: "#000000",
            itemActiveColor: "#000000",
            inkBarColor: "#000000",
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <Layout.Content
          style={{ margin: "0 10rem", paddingTop: "2rem" }}
          className="mobile-responsive-content"
        >
          <Title
            level={2}
            style={{ fontSize: 32, marginBottom: 4 }}
            className="mobile-responsive-title"
          >
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
                  <Card
                    style={{ borderRadius: 12, marginTop: 24, padding: 16 }}
                  >
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
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: 8,
                                  fontWeight: 500,
                                }}
                              >
                                Table Number
                              </label>
                              <Input
                                placeholder="Enter table number"
                                value={newNumber}
                                onChange={(e) => setNewNumber(e.target.value)}
                              />
                            </Col>
                            <Col span={12}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: 8,
                                  fontWeight: 500,
                                }}
                              >
                                Capacity
                              </label>
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
                            <Card
                              size="small"
                              style={{
                                borderRadius: 8,
                                textAlign: "center",
                                padding: "20px",
                              }}
                            >
                              <Text type="secondary">
                                No tables found. Add a new table below.
                              </Text>
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
                                    <Text
                                      strong
                                    >{`Table ${table.tableNumber}`}</Text>
                                    <br />
                                    <Text type="secondary">
                                      {table.seats} seats
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
                                        onClick={() =>
                                          handleDeleteTable(table.id)
                                        }
                                      />
                                    </Space>
                                  </Col>
                                </Row>
                              </Card>
                            ))
                          )}
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
                  <Card
                    style={{ borderRadius: 12, marginTop: 24, padding: 16 }}
                  >
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
                            <label
                              style={{
                                display: "block",
                                marginBottom: 8,
                                fontWeight: 500,
                              }}
                            >
                              Menu Item Name
                            </label>
                            <Input
                              placeholder="e.g. Spaghetti Carbonara"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                            />
                          </div>
                          <Row gutter={12}>
                            <Col span={12}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: 8,
                                  fontWeight: 500,
                                }}
                              >
                                Price
                              </label>
                              <Input
                                placeholder="Enter price"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                              />
                            </Col>
                            <Col span={12}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: 8,
                                  fontWeight: 500,
                                }}
                              >
                                Category
                              </label>
                              <Select
                                placeholder="Select category"
                                value={newFoodtype}
                                onChange={(value) => setNewFoodtype(value)}
                                style={{ width: "100%" }}
                              >
                                <Select.Option value="RICE">RICE</Select.Option>
                                <Select.Option value="NOODLE">
                                  NOODLE
                                </Select.Option>
                                <Select.Option value="DESSERT">
                                  DESSERT
                                </Select.Option>
                                <Select.Option value="DRINK">
                                  DRINK
                                </Select.Option>
                              </Select>
                            </Col>
                          </Row>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: 8,
                                fontWeight: 500,
                              }}
                            >
                              Description
                            </label>
                            <Input.TextArea
                              placeholder="Brief description of the dish"
                              rows={3}
                              value={newDescription}
                              onChange={(e) =>
                                setNewDescription(e.target.value)
                              }
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
                            <Card
                              size="small"
                              style={{
                                borderRadius: 8,
                                textAlign: "center",
                                padding: "20px",
                              }}
                            >
                              <Text type="secondary">
                                No menu items found. Add a new item below.
                              </Text>
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
                                            key={`${item.id}-${item.photoUrl}`}
                                            src={item.photoUrl}
                                            alt={item.name}
                                            style={{
                                              width: 60,
                                              height: 60,
                                              borderRadius: 8,
                                              objectFit: "cover",
                                              border: "1px solid #f0f0f0",
                                            }}
                                            onError={(e) => {
                                              const target =
                                                e.target as HTMLImageElement;
                                              target.style.display = "none";
                                            }}
                                          />
                                        ) : (
                                          <div
                                            style={{
                                              width: 60,
                                              height: 60,
                                              borderRadius: 8,
                                              backgroundColor: "#f5f5f5",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              border: "1px solid #f0f0f0",
                                            }}
                                          >
                                            <PictureOutlined
                                              style={{
                                                color: "#d9d9d9",
                                                fontSize: 20,
                                              }}
                                            />
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
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: "12px" }}
                                            >
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
                            ))
                          )}
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
                          style={{
                            borderRadius: 12,
                            marginTop: 24,
                            padding: 16,
                          }}
                        >
                          <Row gutter={16}>
                            {/* Add New Staff - Left Column */}
                            <Col xs={24} md={10}>
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                                size="large"
                              >
                                <Title level={5}>
                                  <PlusOutlined /> Add New Staff (Login with
                                  Password)
                                </Title>
                                <div>
                                  <label
                                    style={{
                                      display: "block",
                                      marginBottom: 8,
                                      fontWeight: 500,
                                    }}
                                  >
                                    Username
                                  </label>
                                  <Input
                                    placeholder="Enter username"
                                    value={newUser}
                                    onChange={(e) => setNewUser(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label
                                    style={{
                                      display: "block",
                                      marginBottom: 8,
                                      fontWeight: 500,
                                    }}
                                  >
                                    Email
                                  </label>
                                  <Input
                                    placeholder="Enter email address"
                                    value={newEmail}
                                    onChange={(e) =>
                                      setNewEmail(e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <label
                                    style={{
                                      display: "block",
                                      marginBottom: 8,
                                      fontWeight: 500,
                                    }}
                                  >
                                    Password
                                  </label>
                                  <Input.Password
                                    placeholder="Enter password"
                                    value={newPassword}
                                    onChange={(e) =>
                                      setNewPassword(e.target.value)
                                    }
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

                              <div
                                style={{
                                  margin: "24px 0",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              />

                              {/* Add Internship Staff */}
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                                size="large"
                              >
                                <Title level={5}>
                                  <PlusOutlined /> Add Internship Staff (Google
                                  OAuth Only)
                                </Title>
                                <div>
                                  <label
                                    style={{
                                      display: "block",
                                      marginBottom: 8,
                                      fontWeight: 500,
                                    }}
                                  >
                                    Email Address
                                  </label>
                                  <Input
                                    placeholder="Enter their email address"
                                    value={newInternshipEmail}
                                    onChange={(e) =>
                                      setNewInternshipEmail(e.target.value)
                                    }
                                  />
                                  <Text
                                    type="secondary"
                                    style={{
                                      fontSize: "12px",
                                      marginTop: 4,
                                      display: "block",
                                    }}
                                  >
                                    They will login using Google OAuth with this
                                    email
                                  </Text>
                                </div>
                                <Button
                                  type="primary"
                                  block
                                  onClick={handleAddInternshipStaff}
                                  style={{
                                    backgroundColor: "#000000ff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    height: 40,
                                    fontWeight: 500,
                                  }}
                                >
                                  Add Internship Staff
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
                                  <Card
                                    size="small"
                                    style={{
                                      borderRadius: 8,
                                      textAlign: "center",
                                      padding: "20px",
                                    }}
                                  >
                                    <Text type="secondary">
                                      No staff found. Add a new staff member
                                      below.
                                    </Text>
                                  </Card>
                                ) : (
                                  staffs.map((staff) => (
                                    <Card
                                      key={staff.id}
                                      size="small"
                                      style={{ borderRadius: 8 }}
                                    >
                                      <Row
                                        justify="space-between"
                                        align="middle"
                                      >
                                        <Col>
                                          <Text strong>{staff.name}</Text>
                                          <br />
                                          <Text type="secondary">
                                            {staff.email}
                                          </Text>
                                          <br />
                                          <Text
                                            style={{
                                              fontSize: "12px",
                                              padding: "2px 6px",
                                              borderRadius: 4,
                                              backgroundColor:
                                                staff.userType === "STAFF"
                                                  ? "#f6ffed"
                                                  : "#fff7e6",
                                              color:
                                                staff.userType === "STAFF"
                                                  ? "#389e0d"
                                                  : "#d48806",
                                              border:
                                                staff.userType === "STAFF"
                                                  ? "1px solid #b7eb8f"
                                                  : "1px solid #ffec3d",
                                            }}
                                          >
                                            {staff.userType === "STAFF"
                                              ? "Staff (Password)"
                                              : "Internship (OAuth)"}
                                          </Text>
                                        </Col>
                                        <Col>
                                          <Space size="middle">
                                            <EditOutlined
                                              style={{ cursor: "pointer" }}
                                              onClick={() =>
                                                handleEditStaff(staff)
                                              }
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
                                  ))
                                )}
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
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Table Number
              </label>
              <Input
                placeholder="Enter table number"
                type="number"
                value={editingTable?.tableNumber}
                onChange={(e) =>
                  setEditingTable((prev) =>
                    prev
                      ? { ...prev, tableNumber: parseInt(e.target.value) || 0 }
                      : prev
                  )
                }
              />
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Seats
              </label>
              <Input
                placeholder="Enter number of seats"
                type="number"
                value={editingTable?.seats}
                onChange={(e) =>
                  setEditingTable((prev) =>
                    prev
                      ? { ...prev, seats: parseInt(e.target.value) || 0 }
                      : prev
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
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Menu Item Name
              </label>
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
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Price
              </label>
              <Input
                placeholder="Enter price"
                value={editingMenu?.price}
                onChange={(e) =>
                  setEditingMenu((prev) =>
                    prev
                      ? { ...prev, price: parseInt(e.target.value) || 0 }
                      : prev
                  )
                }
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Category
              </label>
              <Select
                placeholder="Select category"
                value={editingMenu?.foodtype}
                onChange={(value) =>
                  setEditingMenu((prev) =>
                    prev ? { ...prev, foodtype: value } : prev
                  )
                }
                style={{ width: "100%" }}
              >
                <Select.Option value="RICE">RICE</Select.Option>
                <Select.Option value="NOODLE">NOODLE</Select.Option>
                <Select.Option value="DESSERT">DESSERT</Select.Option>
                <Select.Option value="DRINK">DRINK</Select.Option>
              </Select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Description
              </label>
              <Input.TextArea
                placeholder="Enter description"
                rows={3}
                value={editingMenu?.description ?? ""}
                onChange={(e) =>
                  setEditingMenu((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Current Image
              </label>
              {editingMenu?.photoUrl ? (
                <div style={{ marginBottom: 8 }}>
                  <img
                    src={editingMenu.photoUrl}
                    alt={editingMenu.name}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: "1px solid #f0f0f0",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    border: "1px dashed #d9d9d9",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                    color: "#999",
                  }}
                >
                  No Image
                </div>
              )}
              <div
                style={{ color: "#999", fontSize: "12px", fontStyle: "italic" }}
              >
                Note: To change the image, please create a new menu item
              </div>
            </div>
            <div>
              <span>Available: </span>
              <Switch
                checked={editingMenu?.isAvailable}
                onChange={(checked) =>
                  setEditingMenu((prev) =>
                    prev ? { ...prev, isAvailable: checked } : prev
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
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Username
              </label>
              <Input
                placeholder="Enter staff username"
                value={editingStaff?.name}
                onChange={(e) =>
                  setEditingStaff((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
                  )
                }
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Email
              </label>
              <Input
                placeholder="Email cannot be changed"
                value={editingStaff?.email}
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  color: "#999",
                  cursor: "not-allowed",
                }}
              />
              <Text
                type="secondary"
                style={{ fontSize: "12px", display: "block", marginTop: 4 }}
              >
                Email cannot be changed for security reasons
              </Text>
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Password
              </label>
              <Input.Password
                placeholder="Password cannot be changed here"
                value="••••••••••••"
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  color: "#999",
                  cursor: "not-allowed",
                }}
              />
              <Text
                type="secondary"
                style={{ fontSize: "12px", display: "block", marginTop: 4 }}
              >
                Password cannot be changed here for security reasons
              </Text>
            </div>
          </Modal>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Setting;

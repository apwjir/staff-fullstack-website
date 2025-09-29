import React, { useState } from "react";
import "./ืnav.css";
import ExitIcon from "../assets/logout_24dp_4B5563_FILL0_wght400_GRAD0_opsz24.svg";
import DashboardIcon from "../assets/dashboard_24dp_4B5563_FILL0_wght400_GRAD0_opsz24.svg";
import OrderIcon from "../assets/receipt_24dp_4B5563_FILL0_wght400_GRAD0_opsz24.svg";
import BillingIcon from "../assets/credit_card_24dp_4B5563_FILL0_wght400_GRAD0_opsz24.svg";
import SettingIcon from "../assets/settings_24dp_4B5563_FILL0_wght400_GRAD0_opsz24.svg";
import { NavLink } from "react-router-dom";

function Nav() {
  const [name, setName] = useState("UwU");

  return (
    <div className="Box">
      {/* ✅ ครอบด้วย container เพื่อทำ max-width + margin auto */}
      <div className="container">
        {/* ซ้าย */}
        <div className="left">
          <p>Restaurant</p>
        </div>

        {/* เมนูกลาง */}
        <div className="middle-left">
          <ul>
            <li>
              <NavLink
                to="/Dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <img src={DashboardIcon} alt="Dashboard" />
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/Order"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <img src={OrderIcon} alt="Orders" />
                Orders
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/Billing"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <img src={BillingIcon} alt="Billing" />
                Billing
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/Setting"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <img src={SettingIcon} alt="Settings" />
                Settings
              </NavLink>
            </li>
          </ul>
        </div>

        {/* ขวา */}
        <div className="right">
          <p>Welcome, {name}</p>
          <button>
            <img src={ExitIcon} alt="Logout" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Nav;

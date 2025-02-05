import React from "react";
import { FiHome, FiUsers, FiSettings } from "react-icons/fi";

const Sidebar = ({ sidebarOpen, setShowSettingsForm }) => {
  return (
    <aside className={`fixed top-16 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
      <div className="p-4 space-y-2">
        <button className="w-full flex items-center p-3 text-white hover:bg-indigo-700 rounded-lg">
          <FiHome className="flex-shrink-0" size={20} />
          {sidebarOpen && <span className="ml-3">Dashboard</span>}
        </button>
        <button className="w-full flex items-center p-3 text-white hover:bg-indigo-700 rounded-lg">
          <FiUsers className="flex-shrink-0" size={20} />
          {sidebarOpen && <span className="ml-3">Users</span>}
        </button>
        <button onClick={() => setShowSettingsForm(true)} className="w-full flex items-center p-3 text-white hover:bg-indigo-700 rounded-lg">
          <FiSettings className="flex-shrink-0" size={20} />
          {sidebarOpen && <span className="ml-3">Settings</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

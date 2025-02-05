import React from "react";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";

const Navigation = ({ sidebarOpen, setSidebarOpen, isLoggedIn, setIsLoggedIn }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-700 to-purple-600 shadow-md h-16 flex items-center px-6 z-50 rounded-b-lg">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-gray-300 p-2 rounded-lg">
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      <div className="flex-1 text-xl font-semibold text-white ml-4">
        Admin Panel
      </div>
      {isLoggedIn && (
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
          <FiLogOut className="mr-2" /> Log Out
        </button>
      )}
    </nav>
  );
};

export default Navigation;

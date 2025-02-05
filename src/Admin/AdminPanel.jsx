import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import BulkUpload from "./BulkUpload";

import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiPlusCircle,
  FiEdit,
  FiTrash,
  FiUpload,
} from "react-icons/fi";

const AdminPanel = () => {
  // State variables (unchanged)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light', // or 'dark'
    notificationsEnabled: false,
  });
  
  const handleThemeChange = (e) => {
    setSettings({
      ...settings,
      theme: e.target.checked ? 'dark' : 'light',
    });
    // You can also store the theme preference in localStorage or context if needed
  };
  
  const handleNotificationsChange = (e) => {
    setSettings({
      ...settings,
      notificationsEnabled: e.target.checked,
    });
    // You can implement API calls or other logic to handle notification settings
  };
  
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    // Logic to save the settings, such as sending them to a backend or saving them locally
    setShowSettingsForm(false); // Close the form after submitting
  };
  
  const fetchUsers = useCallback(async () => {
    try {
      const { data: users } = await supabase.from("users").select("*");
      setUsers(users);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }, []);

  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    link: "",
    category_id: "",
  });
  const [bulkUploadData, setBulkUploadData] = useState("");
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  useEffect(() => {
    if (isLoggedIn) fetchUsers();
  }, [isLoggedIn, fetchUsers]);

  // Auto-clear message after 5 seconds (unchanged)
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Fetch categories and groups from the database (unchanged)
  const fetchCategoriesAndGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data: categories } = await supabase
        .from("categories")
        .select("*");
      const { data: groups } = await supabase
        .from("groups")
        .select("*, categories(name)");
      setCategories(categories);
      setGroups(groups);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchCategoriesAndGroups();
  }, [isLoggedIn, fetchCategoriesAndGroups]);

  // Login handler (unchanged)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await supabase
        .from("admin")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();
      if (!data) throw new Error("Invalid email or password");
      setIsLoggedIn(true);
      setMessage({ type: "success", text: "Logged in successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  // Handle form submission (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedGroup) {
        await supabase
          .from("groups")
          .update(groupData)
          .eq("id", selectedGroup.id);
        setMessage({ type: "success", text: "Group updated successfully!" });
      } else {
        await supabase.from("groups").insert([groupData]);
        setMessage({ type: "success", text: "Group added successfully!" });
      }
      fetchCategoriesAndGroups();
      setShowAddForm(false);
      setGroupData({ name: "", description: "", link: "", category_id: "" });
      setSelectedGroup(null);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  // Delete group handler (unchanged)
  const handleDelete = async () => {
    try {
      await supabase.from("groups").delete().eq("id", groupToDelete);
      setMessage({ type: "success", text: "Group deleted successfully!" });
      fetchCategoriesAndGroups();
      setShowConfirm(false);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setShowConfirm(false);
    }
  };

  // Bulk upload handler (unchanged)
  const handleBulkUpload = async () => {
    try {
      const groups = bulkUploadData.split("\n").map((line) => {
        const [name, description, link, category_id] = line.split(",");
        if (!name || !description || !link || !category_id) {
          throw new Error("Incorrect format! Please check the data.");
        }
        return {
          name: name.trim(),
          description: description.trim(),
          link: link.trim(),
          category_id: category_id.trim(),
        };
      });
      await supabase.from("groups").insert(groups);
      setMessage({ type: "success", text: "Bulk upload successful!" });
      fetchCategoriesAndGroups();
      setBulkUploadData("");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">
      {/* Navigation Bar (unchanged) */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-700 to-purple-600 shadow-md h-16 flex items-center px-6 z-50 rounded-b-lg">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:text-gray-300 p-2 rounded-lg"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="flex-1 text-xl font-semibold text-white ml-4">
          Admin Panel
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
          >
            <FiLogOut className="mr-2" /> Log Out
          </button>
        )}
      </nav>

      {/* Sidebar (unchanged) */}
      <aside
        className={`fixed top-16 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4 space-y-2">
          <button className="w-full flex items-center p-3 text-white hover:bg-indigo-700 rounded-lg">
            <FiHome className="flex-shrink-0" size={20} />
            {sidebarOpen && <span className="ml-3">Dashboard</span>}
          </button>
          <button className="w-full flex items-center p-3 text-white hover:bg-indigo-700 rounded-lg">
            <FiUsers className="flex-shrink-0" size={20} />
            {sidebarOpen && <span className="ml-3">Users</span>}
          </button>
          <button 
            onClick={() => setShowSettingsForm(true)}
            className="w-full flex items-center p-3 text-white hover:bg-indigo-700 rounded-lg"
          >
            <FiSettings className="flex-shrink-0" size={20} />
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        } min-h-screen p-8`}
      >
        {!isLoggedIn ? (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-6">
              <h1 className="text-3xl font-extrabold text-center text-gray-800">
                Admin Login
              </h1>

              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-lg ${
                      message.type === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-gray-800"
                    required
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-gray-800"
                    required
                    placeholder="Enter your password"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Login
                  </button>
                </div>
              </form>

              {/* Forgot Password / Helper Text */}
              <div className="flex justify-center text-sm text-gray-600">
                <span>Forgot your password?</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Groups</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
              >
                <FiPlusCircle size={20} className="mr-2" />
                New Group
              </button>
              <button
                onClick={() => setIsBulkUpload(true)}
                className="flex items-center bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
              >
                <FiUpload size={20} className="mr-2" />
                Bulk Upload
              </button>
            </div>

            {/* Bulk Upload Form */}
            {isBulkUpload &&
             <BulkUpload setIsBulkUpload={setIsBulkUpload} />
             }

            {/* Add/Edit Group Form (with improved style) */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-gray-800 p-6 rounded-lg w-96 shadow-xl"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Group Name */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Group Name
                        </label>
                        <input
                          type="text"
                          value={groupData.name}
                          onChange={(e) =>
                            setGroupData({ ...groupData, name: e.target.value })
                          }
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-black"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={groupData.description}
                          onChange={(e) =>
                            setGroupData({
                              ...groupData,
                              description: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-black"
                          required
                        />
                      </div>

                      {/* Link */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Link
                        </label>
                        <input
                          type="url"
                          value={groupData.link}
                          onChange={(e) =>
                            setGroupData({ ...groupData, link: e.target.value })
                          }
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-black"
                          required
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Category
                        </label>
                        <select
                          value={groupData.category_id}
                          onChange={(e) =>
                            setGroupData({
                              ...groupData,
                              category_id: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="w-1/3 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="w-1/3 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
                        >
                          {selectedGroup ? "Update" : "Add"} Group
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Groups List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {groups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-800"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      {group.description}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      {group.categories?.name}
                    </p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setGroupData({
                            name: group.name,
                            description: group.description,
                            link: group.link,
                            category_id: group.category_id,
                          });
                          setShowAddForm(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-600 transition-all duration-200"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirm(true);
                          setGroupToDelete(group.id);
                        }}
                        className="text-red-400 hover:text-red-600 transition-all duration-200"
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
                
            {/* Confirmation Modal for Deleting Group (unchanged) */}
            {showConfirm && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-gray-600 p-6 rounded-lg shadow-lg max-w-sm w-full">
                  <h3 className="text-xl font-semibold mb-4">
                    Are you sure you want to delete this group?
                  </h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full bg-red-500 text-white p-3 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

<AnimatePresence>
  {showSettingsForm && (
    <motion.div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 p-6 rounded-lg w-96 shadow-xl"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          {/* Theme Toggle */}
           <div>
            <label className="block text-sm font-medium text-white mb-1">
              Dark Mode
            </label>
            <div className="flex items-center">
              <label htmlFor="theme-toggle" className="mr-3 text-white">
                Light
              </label>
              <input
                type="checkbox"
                id="theme-toggle"
                checked={settings.theme === 'dark'}
                onChange={handleThemeChange}
                className="w-6 h-6 rounded-full bg-gray-600"
              />
              <label htmlFor="theme-toggle" className="ml-3 text-white">
                Dark
              </label>
            </div>
          </div>

          {/* Notifications Toggle */}
           <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email Notifications
            </label>
            <div className="flex items-center">
              <label htmlFor="notifications-toggle" className="mr-3 text-white">
                Off
              </label>
              <input
                type="checkbox"
                id="notifications-toggle"
                checked={settings.notificationsEnabled}
                onChange={handleNotificationsChange}
                className="w-6 h-6 rounded-full bg-gray-600"
              />
              <label htmlFor="notifications-toggle" className="ml-3 text-white">
                On
              </label>
            </div>
          </div>

        
           <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowSettingsForm(false)}
              className="w-1/3 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/3 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

          </>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import { FiMenu, FiX, FiHome, FiUsers, FiSettings, FiLogOut, FiPlusCircle, FiEdit, FiTrash } from "react-icons/fi";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    link: "",
    category_id: ""
  });
  const [bulkUploadData, setBulkUploadData] = useState("");
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const fetchCategoriesAndGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data: categories } = await supabase.from("categories").select("*");
      const { data: groups } = await supabase.from("groups").select("*, categories(name)");
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
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      await supabase.from("groups").delete().eq("id", id);
      setMessage({ type: "success", text: "Group deleted successfully!" });
      fetchCategoriesAndGroups();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleBulkUpload = async () => {
    try {
      const groups = bulkUploadData.split('\n').map(line => {
        const [name, description, link, category_id] = line.split(',');
        if (!name || !description || !link || !category_id) {
          throw new Error("Incorrect format! Please check the data.");
        }
        return {
          name: name.trim(),
          description: description.trim(),
          link: link.trim(),
          category_id: category_id.trim()
        };
      });
      await supabase.from('groups').insert(groups);
      setMessage({ type: "success", text: "Bulk upload successful!" });
      fetchCategoriesAndGroups();
      setBulkUploadData("");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4F8' }}>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md h-16 flex items-center px-6 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="flex-1 text-xl font-semibold text-indigo-600 ml-4">
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

      <aside className={`fixed top-16 left-0 h-full bg-white shadow-md transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <div className="p-4 space-y-2">
          <button className="w-full flex items-center p-3 text-indigo-600 hover:bg-indigo-100 rounded-lg">
            <FiHome className="flex-shrink-0" size={20} />
            {sidebarOpen && <span className="ml-3">Dashboard</span>}
          </button>
          <button className="w-full flex items-center p-3 text-indigo-600 hover:bg-indigo-100 rounded-lg">
            <FiUsers className="flex-shrink-0" size={20} />
            {sidebarOpen && <span className="ml-3">Users</span>}
          </button>
          <button className="w-full flex items-center p-3 text-indigo-600 hover:bg-indigo-100 rounded-lg">
            <FiSettings className="flex-shrink-0" size={20} />
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </button>
        </div>
      </aside>

      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"} min-h-screen p-8`}>
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-indigo-600">Admin Login</h1>
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 mb-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Log In
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add Group Form */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg w-48 mx-auto hover:bg-indigo-700"
            >
              <FiPlusCircle size={20} className="mr-2" /> Add New Group
            </button>
            {showAddForm && (
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-600">
                  {selectedGroup ? "Update Group" : "Create New Group"}
                </h2>
                <AnimatePresence>
                  {message.text && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-3 mb-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    value={groupData.name}
                    onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={groupData.description}
                    onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Link</label>
                  <input
                    type="url"
                    value={groupData.link}
                    onChange={(e) => setGroupData({ ...groupData, link: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={groupData.category_id}
                    onChange={(e) => setGroupData({ ...groupData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700"
                  >
                    {selectedGroup ? "Update Group" : "Add Group"}
                  </button>
                </div>
              </form>
            )}

            {/* Group List */}
            {loading ? (
              <div className="text-center text-gray-600">Loading groups...</div>
            ) : (
              <div className="space-y-6">
                {groups.length > 0 ? (
                  groups.map(group => (
                    <div key={group.id} className="flex justify-between items-center bg-white shadow-lg rounded-lg p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-600">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setGroupData({
                              name: group.name,
                              description: group.description,
                              link: group.link,
                              category_id: group.category_id
                            });
                            setShowAddForm(true);
                          }}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setGroupToDelete(group.id);
                            setShowConfirm(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-600">No groups found.</div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Are you sure you want to delete this group?</h3>
            <div className="flex justify-between">
              <button
                onClick={async () => {
                  await handleDelete(groupToDelete);
                  setShowConfirm(false);
                }}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

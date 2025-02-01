import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabaseClient";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupData, setGroupData] = useState({ name: "", description: "", link: "", category_id: "" });

  const [bulkUploadData, setBulkUploadData] = useState("");
  const [isBulkUpload, setIsBulkUpload] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // Fetch categories and groups
  const fetchCategoriesAndGroups = useCallback(async () => {
    setLoading(true);
    const categoriesData = await supabase.from("categories").select("*");
    const groupsData = await supabase.from("groups").select("*");

    if (categoriesData.error || groupsData.error) {
      setMessage({ type: "error", text: "Error fetching data." });
    } else {
      setCategories(categoriesData.data);
      setGroups(groupsData.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCategoriesAndGroups();
    }
  }, [isLoggedIn, fetchCategoriesAndGroups]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      setMessage({ type: "error", text: "Invalid email or password" });
    } else {
      setIsLoggedIn(true);
      setMessage({ type: "success", text: "Logged in successfully!" });
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setMessage({ type: "success", text: "Logged out successfully!" });
  };

  // Handle edit
  const handleEdit = (group) => {
    setSelectedGroup(group);
    setGroupData({ name: group.name, description: group.description, link: group.link, category_id: group.category_id });
  };

  // Handle delete confirmation
  const confirmDelete = (group) => {
    setGroupToDelete(group);
    setShowConfirm(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (groupToDelete) {
      const { error } = await supabase.from("groups").delete().eq("id", groupToDelete.id);
      if (error) {
        setMessage({ type: "error", text: "Error deleting group: " + error.message });
      } else {
        setMessage({ type: "success", text: "Group deleted successfully!" });
        fetchCategoriesAndGroups(); // Refresh groups
      }
      setShowConfirm(false);
      setGroupToDelete(null);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupData.category_id) {
      setMessage({ type: "error", text: "Please select a category!" });
      return;
    }

    if (selectedGroup) {
      const { error } = await supabase.from("groups").update(groupData).eq("id", selectedGroup.id);
      if (error) {
        setMessage({ type: "error", text: "Error updating group: " + error.message });
      } else {
        setMessage({ type: "success", text: "Group updated successfully!" });
        fetchCategoriesAndGroups(); // Refresh groups
        setSelectedGroup(null);
        setGroupData({ name: "", description: "", link: "", category_id: "" });
      }
    } else {
      const { error } = await supabase.from("groups").insert([groupData]);
      if (error) {
        setMessage({ type: "error", text: "Error adding group: " + error.message });
      } else {
        setMessage({ type: "success", text: "Group added successfully!" });
        fetchCategoriesAndGroups(); // Refresh groups
        setGroupData({ name: "", description: "", link: "", category_id: "" });
      }
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    try {
      const bulkDataArray = bulkUploadData.split("\n").map((line) => {
        const [name, description, link, category_id] = line.split(",");
        return { name: name.trim(), description: description.trim(), link: link.trim(), category_id: category_id.trim() };
      });

      const { error } = await supabase.from("groups").insert(bulkDataArray);
      if (error) {
        setMessage({ type: "error", text: "Error uploading groups: " + error.message });
      } else {
        setMessage({ type: "success", text: "Bulk groups uploaded successfully!" });
        fetchCategoriesAndGroups(); // Refresh groups
        setBulkUploadData("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error parsing bulk upload data. Please check the format." });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        {!isLoggedIn ? (
          <div>
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Admin Login</h1>
            {message.text && (
              <div className={`text-center p-3 mb-6 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Admin Panel</h1>
            {message.text && (
              <div className={`text-center p-3 mb-6 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsBulkUpload(!isBulkUpload)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isBulkUpload ? "Single Upload" : "Bulk Upload"}
              </button>
            </div>

            {!isBulkUpload ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    value={groupData.name}
                    onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={groupData.description}
                    onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Link</label>
                  <input
                    type="url"
                    value={groupData.link}
                    onChange={(e) => setGroupData({ ...groupData, link: e.target.value })}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={groupData.category_id}
                    onChange={(e) => setGroupData({ ...groupData, category_id: e.target.value })}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedGroup ? "Update Group" : "Add Group"}
                </button>
              </form>
            ) : (
              <div>
                <textarea
                  value={bulkUploadData}
                  onChange={(e) => setBulkUploadData(e.target.value)}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bulk data in CSV format (name, description, link, category_id)"
                  rows={8}
                />
                <button
                  onClick={handleBulkUpload}
                  className="w-full py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Upload Bulk Data
                </button>
              </div>
            )}

            {/* Groups List */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Groups</h2>
              {loading ? (
                <p className="text-center text-gray-600">Loading...</p>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.description}</p>
                      <a href={group.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Visit Group
                      </a>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleEdit(group)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(group)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800">Are you sure you want to delete this group?</h3>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

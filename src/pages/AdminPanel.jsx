import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Import the Supabase client

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupData, setGroupData] = useState({ name: "", description: "", link: "", category_id: "" });

  const [bulkUploadData, setBulkUploadData] = useState(""); // For bulk upload
  const [isBulkUpload, setIsBulkUpload] = useState(false); // Toggle between single and bulk upload

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchCategoriesAndGroups = async () => {
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
      };

      fetchCategoriesAndGroups();
    }
  }, [isLoggedIn]);

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMessage({ type: "success", text: "Logged out successfully!" });
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setGroupData({ name: group.name, description: group.description, link: group.link, category_id: group.category_id });
  };

  const handleDelete = async () => {
    if (groupToDelete) {
      const { error } = await supabase.from("groups").delete().eq("id", groupToDelete.id);
      if (error) {
        setMessage({ type: "error", text: "Error deleting group: " + error.message });
      } else {
        setMessage({ type: "success", text: "Group deleted successfully!" });
        setGroups(groups.filter((group) => group.id !== groupToDelete.id));
      }
      setShowConfirm(false);
      setGroupToDelete(null);
    }
  };

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
        setSelectedGroup(null);
        setGroupData({ name: "", description: "", link: "", category_id: "" });
      }
    } else {
      const { error } = await supabase.from("groups").insert([groupData]);
      if (error) {
        setMessage({ type: "error", text: "Error adding group: " + error.message });
      } else {
        setMessage({ type: "success", text: "Group added successfully!" });
        setGroupData({ name: "", description: "", link: "", category_id: "" });
      }
    }
  };

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
        setBulkUploadData("");
        setGroups([...groups, ...bulkDataArray]); // Update local groups state
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

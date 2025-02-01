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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        {!isLoggedIn ? (
          <div>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Admin Login</h1>
            {message.text && (
              <div className={`text-center p-3 mb-6 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Admin Panel</h1>
            {message.text && (
              <div className={`text-center p-3 mb-6 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {message.text}
              </div>
            )}

            {/* Rest of the admin panel code remains the same */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

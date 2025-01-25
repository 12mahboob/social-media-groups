import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Import the Supabase client

const AdminPanel = () => {
  // Admin Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To track if the user is logged in
  const [message, setMessage] = useState({ type: "", text: "" });

  // Group management states
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupData, setGroupData] = useState({ name: "", description: "", link: "", category_id: "" });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // To control the visibility of the confirmation
  const [groupToDelete, setGroupToDelete] = useState(null); // To store the group that is to be deleted

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch categories and groups if logged in
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
      .eq("password", password) // In real-world, make sure to use hashed passwords
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

  const handleDeleteConfirmation = (group) => {
    setGroupToDelete(group); // Set the group to be deleted
    setShowConfirm(true); // Show the confirmation
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
      setShowConfirm(false); // Hide the confirmation modal
      setGroupToDelete(null); // Clear the group to delete
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false); // Hide the confirmation modal
    setGroupToDelete(null); // Clear the group to delete
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

  return (
    <div className="min-h-screen p-8 bg-gray-100"> {/* Updated background color */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        {!isLoggedIn ? (
          // Login Form
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
          
          // Admin Panel Content
          <div>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Admin Panel</h1>
            {message.text && (
              <div className={`text-center p-3 mb-6 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {message.text}
              </div>
            )}

            {/* Form for managing groups */}
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              {/* Group Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group description"
                />
              </div>

              {/* Group Link */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Group Link</label>
                <input
                  type="url"
                  value={groupData.link}
                  onChange={(e) => setGroupData({ ...groupData, link: e.target.value })}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group link"
                />
              </div>

              {/* Category Select */}
              <div className="mb-4">
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedGroup ? "Update Group" : "Add Group"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Manage Groups */}
      {isLoggedIn && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mt-8 text-center text-gray-800">Manage Groups</h2>
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-md border border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                    <p className="text-gray-600">{group.description}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(group)}
                      className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmation(group)}
                      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Are you sure you want to delete this group?</h3>
            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
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

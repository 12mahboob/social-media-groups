import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import Navbar from "../Components/Navbar";

const NewGroup = () => {
  const [categories, setCategories] = useState([]);
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    link: "",
    category_id: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("id, name");
      if (error) {
        console.error("Error fetching categories:", error.message);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupData.category_id) {
      setMessage("Please select a category!");
      return;
    }

    const { error } = await supabase.from("groups").insert([
      {
        name: groupData.name,
        description: groupData.description,
        link: groupData.link,
        category_id: parseInt(groupData.category_id),
      },
    ]);

    if (error) {
      setMessage("Error adding group: " + error.message);
    } else {
      setMessage("Group added successfully!");
      setGroupData({ name: "", description: "", link: "", category_id: "" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <div className="max-w-lg w-full p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Share a New Group</h1>

          {message && (
            <div
              className={`mb-4 p-4 rounded-md text-center text-white ${
                message.includes("Error") ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                value={groupData.name}
                onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter group name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={groupData.description}
                onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Describe your group"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Group Link</label>
              <input
                type="url"
                value={groupData.link}
                onChange={(e) => setGroupData({ ...groupData, link: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter group link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={groupData.category_id}
                onChange={(e) => setGroupData({ ...groupData, category_id: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewGroup;


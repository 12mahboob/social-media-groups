import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Import the Supabase client
import Navbar from "../Components/Navbar";

const NewGroup = () => {
  const [categories, setCategories] = useState([]); // To store categories
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    link: "",
    category_id: "",
  });
  const [message, setMessage] = useState(""); // For success/error message

  useEffect(() => {
    // Fetch categories from Supabase
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error.message);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Hide the message after 5 seconds
    if (message) {
      const timer = setTimeout(() => {
        setMessage(""); // Clear the message after 5 seconds
      }, 5000);

      // Clear timeout if component unmounts or message changes before timeout
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupData.category_id) {
      setMessage("Please select a category!"); // Set error message
      return;
    }

    const { error } = await supabase.from("groups").insert([groupData]);

    if (error) {
      setMessage("Error adding group: " + error.message); // Set error message
    } else {
      setMessage("Group added successfully!"); // Set success message
      setGroupData({ name: "", description: "", link: "", category_id: "" });
    }
  };

  return (
    <>
      <Navbar />
      <div className=" p-8 min-h-screen">
        <div className="flex justify-center items-center h-full">
          <div className="max-w-lg w-full p-8  rounded-lg shadow-2xl">
            <h1 className="text-3xl font-semibold text-center text-white mb-6">
              Share a New Group
            </h1>

            {/* Display the message here */}
            {message && (
              <div
                className={`mb-4 p-4 rounded-md text-center ${
                  message.includes("Error") ? "bg-red-500" : "bg-green-500"
                } text-white`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) =>
                    setGroupData({ ...groupData, name: e.target.value })
                  }
                  className="w-full p-3 border border-pink-500 rounded-md text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                  placeholder="Enter group name"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={groupData.description}
                  onChange={(e) =>
                    setGroupData({ ...groupData, description: e.target.value })
                  }
                  className="w-full p-3 border border-pink-500 rounded-md text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                  placeholder="Describe your group"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Link
                </label>
                <input
                  type="url"
                  value={groupData.link}
                  onChange={(e) =>
                    setGroupData({ ...groupData, link: e.target.value })
                  }
                  className="w-full p-3 border border-pink-500 rounded-md text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                  placeholder="Enter group link"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={groupData.category_id}
                    onChange={(e) =>
                      setGroupData({ ...groupData, category_id: e.target.value })
                    }
                    className="w-full p-3 border border-pink-500 rounded-md text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none pr-10"
                    required
                  >
                    <option value="" disabled className="text-gray-400 bg-gray-800">
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="text-white bg-gray-800 hover:bg-pink-600 hover:text-white transition-colors"
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
                    ▼
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold rounded-md hover:from-pink-400 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewGroup;

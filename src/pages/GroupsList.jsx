import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: groups } = await supabase
        .from("groups")
        .select("*, categories(name)");
      setGroups(groups);
    } catch (error) {
      console.error("Error fetching groups:", error.message);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data: categories } = await supabase.from("categories").select("name");
      setCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchCategories();
  }, []);

  const handleJoin = (link) => {
    window.open(link, "_blank");
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || group.categories?.name === category)
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Community Groups</h1>
        <button 
          onClick={() => navigate("/bad/new")}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200"
        >
          Add New Group
        </button>
      </nav>

      <div className="p-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Find Your Group</h2>

        {/* Search & Filter */}
        <div className="mb-6 flex gap-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search groups..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-4 text-gray-400" />
          </div>
          <select
            className="p-3 border border-gray-300 rounded-lg shadow-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                  <p className="text-sm text-gray-500 mb-4">Category: {group.categories?.name}</p>
                  <button
                    onClick={() => handleJoin(group.link)}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Join
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center p-4 mt-10">
        <p>&copy; 2025 Community Groups. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default GroupsList;

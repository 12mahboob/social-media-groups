import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch groups and categories from the database
  const fetchGroupsAndCategories = async () => {
    setLoading(true);
    try {
      // Fetch groups with their category information
      const { data: groups } = await supabase
        .from("groups")
        .select("*, categories(name)");

      // Fetch all categories
      const { data: categories } = await supabase.from("categories").select("*");

      setGroups(groups);
      setCategories(categories);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroupsAndCategories();
  }, []);

  // Handle join button click
  const handleJoin = (link) => {
    window.open(link, "_blank");
  };

  // Group groups by category
  const groupGroupsByCategory = () => {
    const grouped = {};
    categories.forEach((category) => {
      grouped[category.id] = {
        name: category.name,
        groups: groups.filter((group) => group.category_id === category.id),
      };
    });
    return grouped;
  };

  const groupedGroups = groupGroupsByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Groups</h2>

      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="text-xl font-semibold text-white mb-4">
                {category.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {groupedGroups[category.id]?.groups.map((group) => (
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
                        Category: {group.categories?.name}
                      </p>
                      <button
                        onClick={() => handleJoin(group.link)}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                      >
                        Join
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsList;

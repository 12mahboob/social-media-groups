import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch groups with their category names from the database
  const fetchGroups = async () => {
    setLoading(true);
    try {
      // Fetch groups with their category names using a join
      const { data: groups, error } = await supabase
        .from("groups")
        .select("*, categories(name)") // Join with categories table
        .order("category_id", { ascending: true }); // Optional: Sort by category_id

      if (error) throw error;

      setGroups(groups);
    } catch (error) {
      console.error("Error fetching groups:", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Handle join button click
  const handleJoin = (link) => {
    window.open(link, "_blank");
  };

  // Group groups by category
  const groupGroupsByCategory = () => {
    const grouped = {};
    groups.forEach((group) => {
      const categoryId = group.category_id;
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          name: group.categories?.name || "Uncategorized",
          groups: [],
        };
      }
      grouped[categoryId].groups.push(group);
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
          {Object.keys(groupedGroups).map((categoryId) => (
            <div key={categoryId}>
              <h3 className="text-xl font-semibold text-white mb-4">
                {groupedGroups[categoryId].name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {groupedGroups[categoryId].groups.map((group) => (
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

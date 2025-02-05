import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Import the Supabase client
import Navbar from "../Components/NavBar";
import { Link } from 'react-router-dom';

const JoinGroups = () => {
  const [categories, setCategories] = useState([]);  // To store categories
  const [groups, setGroups] = useState([]);  // To store groups
  const [loading, setLoading] = useState(false);  // To handle loading state
  const [message, setMessage] = useState("");  // To handle success/error messages

  useEffect(() => {
    const fetchCategoriesAndGroups = async () => {
      setLoading(true);

      // Fetch categories
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*");

      // Fetch groups
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*");

      if (categoryError || groupError) {
        console.error("Error fetching data:", categoryError?.message || groupError?.message);
        setMessage("Failed to load categories and groups. Please try again.");
      } else {
        setCategories(categoryData);
        setGroups(groupData);
      }

      setLoading(false);
    };

    fetchCategoriesAndGroups();
  }, []);

  const handleJoin = (groupLink) => {
    // Open the WhatsApp group link in a new tab
    window.open(groupLink, "_blank");
    setMessage("Successfully joined the group!");
  };

  const groupedByCategory = categories.map((category) => {
    // Filter groups by category_id
    const filteredGroups = groups.filter((group) => group.category_id === category.id);
    return {
      category,
      groups: filteredGroups,
    };
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8">
      <Link
                to="/groups/new"
                className="text-white text-lg hover:text-gray-200 transition duration-300 bg-blue-600 py-2 px-4 rounded-lg"
              >
                Add Your Own  Group Link
              </Link>
        <h1 className="text-5xl text-white font-extrabold text-center text-black mb-12 tracking-tight">
          Join Groups and Connect
        </h1>
          
        {message && <div className="mb-6 text-xl text-center text-white font-medium">{message}</div>}

        {loading ? (
          <div className="text-center text-xl text-white">Loading categories and groups...</div>
        ) : (
          <div>
            {groupedByCategory.map((categoryGroup) => (
              <div key={categoryGroup.category.id} className="mb-12">
                <div className="text-4xl font-semibold text-center text-green-700 mb-8">
                  {categoryGroup.category.name}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryGroup.groups.length === 0 ? (
                    <div className="text-xl text-white text-center">
                      No groups available in this category.
                    </div>
                  ) : (
                    categoryGroup.groups.map((group) => (
                      <div
                        key={group.id}
                        className="p-6 rounded-xl shadow-2xl bg-black transform hover:scale-105 transition-all duration-500 ease-in-out w-[auto] max-w-sm mx-auto"
                      >
                        <div className="text-center">
                          <h3 className="text-2xl font-semibold text-white mb-4">{group.name}</h3>
                          <p className="text-lg text-white mb-6">{group.description}</p>
                          <button
                            onClick={() => handleJoin(group.link)} // Open WhatsApp link
                            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-500 transition duration-300 w-full text-lg font-medium"
                          >
                            Join Group
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default JoinGroups;

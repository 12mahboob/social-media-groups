import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("category_id", categoryId);

      if (groupError) {
        setMessage("Failed to load groups for this category.");
      } else {
        setGroups(groupData);
      }

      setLoading(false);
    };

    fetchGroups();
  }, [categoryId]);

  const handleJoin = (groupLink) => {
    window.open(groupLink, "_blank");
    setMessage("Successfully joined the group!");
  };

  return (
    <div className="min-h-screen p-6">
      <navbar />

      <h1 className="text-4xl font-bold text-center text-black mb-8">Groups in Category</h1>

      {message && <div className="mb-4 text-green-600 text-center text-lg font-medium">{message}</div>}

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading groups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.length === 0 ? (
            <div className="text-lg text-gray-600 text-center">No groups available in this category.</div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img src={group.image_url || "default-image.jpg"} alt={group.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{group.name}</h3>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <button
                  onClick={() => handleJoin(group.link)}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 w-full"
                >
                  Join
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;

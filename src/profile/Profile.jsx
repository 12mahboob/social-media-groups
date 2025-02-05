import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { useAuthentication } from "../hooks/useAuthentication";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/NavBar";

// Sub-components
const ProfileView = ({ profile, onEdit }) => (
  <div className="space-y-6 text-white">
    <div className="flex justify-center">
      <img
        src={profile.avatar_url || "https://via.placeholder.com/150"}
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="text-center space-y-2">
      <p className="text-xl font-semibold">
        Username: <span className="text-yellow-500">{profile.username}</span>
      </p>
      <p className="text-xl font-semibold">
        Full Name: <span className="text-yellow-500">{profile.full_name}</span>
      </p>
      <p className="text-lg font-medium">
        Bio: <span className="text-yellow-500">{profile.bio || "No bio available."}</span>
      </p>
    </div>
    <button
      onClick={onEdit}
      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
    >
      Edit Profile
    </button>
  </div>
);

const ProfileEdit = ({ profile, loading, onSave, onCancel }) => {
  const [formData, setFormData] = useState(profile);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-6 text-white"
    >
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        className="w-full p-3 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
      <input
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
        placeholder="Full Name"
        className="w-full p-3 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
      <input
        name="avatar_url"
        value={formData.avatar_url}
        onChange={handleChange}
        placeholder="Avatar URL"
        className="w-full p-3 border text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        placeholder="Bio"
        className="w-full p-3 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 text-white rounded-lg transition-shadow shadow-sm ${
            loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-shadow shadow-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const ProfileActions = ({ onGroupsClick, onLogoutClick }) => (
  <div className="mt-8 space-y-4 text-white">
    <button
      onClick={onGroupsClick}
      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
    >
      Join Groups
    </button>
    <button
      onClick={onLogoutClick}
      className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
    >
      Logout
    </button>
  </div>
);

export default function Profile() {
  useAuthentication();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    avatar_url: "",
    bio: "",
    private: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile) => {
    try {
      setLoading(true);
      if (updatedProfile.avatar_url && !isValidUrl(updatedProfile.avatar_url)) {
        throw new Error("Please enter a valid image URL");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const updates = {
        id: user.id,
        ...updatedProfile,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;
      setProfile(updatedProfile);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-8 flex items-center justify-center  min-h-screen">
        <div className="max-w-4xl w-full  bg-black text-white rounded-xl shadow-xl p-10 space-y-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Profile Settings
          </h1>

          {!isEditing ? (
            <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
          ) : (
            <ProfileEdit
              profile={profile}
              loading={loading}
              onSave={updateProfile}
              onCancel={() => setIsEditing(false)}
            />
          )}

          <ProfileActions
            onGroupsClick={() => navigate("/groups")}
            onLogoutClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../config/supabaseClient";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import GroupsManagement from "./components/GroupsManagement";
import Settings from "./components/Settings";
import Bulkupload from "./components/Bulkupload";

const AdminPanel = () => {
  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [groups, setGroups] = useState([]);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const { data: groups } = await supabase.from("groups").select("*");
      setGroups(groups);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchGroups();
  }, [isLoggedIn, fetchGroups]);

  // Auto-clear messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await supabase
        .from("admin")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();
      if (!data) throw new Error("Invalid email or password");
      setIsLoggedIn(true);
      setMessage({ type: "success", text: "Logged in successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">
      {/* Navigation Bar */}
      <Navigation 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
      />

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setShowSettingsForm={setShowSettingsForm} />

      {/* Main Content */}
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"} min-h-screen p-8`}>
        {!isLoggedIn ? (
          <Login email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleLogin={handleLogin} message={message} />
        ) : (
          <>
           <GroupsManagement 
  groups={groups} 
  showAddForm={showAddForm} 
  setShowAddForm={setShowAddForm} 
  isBulkUpload={isBulkUpload}  // 🔴 یہاں درست کیا
  setIsBulkUpload={setIsBulkUpload}  
/>

            {/* Settings Modal */}
            <AnimatePresence>
              {showSettingsForm && (
                <motion.div
                  className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Settings setShowSettingsForm={setShowSettingsForm} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

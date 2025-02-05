import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './Index/Home';  // Adjust paths as needed
import Login from "./pages/Login";
import Profile from "./profile/Profile";
import CategoryPage from "./pages/CategoryPage";
import Groups from "./pages/JoinGroups";
import NewGroup from "./pages/NewGroup";
import Admin from "./Admin/AdminPanel";
import Background from "./background/Background";  // Ensure correct import path

export default function App() {
  return (
    <Background> {/* Ensure Background component is correct */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/new" element={<NewGroup />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Background>
  );
}

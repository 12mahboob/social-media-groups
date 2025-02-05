import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Login = ({ email, setEmail, password, setPassword, handleLogin, message }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-800">Admin Login</h1>
        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`p-4 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
            className="w-full p-4 rounded-lg border border-gray-300" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
            className="w-full p-4 rounded-lg border border-gray-300" required />
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

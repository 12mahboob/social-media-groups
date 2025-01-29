import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl text-white font-bold">MUH-LiNks</h1>
        <div className="space-x-6">
          <Link
            to="/groups"
            className="text-white text-lg hover:text-gray-200 transition duration-300"
          >
            Home
          </Link>
          <Link
            to="/profile"
            className="text-white text-lg hover:text-gray-200 transition duration-300"
          >
            Profile
          </Link>
          <Link
            to="/groups/new"
            className="text-white text-lg hover:text-gray-200 transition duration-300"
          >
            Add Group
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

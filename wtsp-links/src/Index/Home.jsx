import React from 'react';
import { Link } from 'react-router-dom'; // Import the Link component for navigation

function Home() {
  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-indigo-600 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-semibold">
            <Link to="/">Home</Link>
          </div>
          <div className="space-x-6">
            <Link 
              to="/login" 
              className="text-white hover:bg-indigo-700 px-4 py-2 rounded-lg"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="text-white hover:bg-indigo-700 px-4 py-2 rounded-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Banner Section */}
      <section className="relative h-80 md:h-96 lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
        <img 
          src="https://i.postimg.cc/NGJBb7XL/9b3a24a8-409e-4365-898c-dcc154347e36.webp" 
          alt="WhatsApp Group Banner" 
          className="w-full h-full object-cover rounded-lg" 
        />
      </section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 space-y-12 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-8 ">
          <div className="space-y-6">
            <p className="text-xl text-white leading-relaxed">
              Welcome to our Web Application! This platform is designed to bring together a community of individuals with shared interests. Whether you are looking to connect, collaborate, or simply explore, we have the tools and resources you need.
            </p>
            <p className="text-lg text-white leading-relaxed">
              Our web app allows users to easily interact with each other, access valuable content, and take part in discussions. It's a user-friendly platform that is designed with simplicity and functionality in mind.
            </p>
            <p className="text-lg text-white leading-relaxed">
              Key Features:
            </p>
            <ul className="list-disc text-left pl-6 text-white">
              <li>Connect with like-minded individuals and build your network.</li>
              <li>Access various resources and materials to enhance your knowledge.</li>
              <li>Join discussions and forums to exchange ideas and share experiences.</li>
              <li>User-friendly interface with a clean and intuitive design.</li>
              <li>Personalized notifications to keep you updated on important events and news.</li>
            </ul>
            <p className="text-lg text-white leading-relaxed">
              Whether you're a new visitor or a returning member, our platform offers a great space to grow, collaborate, and share.
            </p>
          </div>

          <div className="flex justify-center space-x-6 mt-6">
            <Link 
              to="/login" 
              className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl"
            >
              Login
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-3 text-lg font-semibold text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition duration-300 shadow-lg hover:shadow-xl border-2 border-indigo-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto flex justify-between items-start space-x-12">
          {/* About Us Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">About Us</h3>
            <p>Our platform connects individuals, fosters collaboration, and promotes a community-driven approach. We are here to support your growth and help you connect with like-minded people.</p>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/login" className="hover:underline">Login</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:underline">Sign Up</Link>
              </li>
              <li>
                <Link to="/about" className="hover:underline">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Contact</h3>
            <p>Email: <a href="mailto:contact@example.com" className="hover:underline">contact@example.com</a></p>
            <p>Phone: <a href="tel:+1234567890" className="hover:underline">+1 234 567 890</a></p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm">&copy; 2025 Your Company. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;

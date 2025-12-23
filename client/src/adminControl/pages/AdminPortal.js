import React from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backgroundImage from '../../assets/moviehero.jpg';

const AdminPortal = () => {
  return (
    <>
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <div className="max-w-2xl w-full space-y-8 bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-lg shadow-xl relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Admin Portal
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Access the admin dashboard to manage content and email fanbase
          </p>
        </div>

        <div className="flex justify-center">
          {/* Login Card */}
          <div className="bg-gradient-to-br from-[#61dafb] to-[#4fa8c5] p-6 rounded-lg shadow-lg text-white max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Sign In</h2>
            <p className="mb-6 text-white text-opacity-90">
              Sign in to access the admin dashboard.
            </p>
            <Link
              to="/admin-portal/login"
              className="inline-block w-full text-center bg-white text-[#61dafb] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-[#61dafb] transition-colors duration-300"
          >
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
    <ToastContainer />
    </>
  );
};

export default AdminPortal;


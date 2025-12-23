import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import HeaderPoster from './visitor/components/HeaderPoster';
import NavComp from './visitor/components/NavComp';
import Footer from './visitor/components/Footer';
import EmailCapture from './visitor/components/EmailCapture';
import EmailCaptureBanner from './visitor/components/EmailCaptureBanner';
import Home from './visitor/pages/Home';
import About from './visitor/pages/About';
import Services from './visitor/pages/Services';
import Latest from './visitor/pages/Latest';
import Contact from './visitor/pages/Contact';
import Login from './adminControl/comp/Login';
import AdminDashboard from './adminControl/pages/AdminDashboard';
import AdminPortal from './adminControl/pages/AdminPortal';
import movieheroImage from './assets/moviehero.jpg';
import movieaboutImage from './assets/movieabout.jpg';
import moviebackImage from './assets/movieback.jpg';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin-portal/login" />;
};

// Layout component for pages with HeaderPoster and Nav
const Layout = ({ children, showHeaderPoster = true, backgroundImage }) => {
  return (
    <div className="w-full min-h-screen relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Email Capture Banner */}
      <EmailCaptureBanner />

      {/* Container with flex order - Nav on top for mobile, HeaderPoster on top for desktop */}
      <div className="flex flex-col">
        {/* Nav - appears first on mobile, second on desktop, sticky when scrolling */}
        <div className="order-1 md:order-2">
          <NavComp />
        </div>

        {/* HeaderPoster - appears second on mobile, first on desktop */}
        {showHeaderPoster && (
          <div className="order-2 md:order-1 m-2 mb-4 md:m-0 md:pt-4 md:px-2 md:pb-4 md:px-1 relative z-10">
            <div className="rounded-lg shadow-2xl overflow-hidden border-2 border-amber-400">
              <HeaderPoster />
            </div>
          </div>
        )}
      </div>
      {/* Content starts below HeaderPoster and Nav */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Footer */}
      <Footer />

      {/* Email Capture Modal */}
      <EmailCapture />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with layout */}
          <Route
            path="/"
            element={
              <Layout backgroundImage={movieheroImage}>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout showHeaderPoster={false} backgroundImage={movieaboutImage}>
                <About />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout showHeaderPoster={false} backgroundImage={movieheroImage}>
                <Services />
              </Layout>
            }
          />
          <Route
            path="/latest"
            element={
              <Layout showHeaderPoster={false} backgroundImage={movieheroImage}>
                <Latest />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout showHeaderPoster={false} backgroundImage={moviebackImage}>
                <Contact />
              </Layout>
            }
          />
          {/* Admin Portal Routes - Not linked publicly */}
          <Route
            path="/admin-portal"
            element={<AdminPortal />}
          />
          <Route
            path="/admin-portal/login"
            element={<Login />}
          />

          {/* Protected admin route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { getImageUrl } from '../../utils/imageUrl';
import mahletImage from '../../assets/mahlet solom.jpg';
import trailerVideo from '../../assets/videos/trailer.mp4';

const Home = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Hero carousel state
  const [heroImages, setHeroImages] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Fetch hero images
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await api.get('/api/home-hero/images');
        if (response.data && response.data.length > 0) {
          const imageUrls = response.data
            .filter(img => img.isActive !== false)
            .map(img => getImageUrl(img.imageUrl));
          setHeroImages(imageUrls);
        } else {
          // Fallback to default image if no images from API
          setHeroImages([mahletImage]);
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
        // Fallback to default image on error
        setHeroImages([mahletImage]);
      }
    };

    fetchHeroImages();
  }, []);

  // Auto-rotate hero images every 3 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/api/subscribers/subscribe', {
        email,
        name: name || undefined,
        // Always treat homepage subscriptions as fans / mailing list
        source: 'fan',
      });

      setMessage(response.data.message);
      setEmail('');
      setName('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">



      {/* Hero Section - Auto-rotating Image Carousel */}
      <section id="home" className="relative w-full h-[600px] md:h-[700px] mb-6 overflow-hidden">
        {heroImages.length > 0 ? (
          <>
            {/* Image carousel */}
            <div className="relative w-full h-full">
              {heroImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                  <img
                    src={imageUrl}
                    alt={`Hero ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </div>
              ))}
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-4 drop-shadow-2xl">
                Mahlet Solomon
              </h1>
              <p className="text-lg md:text-xl text-amber-400/90 mb-8 max-w-3xl drop-shadow-lg">
                Theatre and Film Director | Scriptwriter | Actress | Producer
              </p>
            </div>

            {/* Call-to-action button at bottom */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <button
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-4 bg-[#61dafb] text-white font-semibold text-lg rounded-lg shadow-xl hover:bg-[#4fa8c5] transition-all duration-300 transform hover:scale-105"
              >
                Join My Mailing
              </button>
            </div>

            {/* Image indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentHeroIndex
                      ? 'bg-white w-8'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Loading or fallback */
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center">
            <div className="text-amber-400 text-xl">Loading...</div>
          </div>
        )}
      </section>

      {/* Welcome Video Section */}
      <section id="welcome-video" className="w-full mb-6">
        <div className="relative w-full overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={trailerVideo}
            autoPlay
            loop
            muted
            playsInline
            controls
          />
        </div>
      </section>


      {/* Subscribe Section */}
      <section id="contact" className="py-16 px-5 bg-transparent backdrop-blur-sm rounded-lg mx-4 mb-0">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-amber-400 mb-6 text-center">Join the Family</h2>
          <p className="text-center text-amber-400/90 mb-8">
            Subscribe to receive updates, news, and exclusive content from Mahlet&apos;s world.
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubscribe} className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-md space-y-4 border border-white/20">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-amber-400 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-amber-400 placeholder-amber-400/70 focus:outline-none focus:ring-2 focus:ring-[#61dafb] focus:border-[#61dafb]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-400 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-white/30 rounded-md bg-white/10 text-amber-400 placeholder-amber-400/70 focus:outline-none focus:ring-2 focus:ring-[#61dafb] focus:border-[#61dafb]"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#61dafb] text-white py-3 px-4 rounded-md hover:bg-[#4fa8c5] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? 'Subscribing...' : 'Join the Family'}
            </button>

            <p className="text-xs text-amber-400/70 text-center">
              By subscribing, you agree to receive updates. You can unsubscribe at any time.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

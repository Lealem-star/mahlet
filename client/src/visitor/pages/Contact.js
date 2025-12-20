import React, { useState } from 'react';
import api from '../../config/api';
import portraitPrimary from '../../assets/mahlet solom.jpg';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const combinedNotes = formData.phone
                ? `Phone: ${formData.phone}\n\n${formData.message || ''}`
                : formData.message;

            await api.post('/api/subscribers/subscribe', {
                name: formData.name,
                email: formData.email,
                source: 'partner',
                notes: combinedNotes,
            });
            setSuccess('Thanks for reaching out. I will be in touch soon.');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-transparent">
            <section className="relative py-10 px-5 mx-auto max-w-6xl mb-4">
                <div className="grid md:grid-cols-2 gap-12 items-center text-amber-400 p-4 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm">
                    {/* Left: Image */}
                    <div className="flex justify-center md:justify-start">
                        <div className="w-96 md:w-[500px] lg:w-[600px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                            <img
                                src={portraitPrimary}
                                alt="Mahlet Solomon"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>

                    {/* Right: Content & Form */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {/* <p className="text-4xl md:text-5xl font-extrabold leading-tight text-black">Partnership Call</p> */}
                            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-[0.35em] text-black">
                                Let's talk about<br />your project
                            </h1>
                            <p className="text-lg font-bold text-black leading-relaxed mt-4">
                                I'm excited to hear about your creative vision. Whether you're looking for collaboration,
                                partnership opportunities, or have a project in mind, let's start a conversation.
                            </p>
                        </div>

                        {success && (
                            <div className="bg-green-50/90 border border-green-200 text-green-800 px-4 py-3 rounded">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50/90 border border-red-200 text-red-800 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-white/25 rounded-xl bg-transparent text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-white/25 rounded-xl bg-transparent text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                                    placeholder="Email Address"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/25 rounded-xl bg-transparent text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-white/25 rounded-xl bg-transparent text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                                    placeholder="Comment or Message"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-300 disabled:opacity-60"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Social Media Section */}
            <section className="py-12 px-5 mx-4 mb-6">
                <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-amber-400">
                    <h3 className="text-2xl font-semibold mb-3 text-center">Follow My Work Updates</h3>
                    <p className="text-sm text-amber-400/80 mb-6 text-center">
                        Stay connected and get the latest updates on my projects, performances, and creative work.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {/* Instagram */}
                        <a
                            href="https://instagram.com/mahletsolomon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            <span className="font-medium">Instagram</span>
                        </a>

                        {/* Twitter */}
                        <a
                            href="https://twitter.com/mahletsolomon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                            <span className="font-medium">Twitter</span>
                        </a>

                        {/* LinkedIn */}
                        <a
                            href="https://linkedin.com/in/mahletsolomon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            <span className="font-medium">LinkedIn</span>
                        </a>

                        {/* Facebook */}
                        <a
                            href="https://facebook.com/mahletsolomon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="font-medium">Facebook</span>
                        </a>

                        {/* YouTube */}
                        <a
                            href="https://youtube.com/@mahletsolomon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white rounded-lg hover:bg-[#cc0000] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            <span className="font-medium">YouTube</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 px-5 mx-4 mb-12">
                <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 text-amber-400">
                    {/* Physical Address */}
                    <div className="bg-[#111111] rounded-2xl px-8 py-10 shadow-2xl border border-white/5 flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-xl">
                            <span>📍</span>
                        </div>
                        <h3 className="text-lg font-semibold">Physical Address</h3>
                        <div className="text-sm text-amber-400/80 space-y-1">
                            <p>Addis Ababa, Ethiopia</p>
                            <p>Bole Brass Behind Yougo</p>
                            <p>City Church</p>
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="bg-[#111111] rounded-2xl px-8 py-10 shadow-2xl border border-white/10 flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-xl">
                            <span>✉️</span>
                        </div>
                        <h3 className="text-lg font-semibold">Email Address</h3>
                        <div className="text-sm text-white/80 space-y-1 break-all">
                            <p>contact@mahletsolomon.com</p>
                        </div>
                    </div>

                    {/* Phone Numbers */}
                    <div className="bg-[#111111] rounded-2xl px-8 py-10 shadow-2xl border border-white/5 flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-xl">
                            <span>📞</span>
                        </div>
                        <h3 className="text-lg font-semibold">Phone Numbers</h3>
                        <div className="text-sm text-amber-400/80 space-y-1">
                            <p>+251 911 000 000</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;


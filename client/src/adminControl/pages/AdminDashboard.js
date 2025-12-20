import React, { useState, useContext, useEffect } from 'react';
import ImageManager from '../comp/ImageManager';
import HeroImageManager from '../comp/HeroImageManager';
import VideoManager from '../comp/VideoManager';
import SubscriberManager from '../comp/SubscriberManager';
import LatestPostManager from '../comp/LatestPostManager';
import ContactMessagesManager from '../comp/ContactMessagesManager';
import AdminManager from '../comp/AdminManager';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/moviehero.jpg';

const navItems = [
  {
    id: 'headerpost',
    label: 'HeaderPost',
    description: 'Upload header poster images and videos.',
    subTabs: [
      { id: 'images', label: 'Images' },
      { id: 'videos', label: 'Videos' },
    ],
  },
  {
    id: 'homehero',
    label: 'Home Hero',
    description: 'Upload images for the home page hero section.',
  },
  {
    id: 'latest',
    label: 'Latest',
    description: 'Upload and manage latest posts.',
  },
  {
    id: 'myfan',
    label: 'MyFan',
    description: 'Manage user messages and mailing list.',
    subTabs: [
      { id: 'subscribers', label: 'Mailing List' },
      { id: 'messages', label: 'Contact Messages' },
    ],
  },
  {
    id: 'admins',
    label: 'Admins',
    description: 'Create and manage admin accounts.',
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('headerpost');
  const [activeSubTab, setActiveSubTab] = useState('images');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const avatarUrl = user?.avatar;
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let timerId = null;

    async function fetchUnread() {
      try {
        const endpoints = [
          '/api/contact-messages/unread-count',
          '/api/contact-messages/unread',
          '/api/contact-messages?unread=true',
          '/api/contact-messages/count?unread=true',
          '/api/messages/unread-count',
          '/api/messages/unread',
        ];

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep);
            if (!res.ok) continue;
            const data = await res.json();
            let count = 0;

            if (typeof data === 'number') {
              count = data;
            } else if (Array.isArray(data)) {
              // If items have a `read` flag, count unread
              if (data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], 'read')) {
                count = data.filter((m) => !m.read).length;
              } else {
                count = data.length;
              }
            } else if (data && typeof data === 'object') {
              count = data.unread || data.unreadCount || data.unread_count || data.count || data.total || 0;
            }

            if (mounted) setMessageCount(Number(count) || 0);
            break;
          } catch (err) {
            continue;
          }
        }
      } catch (err) {
        // ignore
      }
    }

    // initial fetch
    fetchUnread();
    // poll every 5s for near real-time updates
    timerId = setInterval(fetchUnread, 5000);

    return () => {
      mounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen p-5 relative">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Mobile Top Bar - Menu Button and Welcome Section (Mobile Only) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[1000] bg-white bg-opacity-95 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between p-4 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg focus:outline-none flex-shrink-0"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-[#61dafb] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#61dafb] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#61dafb] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Welcome Section - Mobile Only */}
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">Welcome back</p>
              <h1 className="text-lg font-semibold text-gray-900 truncate">Hi {user?.name || 'Admin'}, let's build.</h1>
            </div>
            <button
              aria-label="View messages"
              className="ml-3 relative w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white"
              onClick={() => {
                setActiveTab('myfan');
                setActiveSubTab('messages');
                closeMobileMenu();
                setMessageCount(0);
              }}
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {messageCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">{messageCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-[#071022] to-[#071427] text-white backdrop-blur-sm shadow-2xl z-[999] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderRight: '4px solid rgba(97,218,251,0.18)' }}
      >
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-300">Mahlet Studio</p>
                <h2 className="text-2xl font-semibold text-white mt-2">Admin Hub</h2>
                <p className="text-sm text-gray-300 mt-1">Curate every experience.</p>
              </div>
              <button
                onClick={closeMobileMenu}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <nav className="space-y-3">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (item.subTabs && item.subTabs.length > 0) {
                          setActiveSubTab(item.subTabs[0].id);
                        }
                        closeMobileMenu();
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 ${isActive
                        ? 'bg-[#61dafb] border-[#61dafb] text-[#06283D] shadow-lg shadow-[#61dafb]/30'
                        : 'border-transparent text-gray-300 hover:border-[#61dafb]/30 hover:bg-white/10'
                        }`}
                    >
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs mt-1 opacity-80 text-gray-300">{item.description}</p>
                    </button>
                    {isActive && item.subTabs && item.subTabs.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2">
                        {item.subTabs.map((subTab) => (
                          <button
                            key={subTab.id}
                            onClick={() => {
                              setActiveSubTab(subTab.id);
                              closeMobileMenu();
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${activeSubTab === subTab.id
                                ? 'bg-[#61dafb]/20 text-[#61dafb] font-medium border border-[#61dafb]/30'
                                : 'text-gray-300 hover:bg-white/10'
                              }`}
                          >
                            {subTab.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-white/10 bg-transparent">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-3 w-full text-left"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#61dafb] to-[#4fa8c5] text-white flex items-center justify-center text-lg font-semibold border-2 border-white shadow">
                    {(user?.name || 'Admin').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-300">Signed in</p>
                  <p className="text-base font-semibold text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-300 mt-0.5">System Admin</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setNameInput(user?.name || '');
                      setAvatarFile(null);
                      setAvatarPreview(avatarUrl || '');
                      setProfileError('');
                      setShowEditModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 bg-gradient-to-b from-[#071022] to-[#071427] text-white rounded-2xl shadow-2xl flex-col justify-between" style={{ border: '3px solid rgba(97,218,251,0.12)' }}>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-300">Mahlet Studio</p>
              <h2 className="text-2xl font-semibold text-white mt-2">Admin Hub</h2>
              <p className="text-sm text-gray-300 mt-1">Curate every experience.</p>
            </div>
            <nav className="space-y-3">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (item.subTabs && item.subTabs.length > 0) {
                          setActiveSubTab(item.subTabs[0].id);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 ${isActive
                        ? 'bg-[#61dafb] border-[#61dafb] text-[#06283D] shadow-lg shadow-[#61dafb]/30'
                        : 'border-transparent text-gray-300 hover:border-[#61dafb]/30 hover:bg-white/10'
                        }`}
                    >
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs mt-1 opacity-80 text-gray-300">{item.description}</p>
                    </button>
                    {isActive && item.subTabs && item.subTabs.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2">
                        {item.subTabs.map((subTab) => (
                          <button
                            key={subTab.id}
                            onClick={() => setActiveSubTab(subTab.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${activeSubTab === subTab.id
                                ? 'bg-[#61dafb]/20 text-[#61dafb] font-medium border border-[#61dafb]/30'
                                : 'text-gray-300 hover:bg-white/10'
                              }`}
                          >
                            {subTab.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          <div className="p-6 border-t border-white/10 bg-transparent rounded-b-2xl">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-3 w-full text-left"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#61dafb] to-[#4fa8c5] text-white flex items-center justify-center text-lg font-semibold border-2 border-white shadow">
                    {(user?.name || 'Admin').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-300">Signed in</p>
                  <p className="text-base font-semibold text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-300 mt-0.5">System Admin</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setNameInput(user?.name || '');
                      setAvatarFile(null);
                      setAvatarPreview(avatarUrl || '');
                      setProfileError('');
                      setShowEditModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6 lg:ml-0 mt-20 lg:mt-0">
          {/* Desktop Header - Hidden on Mobile */}
          <header className="hidden lg:flex bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Welcome back</p>
              <h1 className="text-3xl font-semibold text-gray-900">Hi {user?.name || 'Admin'}, let's build.</h1>
              <p className="text-base text-gray-600 mt-1">Select a panel to start managing content.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.subTabs && item.subTabs.length > 0) {
                      setActiveSubTab(item.subTabs[0].id);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === item.id
                    ? 'bg-[#61dafb] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {item.label}
                </button>
              ))}
              </div>
              <button
                aria-label="View messages"
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white"
                onClick={() => {
                  setActiveTab('myfan');
                  setActiveSubTab('messages');
                  setMessageCount(0);
                }}
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {messageCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">{messageCount}</span>
                )}
              </button>
            </div>
          </header>

          <section className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-6">
            {activeTab === 'headerpost' && (
              <>
                {activeSubTab === 'images' && <ImageManager />}
                {activeSubTab === 'videos' && <VideoManager />}
              </>
            )}
            {activeTab === 'homehero' && <HeroImageManager />}
            {activeTab === 'latest' && <LatestPostManager />}
            {activeTab === 'myfan' && (
              <>
                {activeSubTab === 'subscribers' && <SubscriberManager />}
                {activeSubTab === 'messages' && <ContactMessagesManager />}
              </>
            )}
            {activeTab === 'admins' && <AdminManager />}
          </section>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">Edit Profile</h3>
            <p className="text-sm text-gray-600 mb-4">Update your display name and profile image.</p>

            {profileError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {profileError}
              </div>
            )}

            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-semibold">
                    {(nameInput || user?.name || 'A').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Profile image</p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setAvatarFile(file || null);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setAvatarPreview(reader.result);
                      reader.readAsDataURL(file);
                    } else {
                      setAvatarPreview(avatarUrl || '');
                    }
                  }}
                  className="block w-full text-sm text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#61dafb] focus:border-[#61dafb]"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setProfileError('');
                  setSavingProfile(true);
                  try {
                    const formData = new FormData();
                    if (nameInput) formData.append('name', nameInput);
                    if (avatarFile) formData.append('image', avatarFile);
                    const result = await updateProfile(formData);
                    if (!result.success) {
                      setProfileError(result.message);
                    } else {
                      setShowEditModal(false);
                    }
                  } catch (err) {
                    setProfileError('Unable to update profile.');
                  } finally {
                    setSavingProfile(false);
                  }
                }}
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg bg-[#61dafb] text-white hover:bg-[#4fa8c5] transition disabled:opacity-60"
                type="button"
              >
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


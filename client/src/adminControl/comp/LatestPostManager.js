import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify'; // Removed 'toast' import
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from '../../utils/toastUtils'; // Added showConfirmationToast import
import api from '../../config/api';

const LatestPostManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'image',
    mediaUrl: '',
    isActive: true,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/latest-posts/admin', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        // toast.error('Session expired. Please login again.'); // Original toast error
        window.location.href = '/login';
      } else {
        // toast.error('Failed to fetch posts'); // Original toast error
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      if (selectedFile && (formData.type === 'image' || formData.type === 'video')) {
        submitData.append('file', selectedFile);
        submitData.append('type', formData.type);
      }
      
      submitData.append('title', formData.title);
      submitData.append('body', formData.body);
      submitData.append('type', formData.type);
      submitData.append('isActive', formData.isActive);
      
      if (formData.type === 'youtube' || formData.type === 'text') {
        submitData.append('mediaUrl', formData.mediaUrl);
      }

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (editingPost) {
        await api.put(`/api/latest-posts/${editingPost._id}`, submitData, { headers });
        // toast.success('Post updated successfully!'); // Original toast success
      } else {
        await api.post('/api/latest-posts', submitData, { headers });
        // toast.success('Post created successfully!'); // Original toast success
      }
      
      setFormData({ title: '', body: '', type: 'image', mediaUrl: '', isActive: true });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingPost(null);
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      // const errorMessage = error.response?.data?.message || error.message || 'Failed to save post'; // Original error message
      // toast.error(errorMessage); // Original toast error
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      body: post.body || '',
      type: post.type,
      mediaUrl: post.mediaUrl || '',
      isActive: post.isActive,
    });
    setSelectedFile(null);
    setPreviewUrl(post.mediaUrl || null);
    setShowForm(true);
  };

  const handleDelete = (id) => { // Removed 'async' and 'window.confirm'
    showConfirmationToast('Are you sure you want to delete this post?', async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await api.delete(`/api/latest-posts/${id}`, { headers });
        // toast.success('Post deleted successfully!'); // Original toast success
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        // toast.error('Failed to delete post'); // Original toast error
      }
    });
  };

  const handleCancel = () => {
    setFormData({ title: '', body: '', type: 'image', mediaUrl: '', isActive: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingPost(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600 text-xl">Loading posts...</div>;
  }

  return (
    <>
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 md:flex-row flex-col md:items-center items-start md:gap-0 gap-4">
        <h2 className="m-0 text-gray-800">Latest Posts</h2>
        <button 
          className="px-5 py-2.5 border-none rounded cursor-pointer text-base transition-all duration-300 bg-[#61dafb] text-white hover:bg-[#4fa8c5]"
          onClick={() => {
            setEditingPost(null);
            setFormData({ title: '', body: '', type: 'image', mediaUrl: '', isActive: true });
            setSelectedFile(null);
            setPreviewUrl(null);
            setShowForm(true);
          }}
        >
          + Add New Post
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h3 className="mt-0 mb-5 text-gray-800 text-2xl">{editingPost ? 'Edit Post' : 'Add New Post'}</h3>
            
            <div className="mb-5">
              <label className="block mb-2 text-gray-800 font-medium">Post Type:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full p-2.5 border border-gray-300 rounded text-base box-border cursor-pointer focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
              >
                <option value="image">Image + Text</option>
                <option value="video">Video + Text</option>
                <option value="youtube">YouTube Video</option>
                <option value="text">Text Only</option>
              </select>
            </div>

            {(formData.type === 'image' || formData.type === 'video') && (
              <div className="mb-5">
                <label className="block mb-2 text-gray-800 font-medium">
                  {formData.type === 'image' ? 'Select Image:' : 'Select Video:'}
                </label>
                <input
                  type="file"
                  accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="w-full p-2.5 border-2 border-dashed border-[#61dafb] rounded bg-gray-50 cursor-pointer text-base box-border hover:border-[#4fa8c5] hover:bg-gray-100"
                />
                {previewUrl && (
                  <div className="mt-4 text-center">
                    {formData.type === 'image' ? (
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] rounded-lg shadow-md mt-2.5 mx-auto" />
                    ) : (
                      <video src={previewUrl} controls className="max-w-full max-h-[300px] rounded-lg shadow-md mt-2.5 mx-auto" />
                    )}
                  </div>
                )}
                {editingPost && !selectedFile && editingPost.mediaUrl && (
                  <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-[#61dafb]">
                    <p className="m-0 mb-2.5 text-gray-600 text-sm">Current media will be kept if no new file is selected.</p>
                    {editingPost.type === 'image' ? (
                      <img src={editingPost.mediaUrl} alt="Current" className="max-w-full max-h-[200px] rounded mt-2.5" />
                    ) : (
                      <video src={editingPost.mediaUrl} controls className="max-w-full max-h-[200px] rounded mt-2.5" />
                    )}
                  </div>
                )}
              </div>
            )}

            {(formData.type === 'youtube' || formData.type === 'text') && (
              <div className="mb-5">
                <label className="block mb-2 text-gray-800 font-medium">
                  {formData.type === 'youtube' ? 'YouTube URL:' : 'Content URL (optional):'}
                </label>
                <input
                  type="text"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleChange}
                  placeholder={formData.type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com'}
                  className="w-full p-2.5 border border-gray-300 rounded text-base box-border focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
                />
                {formData.type === 'youtube' && formData.mediaUrl && (
                  <div className="mt-4 text-center">
                    {(() => {
                      let embedUrl = formData.mediaUrl;
                      if (embedUrl.includes('youtu.be/')) {
                        const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (embedUrl.includes('youtube.com/watch')) {
                        const videoId = embedUrl.split('v=')[1]?.split('&')[0];
                        if (videoId) {
                          embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                      } else if (embedUrl.includes('youtube.com/embed/')) {
                        embedUrl = embedUrl.split('?')[0];
                      }
                      return (
                        <iframe
                          src={embedUrl}
                          className="max-w-full w-full h-[300px] rounded-lg shadow-md mt-2.5"
                          frameBorder="0"
                          allowFullScreen
                          title="YouTube preview"
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="mb-5">
              <label className="block mb-2 text-gray-800 font-medium">Title (optional):</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Post title"
                className="w-full p-2.5 border border-gray-300 rounded text-base box-border focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-gray-800 font-medium">Body/Description:</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Post description or content"
                rows="4"
                className="w-full p-2.5 border border-gray-300 rounded text-base box-border focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
              />
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-[18px] h-[18px] cursor-pointer"
                />
                Active
              </label>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button type="submit" className="px-5 py-2.5 border-none rounded cursor-pointer text-base transition-all duration-300 bg-[#61dafb] text-white hover:bg-[#4fa8c5]">
                {editingPost ? 'Update' : 'Create'}
              </button>
              <button type="button" className="px-5 py-2.5 border-none rounded cursor-pointer text-base transition-all duration-300 bg-gray-500 text-white hover:bg-gray-600" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {posts.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-400 text-lg">No posts found. Add your first post!</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] grid-cols-1">
            {posts.map((post) => (
              <div key={post._id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${!post.isActive ? 'opacity-60' : ''}`}>
                <div className="relative w-full bg-black">
                  {post.type === 'image' && post.mediaUrl && (
                    <img src={post.mediaUrl} alt={post.title || 'Post'} className="w-full h-auto block" />
                  )}
                  {post.type === 'video' && post.mediaUrl && (
                    <video src={post.mediaUrl} controls className="w-full h-auto block" />
                  )}
                  {post.type === 'youtube' && post.mediaUrl && (
                    <iframe
                      src={(() => {
                        let embedUrl = post.mediaUrl;
                        if (embedUrl.includes('youtu.be/')) {
                          const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
                          embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (embedUrl.includes('youtube.com/watch')) {
                          const videoId = embedUrl.split('v=')[1]?.split('&')[0];
                          if (videoId) {
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                          }
                        } else if (embedUrl.includes('youtube.com/embed/')) {
                          embedUrl = embedUrl.split('?')[0];
                        }
                        return embedUrl;
                      })()}
                      className="w-full h-[250px]"
                      frameBorder="0"
                      allowFullScreen
                      title={post.title || 'YouTube video'}
                    />
                  )}
                  {post.type === 'text' && (
                    <div className="w-full h-[150px] bg-gray-100 flex items-center justify-center text-gray-500">
                      Text Only
                    </div>
                  )}
                  {!post.isActive && <div className="absolute top-2.5 right-2.5 bg-red-600 text-white px-2.5 py-1.5 rounded text-xs font-bold">Inactive</div>}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-800 m-0 mb-2 capitalize">Type: {post.type}</p>
                  {post.title && <p className="text-gray-800 text-base m-0 mb-2 font-semibold">{post.title}</p>}
                  {post.body && <p className="text-gray-600 text-sm m-0 mb-2">{post.body}</p>}
                  <p className="text-gray-400 text-xs m-0">Created: {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-4 border-t border-gray-200 flex gap-2.5">
                  <button 
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded transition-colors duration-300 hover:bg-green-700"
                    onClick={() => handleEdit(post)}
                  >
                    Edit
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded transition-colors duration-300 hover:bg-red-700"
                    onClick={() => handleDelete(post._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <ToastContainer />
  </>);
};

export default LatestPostManager;

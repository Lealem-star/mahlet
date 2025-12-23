import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from '../../utils/toastUtils';
import api from '../../config/api';

const VideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file');
  const [formData, setFormData] = useState({
    videoUrl: '',
    position: 'left',
    altText: '',
    isActive: true,
  });

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/header-poster/admin/videos');
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
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

  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, videoUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      if (selectedFile) {
        submitData.append('video', selectedFile);
      } else if (uploadMethod === 'url' && formData.videoUrl) {
        submitData.append('videoUrl', formData.videoUrl);
      } else if (!editingVideo) {
        return;
      }
      
      submitData.append('position', formData.position);
      submitData.append('altText', formData.altText);
      submitData.append('isActive', formData.isActive);
      
      if (editingVideo && !selectedFile && !formData.videoUrl) {
        submitData.append('videoUrl', editingVideo.videoUrl);
      }

      if (editingVideo) {
        await api.put(`/api/header-poster/admin/videos/${editingVideo._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/header-poster/admin/videos', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      setFormData({ videoUrl: '', position: 'left', altText: '', isActive: true });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingVideo(null);
      setShowForm(false);
      setUploadMethod('file');
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      position: video.position,
      altText: video.altText,
      isActive: video.isActive,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadMethod(video.videoUrl && video.videoUrl.startsWith('http') ? 'url' : 'file');
    setShowForm(true);
  };

  const handleDelete = (id) => {
    showConfirmationToast('Are you sure you want to delete this video?', async () => {
      try {
        await api.delete(`/api/header-poster/admin/videos/${id}`);
        fetchVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    });
  };

  const handleCancel = () => {
    setFormData({ videoUrl: '', position: 'left', altText: '', isActive: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingVideo(null);
    setShowForm(false);
    setUploadMethod('file');
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600 text-xl">Loading videos...</div>;
  }

  return (
    <>
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 md:flex-row flex-col md:items-center items-start md:gap-0 gap-4">
        <h2 className="m-0 text-gray-800">HeaderPoster Videos</h2>
        <button 
          className="px-5 py-2.5 border-none rounded cursor-pointer text-base transition-all duration-300 bg-[#61dafb] text-white hover:bg-[#4fa8c5]"
          onClick={() => {
            setEditingVideo(null);
            setFormData({ videoUrl: '', position: 'left', altText: '', isActive: true });
            setSelectedFile(null);
            setPreviewUrl(null);
            setUploadMethod('file');
            setShowForm(true);
          }}
        >
          + Add New Video
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h3 className="mt-0 mb-5 text-gray-800 text-2xl">{editingVideo ? 'Edit Video' : 'Add New Video'}</h3>
            
            <div className="mb-5">
              <label className="block mb-2 text-gray-800 font-medium">Position:</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full p-2.5 border border-gray-300 rounded text-base box-border cursor-pointer focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
              >
                <option value="left">Left Side</option>
                <option value="right">Right Side</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-gray-800 font-medium">Upload Method:</label>
              <div className="flex gap-2.5 mb-2.5">
                <button
                  type="button"
                  className={`flex-1 px-5 py-3 border-2 rounded cursor-pointer text-base transition-all duration-300 ${
                    uploadMethod === 'file' 
                      ? 'border-[#61dafb] bg-[#61dafb] text-white' 
                      : 'border-gray-300 bg-white text-gray-800 hover:border-[#61dafb] hover:bg-blue-50'
                  }`}
                  onClick={() => handleUploadMethodChange('file')}
                >
                  Upload from Device
                </button>
                <button
                  type="button"
                  className={`flex-1 px-5 py-3 border-2 rounded cursor-pointer text-base transition-all duration-300 ${
                    uploadMethod === 'url' 
                      ? 'border-[#61dafb] bg-[#61dafb] text-white' 
                      : 'border-gray-300 bg-white text-gray-800 hover:border-[#61dafb] hover:bg-blue-50'
                  }`}
                  onClick={() => handleUploadMethodChange('url')}
                >
                  Use Video URL
                </button>
              </div>
            </div>

            {uploadMethod === 'file' && (
              <div className="mb-5">
                <label className="block mb-2 text-gray-800 font-medium">Select Video File:</label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileChange}
                  className="w-full p-2.5 border-2 border-dashed border-[#61dafb] rounded bg-gray-50 cursor-pointer text-base box-border hover:border-[#4fa8c5] hover:bg-gray-100"
                />
                {previewUrl && (
                  <div className="mt-4 text-center">
                    <video src={previewUrl} controls className="max-w-full max-h-[300px] rounded-lg shadow-md mt-2.5 mx-auto" />
                  </div>
                )}
                {editingVideo && !selectedFile && (
                  <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-[#61dafb]">
                    <p className="m-0 mb-2.5 text-gray-600 text-sm">Current video will be kept if no new file is selected.</p>
                    <video src={editingVideo.videoUrl} controls className="max-w-full max-h-[200px] rounded mt-2.5" />
                  </div>
                )}
              </div>
            )}

            {uploadMethod === 'url' && (
              <div className="mb-5">
                <label className="block mb-2 text-gray-800 font-medium">Video URL:</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/video.mp4 or /videos/video.mp4"
                  required={!editingVideo}
                  className="w-full p-2.5 border border-gray-300 rounded text-base box-border focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
                />
                {formData.videoUrl && (
                  <div className="mt-4 text-center">
                    <video src={formData.videoUrl} controls className="max-w-full max-h-[300px] rounded-lg shadow-md mt-2.5 mx-auto" onError={(e) => {
                      e.target.style.display = 'none';
                    }} />
                  </div>
                )}
              </div>
            )}

            <div className="mb-5">
              <label className="block mb-2 text-gray-800 font-medium">Alt Text:</label>
              <input
                type="text"
                name="altText"
                value={formData.altText}
                onChange={handleChange}
                placeholder="Description of the video"
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
                {editingVideo ? 'Update' : 'Create'}
              </button>
              <button type="button" className="px-5 py-2.5 border-none rounded cursor-pointer text-base transition-all duration-300 bg-gray-500 text-white hover:bg-gray-600" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {videos.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-400 text-lg">No videos found. Add your first video!</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] grid-cols-1">
            {videos.map((video) => (
              <div key={video._id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${!video.isActive ? 'opacity-60' : ''}`}>
                <div className="relative w-full bg-black">
                  <video 
                    src={video.videoUrl} 
                    controls
                    className="w-full h-auto block"
                    onError={(e) => {
                      e.target.src = '';
                    }}
                  />
                  {!video.isActive && <div className="absolute top-2.5 right-2.5 bg-red-600 text-white px-2.5 py-1.5 rounded text-xs font-bold">Inactive</div>}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-800 m-0 mb-2 capitalize">Position: {video.position}</p>
                  <p className="text-gray-600 text-sm m-0 mb-2">{video.altText}</p>
                  <p className="text-gray-400 text-xs m-0 break-all font-mono">{video.videoUrl}</p>
                </div>
                <div className="p-4 border-t border-gray-200 flex gap-2.5">
                  <button 
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded transition-colors duration-300 hover:bg-green-700"
                    onClick={() => handleEdit(video)}
                  >
                    Edit
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded transition-colors duration-300 hover:bg-red-700"
                    onClick={() => handleDelete(video._id)}
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

export default VideoManager;

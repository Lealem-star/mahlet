import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify'; // Removed 'toast' import
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from '../../utils/toastUtils'; // Added showConfirmationToast import
import api from '../../config/api';

const ImageManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [formData, setFormData] = useState({
    imageUrl: '',
    altText: '',
    order: 0,
    isActive: true,
  });

  // Fetch all images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/header-poster/admin/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
      if (error.response?.status === 401) {
        // toast.error('Session expired. Please login again.'); // Original toast error
        window.location.href = '/login';
      } else {
        // toast.error('Failed to fetch images'); // Original toast error
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload method change
  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (method === 'url') {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    } else {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      // Add file if selected
      if (selectedFile) {
        submitData.append('image', selectedFile);
      } else if (uploadMethod === 'url' && formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      } else if (!editingImage) {
        // For new images, require either file or URL
        // toast.error('Please either upload an image file or provide an image URL'); // Original toast error
        return;
      }
      
      // Add other form data
      submitData.append('altText', formData.altText);
      submitData.append('order', formData.order);
      submitData.append('isActive', formData.isActive);
      
      // If editing and no new file/URL, still send the existing URL
      if (editingImage && !selectedFile && !formData.imageUrl) {
        submitData.append('imageUrl', editingImage.imageUrl);
      }

      if (editingImage) {
        // Update existing image
        await api.put(`/api/header-poster/admin/images/${editingImage._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // toast.success('Image updated successfully!'); // Original toast success
      } else {
        // Create new image
        await api.post('/api/header-poster/admin/images', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // toast.success('Image created successfully!'); // Original toast success
      }
      
      // Reset form and refresh list
      setFormData({ imageUrl: '', altText: '', order: 0, isActive: true });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingImage(null);
      setShowForm(false);
      setUploadMethod('file');
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      // const errorMessage = error.response?.data?.message || error.message || 'Failed to save image'; // Original error message
      // toast.error(errorMessage);
    }
  };

  // Handle edit
  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      imageUrl: image.imageUrl,
      altText: image.altText,
      order: image.order,
      isActive: image.isActive,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    // Determine upload method based on existing image
    setUploadMethod(image.imageUrl && image.imageUrl.startsWith('http') ? 'url' : 'file');
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (id) => { // Removed 'async' and 'window.confirm'
    showConfirmationToast('Are you sure you want to delete this image?', async () => {
      try {
        await api.delete(`/api/header-poster/admin/images/${id}`);
        // toast.success('Image deleted successfully!'); // Original toast success
        fetchImages();
      } catch (error) {
        console.error('Error deleting image:', error);
        // toast.error('Failed to delete image'); // Original toast error
      }
    });
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ imageUrl: '', altText: '', order: 0, isActive: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingImage(null);
    setShowForm(false);
    setUploadMethod('file');
  };

  const removeDataPrefix = (url) => {
    if (url && url.startsWith('data:')) {
      return '[Data URL - truncated]'; // Or return url.substring(url.indexOf(',') + 1) if full data is needed
    }
    return url;
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600 text-xl">Loading images...</div>;
  }

  return (
    <>
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 md:flex-row flex-col md:items-center items-start md:gap-0 gap-4">
        <h2 className="m-0 text-gray-800">HeaderPoster Images</h2>
        <button 
          className="px-5 py-2.5 border-none rounded cursor-pointer text-base transition-all duration-300 bg-[#61dafb] text-white hover:bg-[#4fa8c5]"
          onClick={() => {
            setEditingImage(null);
            setFormData({ imageUrl: '', altText: '', order: 0, isActive: true });
            setSelectedFile(null);
            setPreviewUrl(null);
            setUploadMethod('file');
            setShowForm(true);
          }}
        >
          + Add New Image
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h3 className="mt-0 mb-5 text-gray-800 text-2xl">{editingImage ? 'Edit Image' : 'Add New Image'}</h3>
            
            {/* Upload Method Selection */}
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
                  Use Image URL
                </button>
              </div>
            </div>

            {/* File Upload */}
            {uploadMethod === 'file' && (
              <div className="mb-5">
                <label className="block mb-2 text-gray-800 font-medium">Select Image File:</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="w-full p-2.5 border-2 border-dashed border-[#61dafb] rounded bg-gray-50 cursor-pointer text-base box-border hover:border-[#4fa8c5] hover:bg-gray-100"
                />
                {previewUrl && (
                  <div className="mt-4 text-center">
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] rounded-lg shadow-md mt-2.5 mx-auto" />
                  </div>
                )}
                {editingImage && !selectedFile && (
                  <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-[#61dafb]">
                    <p className="m-0 mb-2.5 text-gray-600 text-sm">Current image will be kept if no new file is selected.</p>
                    <img src={editingImage.imageUrl} alt="Current" className="max-w-full max-h-[200px] rounded mt-2.5" />
                  </div>
                )}
              </div>
            )}

            {/* URL Input */}
            {uploadMethod === 'url' && (
              <div className="mb-5">
                <label className="block mb-2 text-gray-800 font-medium">Image URL:</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg or /images/image.jpg"
                  required={!editingImage}
                  className="w-full p-2.5 border border-gray-300 rounded text-base box-border focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
                />
                {formData.imageUrl && (
                  <div className="mt-4 text-center">
                    <img src={formData.imageUrl} alt="Preview" className="max-w-full max-h-[300px] rounded-lg shadow-md mt-2.5 mx-auto" onError={(e) => {
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
                placeholder="Description of the image"
                className="w-full p-2.5 border border-gray-300 rounded text-base box-border focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-gray-800 font-medium">Order:</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
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
                {editingImage ? 'Update' : 'Create'}
              </button>
              <button type="button" className="px-5 py-2.5 border-none rounded cursor-pointer text-base transition-all duration-300 bg-gray-500 text-white hover:bg-gray-600" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {images.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-400 text-lg">No images found. Add your first image!</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] grid-cols-1">
            {images.map((image) => (
              <div key={image._id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${!image.isActive ? 'opacity-60' : ''}`}>
                <div className="relative w-full h-[200px] overflow-hidden bg-gray-100">
                  <img 
                    src={image.imageUrl} 
                    alt={image.altText}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x200?text=Image+Not+Found';
                    }}
                  />
                  {!image.isActive && <div className="absolute top-2.5 right-2.5 bg-red-600 text-white px-2.5 py-1.5 rounded text-xs font-bold">Inactive</div>}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-800 m-0 mb-2">{image.altText}</p>
                  <p className="text-gray-600 text-sm m-0 mb-2">Order: {image.order}</p>
                  <p className="text-gray-400 text-xs m-0 break-all font-mono">{removeDataPrefix(image.imageUrl)}</p>
                </div>
                <div className="p-4 border-t border-gray-200 flex gap-2.5">
                  <button 
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded transition-colors duration-300 hover:bg-green-700"
                    onClick={() => handleEdit(image)}
                  >
                    Edit
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded transition-colors duration-300 hover:bg-red-700"
                    onClick={() => handleDelete(image._id)}
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

export default ImageManager;

import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../config/api';

const ContactMessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = { source: 'partner' };
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/api/subscribers/admin', { params });
      // Sort: unread first, then by date (newest first)
      const sorted = response.data.sort((a, b) => {
        // First sort by read status (unread first)
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        // Then sort by date (newest first)
        const aDate = new Date(a.createdAt || a.subscribedAt).getTime();
        const bDate = new Date(b.createdAt || b.subscribedAt).getTime();
        return bDate - aDate;
      });
      setMessages(sorted);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch contact messages');
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (id, currentReadStatus) => {
    try {
      await api.put(`/api/subscribers/admin/${id}`, {
        read: !currentReadStatus,
      });
      fetchMessages();
      toast.success(currentReadStatus ? 'Message marked as unread!' : 'Message marked as read!');
    } catch (error) {
      console.error('Error updating read status:', error);
      toast.error('Failed to update read status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await api.delete(`/api/subscribers/admin/${id}`);
      toast.success('Message deleted successfully!');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-600 text-xl">Loading messages...</div>;
  }

  return (
    <>
    <div className="w-full">
      <div className="flex flex-row items-center justify-between gap-4 mb-8">
        <h2 className="m-0 text-gray-800 text-xl md:text-2xl font-semibold flex-shrink-0">Contact Messages</h2>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-sm md:text-base focus:outline-none focus:border-[#61dafb] focus:ring-2 focus:ring-[#61dafb]/20"
          />
        </div>
      </div>

      <div className="mt-8">
        {messages.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-400 text-lg">
            No contact messages found.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message._id} 
                className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
                  !message.read ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800 m-0">
                        {message.name || 'Anonymous'}
                      </h3>
                      {!message.read && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                          NEW
                        </span>
                      )}
                      {message.read && (
                        <span className="px-2 py-0.5 bg-gray-300 text-gray-700 text-xs rounded-full">
                          READ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 m-0 mb-1">{message.email}</p>
                    {(() => {
                      // Extract phone number from notes if it exists
                      if (message.notes) {
                        const phoneMatch = message.notes.match(/^Phone:\s*([^\n]+)/i);
                        if (phoneMatch) {
                          return (
                            <p className="text-sm text-blue-600 font-medium m-0">
                              📞 {phoneMatch[1]}
                            </p>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 m-0">
                      {new Date(message.createdAt || message.subscribedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 m-0 mt-1">
                      {new Date(message.createdAt || message.subscribedAt).toLocaleTimeString()}
                    </p>
                    {message.subscribed && (
                      <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Subscribed
                      </span>
                    )}
                  </div>
                </div>
                
                {message.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {(() => {
                        // Remove phone number line from notes display if it exists
                        const notes = message.notes;
                        if (notes.match(/^Phone:\s*[^\n]+\n\n/i)) {
                          return notes.replace(/^Phone:\s*[^\n]+\n\n/i, '').trim() || 'No additional message.';
                        }
                        return notes;
                      })()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    className={`px-4 py-2 text-white text-sm rounded transition-colors duration-300 ${
                      message.read
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    onClick={() => handleMarkAsRead(message._id, message.read)}
                  >
                    {message.read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded transition-colors duration-300 hover:bg-red-700"
                    onClick={() => handleDelete(message._id)}
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

export default ContactMessagesManager;


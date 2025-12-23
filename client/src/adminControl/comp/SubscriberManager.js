import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from '../../utils/toastUtils'; // Added showConfirmationToast import
import api from '../../config/api';

const SubscriberManager = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, subscribed, unsubscribed
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: '',
    message: '',
    sendToAll: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    source: 'homepage',
    tags: '',
    notes: '',
    subscribed: true,
  });

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.subscribed = filter === 'subscribed';
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/api/subscribers/admin', { params });
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      if (error.response?.status === 401) {
        // toast.error('Session expired. Please login again.'); // Original toast error
        window.location.href = '/login';
      } else {
        // toast.error('Failed to fetch subscribers'); // Original toast error
      }
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/api/subscribers/admin/subscribers/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [fetchSubscribers, fetchStats]);

  const handleEdit = (subscriber) => {
    setEditingSubscriber(subscriber);
    setFormData({
      name: subscriber.name || '',
      source: subscriber.source || 'homepage',
      tags: subscriber.tags?.join(', ') || '',
      notes: subscriber.notes || '',
      subscribed: subscriber.subscribed,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      };

      await api.put(`/api/subscribers/admin/${editingSubscriber._id}`, updateData);
      toast.success('Mailing list entry updated successfully!');
      setEditingSubscriber(null);
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      console.error('Error updating mailing list entry:', error);
      // toast.error('Failed to update mailing list entry'); // Original toast error
    }
  };

  const handleDelete = (id) => { // Removed 'async' and 'window.confirm'
    showConfirmationToast('Are you sure you want to delete this mailing list entry?', async (closeToast) => {
      try {
        await api.delete(`/api/subscribers/admin/${id}`);
        toast.success('Mailing list entry deleted successfully!');
        fetchSubscribers();
        fetchStats();
      } catch (error) {
        console.error('Error deleting mailing list entry:', error);
        toast.error('Failed to delete mailing list entry');
      } finally {
        closeToast();
      }
    });
  };

  const exportSubscribers = () => {
    const csv = [
      ['Email', 'Name', 'Source', 'Status', 'Joined At'].join(','),
      ...subscribers.map(s => [
        s.email,
        s.name || '',
        s.source || '',
        s.subscribed ? 'Fan' : 'Partner',
        s.subscribedAt || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mailing-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    showConfirmationToast(`Are you sure you want to send this message to ${broadcastForm.sendToAll ? 'ALL' : 'FANS'}?`, async (closeToast) => {
      setSendingBroadcast(true);
      try {
        const response = await api.post('/api/subscribers/admin/broadcast', broadcastForm);
        
        // Show detailed results
        let message = response.data.message || 'Broadcast sent successfully!';
        if (response.data.results && response.data.results.errors && response.data.results.errors.length > 0) {
          const errorDetails = response.data.results.errors.map(e => `${e.email}: ${e.error}`).join('\n');
          message += `\n\nErrors:\n${errorDetails}`;
          console.error('Broadcast errors:', response.data.results.errors);
        }
        
        toast.info(message);
        
        // Only close modal if all emails sent successfully
        if (response.data.results && response.data.results.failed === 0) {
          setShowBroadcastModal(false);
          setBroadcastForm({ subject: '', message: '', sendToAll: false });
        }
      } catch (error) {
        console.error('Error sending broadcast:', error);
        const errorMessage = error.response?.data?.message || 'Failed to send broadcast';
        toast.error(errorMessage + '\n\nCheck server console for details.');
      } finally {
        setSendingBroadcast(false);
        closeToast();
      }
    });
  };

  if (loading && !stats) {
    return <div className="text-center py-10 text-gray-600 text-xl">Loading mailing list...</div>;
  }

  return (
    <>
    <div className="w-full">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Mailing List</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.subscribed}</div>
            <div className="text-sm text-gray-600">Fans</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{stats.unsubscribed}</div>
            <div className="text-sm text-gray-600">Partners</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {stats.total > 0 ? ((stats.subscribed / stats.total) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Fan Engagement</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#61dafb] focus:border-[#61dafb]"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#61dafb] focus:border-[#61dafb]"
          >
            <option value="all">All</option>
            <option value="subscribed">Fans</option>
            <option value="unsubscribed">Partners</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 bg-[#61dafb] text-white rounded hover:bg-[#4fa8c5] transition-colors duration-300 text-sm font-medium"
          >
            📧 Send Broadcast
          </button>
          <button
            onClick={exportSubscribers}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSubscriber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setEditingSubscriber(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Mailing List Entry</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={editingSubscriber.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
                >
                  <option value="homepage">Homepage</option>
                  <option value="partner">Partner</option>
                  <option value="fan">Fan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="fan, partner, interested"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.subscribed}
                  onChange={(e) => setFormData({ ...formData, subscribed: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Fan (Subscribed)</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#61dafb] text-white rounded hover:bg-[#4fa8c5] transition-colors duration-300"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSubscriber(null)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mailing List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No mailing list entries found
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className={!subscriber.subscribed ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {subscriber.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscriber.subscribed ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Fan
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Partner
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(subscriber)}
                        className="text-[#61dafb] hover:text-[#4fa8c5] mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subscriber._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowBroadcastModal(false);
                setBroadcastForm({ subject: '', message: '', sendToAll: false });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4">Send Broadcast Message</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a message to {broadcastForm.sendToAll ? 'all' : 'fans'} ({stats?.subscribed || 0} fans, {stats?.unsubscribed || 0} partners)
            </p>
            
            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
                  placeholder="Email subject line"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  required
                  rows="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
                  placeholder="Your message content (supports line breaks)"
                />
                <p className="text-xs text-gray-500 mt-1">Line breaks will be preserved in the email.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={broadcastForm.sendToAll}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, sendToAll: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="sendToAll" className="text-sm text-gray-700">
                  Send to all (including partners)
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">⚠️ Important:</p>
                <p>This will send an email to {broadcastForm.sendToAll ? stats?.total || 0 : stats?.subscribed || 0} {broadcastForm.sendToAll ? 'recipient(s)' : 'fan(s)'}. Make sure your email service is configured in the server environment variables.</p>
                <p className="mt-2 text-xs">
                  <strong>If emails fail:</strong> Check your server console for detailed error messages. Common issues: incorrect SMTP credentials, email service not configured, or invalid email addresses.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="flex-1 px-4 py-2 bg-[#61dafb] text-white rounded hover:bg-[#4fa8c5] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBroadcastModal(false);
                    setBroadcastForm({ subject: '', message: '', sendToAll: false });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    <ToastContainer />
  </>);
};

export default SubscriberManager;
